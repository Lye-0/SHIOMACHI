import { describe, it, expect } from "vitest";
import { act, parseSave } from "../src/game/engine";
import { newGame, channels, type Game } from "../src/game/model";

function ready() {
  const g = newGame();
  Object.assign(g, {
    started: true,
    shutterOpen: true,
    room: "dock",
    water: 2,
    boatInside: true,
    boatOutside: true,
    boatDry: true,
    lampLit: true,
    gateOpen: true,
  });
  return act(g, { type: "board" }).game;
}
function plot(path: string[]) {
  let g = ready();
  for (const node of path) g = act(g, { type: "routePoint", node }).game;
  return g;
}
function allPaths(start: string) {
  const out: string[][] = [];
  function walk(p: string[]) {
    const at = p.at(-1)!;
    if (at === "T") {
      out.push(p);
      return;
    }
    for (const [a, b] of channels) {
      const next = a === at ? b : b === at ? a : null;
      if (next && !p.includes(next)) walk([...p, next]);
    }
  }
  walk([start]);
  return out;
}
describe("一括航路", () => {
  it("全候補経路を列挙して安全な六区間だけが到達する", () => {
    const paths = [...allPaths("S"), ...allPaths("X")];
    expect(paths.length).toBeGreaterThan(20);
    const winners = paths.filter(
      (p) => act(plot(p), { type: "depart" }).game.ended,
    );
    expect(winners).toEqual([["S", "B", "C", "E", "G", "H", "T"]]);
  });
  it.each([
    [["S", "A", "T"], 0, "shallow", "A"],
    [["S", "B", "D", "T"], 1, "shallow", "D"],
    [["S", "B", "C", "F", "T"], 2, "beam", "F"],
    [["S", "B", "C", "E", "F", "T"], 3, "shallow", "F"],
    [["S", "B", "C", "E", "G", "T"], 4, "shallow", "T"],
    [["X", "A", "T"], 0, "heading", "S"],
  ] as const)("最初の障害だけで止める %j", (path, leg, reason, node) => {
    const g = act(plot([...path]), { type: "depart" }).game;
    expect(g.ended).toBe(false);
    expect(g.failureLeg).toBe(leg);
    expect(g.voyageFailure).toBe(reason);
    expect(g.seaNode).toBe(node);
    expect(act(g, { type: "depart" }).game.seaNode).toBe(node);
    expect(act(g, { type: "routeClear" }).game.routePlan).toEqual(path);
    const back = act(g, { type: "returnDock" }).game;
    expect(back.routePlan).toEqual(path);
    expect(back.boarded).toBe(true);
  });
  it("未完と不連続を拒否し、選択済みの標ならそこまで戻す", () => {
    let g = ready();
    g = act(g, { type: "routePoint", node: "C" }).game;
    expect(g.routePlan).toEqual([]);
    g = act(g, { type: "routePoint", node: "S" }).game;
    g = act(g, { type: "routePoint", node: "T" }).game;
    expect(g.routePlan).toEqual(["S"]);
    expect(act(g, { type: "depart" }).game.atSea).toBe(false);
    g = act(g, { type: "routePoint", node: "B" }).game;
    expect(act(g, { type: "routePoint", node: "S" }).game.routePlan).toEqual([
      "S",
    ]);
  });
  it("計測値は情報であり誤入力を船の物理的な喫水に使わない", () => {
    const g = plot(["S", "B", "D", "T"]);
    g.rodMark = 0;
    g.waterMark = 1;
    expect(act(g, { type: "depart" }).game.voyageFailure).toBe("shallow");
  });
  it("旧セーブの十cm目盛りを移行し、航行途中は船着き場へ戻す", () => {
    const old = JSON.parse(JSON.stringify(ready()));
    for (const k of [
      "navigationVersion",
      "boarded",
      "routePlan",
      "failureLeg",
      "voyageFailure",
    ])
      delete old[k];
    old.waterMark = 5;
    old.rodMark = 0;
    old.atSea = true;
    old.seaNode = "C";
    const g = parseSave(JSON.stringify(old))!;
    expect(g.waterMark).toBe(50);
    expect(g.atSea).toBe(false);
    expect(g.boarded).toBe(true);
    expect(g.seaNode).toBe("S");
    expect(parseSave(JSON.stringify(g))).toEqual(g);
  });
  it("計画と失敗は保存でき、不正な航路は復元しない", () => {
    const g = act(plot(["S", "B", "D", "T"]), { type: "depart" }).game;
    expect(parseSave(JSON.stringify(g))).toEqual(g);
    for (const routePlan of [["S", "T"], ["S", "B", "S"], ["oops"]])
      expect(parseSave(JSON.stringify({ ...g, routePlan }))).toBeNull();
  });
});

it("完成した航路も途中の標まで戻して修正できる", () => {
  const g = plot(["S", "B", "C", "E", "G", "H", "T"]);
  const back = act(g, { type: "routePoint", node: "C" }).game;
  expect(back.routePlan).toEqual(["S", "B", "C"]);
  expect(act(back, { type: "routePoint", node: "F" }).game.routePlan).toEqual([
    "S",
    "B",
    "C",
    "F",
  ]);
});
