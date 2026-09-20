import { describe, expect, it } from "vitest";
import { act, parseSave } from "../src/game/engine";
import {
  blocks,
  canSlide,
  channels,
  freePontoon,
  newGame,
  raised,
  type Action,
  type Game,
} from "../src/game/model";
import { projection, chartPoints } from "../src/game/bearings";
import { boatDraft } from "../src/game/hull";

function run(g: Game, ...actions: Action[]) {
  return actions.reduce((state, a) => act(state, a).game, g);
}
describe("物理状態と情報を分離する", () => {
  it("見た手掛かりを操作不要で記録し、未完成の図面は解答を先に見せない", () => {
    let g = newGame();
    g.room = "office";
    g = run(g, { type: "inspect", detail: "diagram" });
    expect(g.records.diagram).toBeUndefined();
    g.papers = [0, 1, 2, 3];
    g.paperTurns = [0, 0, 0, 3];
    g = run(g, { type: "paperRotate", index: 3 });
    expect(g.records.diagram).toBeDefined();
    for (const [room, detail, id] of [
      ["office", "shore", "pipe-map"],
      ["service", "shore", "fallen-beam"],
      ["concourse", "window", "pontoon"],
      ["lookout", "survey", "bearings"],
      ["lookout", "chart", "chart"],
    ] as const) {
      g.room = room;
      g = run(g, { type: "inspect", detail });
      expect(g.records[id]).toBeDefined();
    }
    g.room = "dock";
    g.items.chalk = "inventory";
    g = run(
      g,
      { type: "inspect", detail: "trace" },
      { type: "trace", tool: "chalk" },
    );
    expect(g.records.tracing).toBeDefined();
    g.water = 2;
    g.boatInside = g.boatOutside = g.boatDry = true;
    g = run(g, { type: "inspect", detail: "boat" });
    expect(g.records.waterline.water).toBe(2);
  });
  it("観察中の変更は自動で更新し、他の場所への移動や保存再開では記録を維持する", () => {
    let g = newGame();
    g.room = "lookout";
    g = run(
      g,
      { type: "inspect", detail: "survey" },
      { type: "surveyPosition", value: 2 },
    );
    expect(g.records.bearings.view).toBe(2);
    g = run(
      g,
      { type: "inspect", detail: "chart" },
      { type: "chartMark", node: "A" },
      { type: "chartMark", node: "E" },
    );
    expect(g.records.chart.chartMarks).toEqual(["A", "E"]);
    g = run(g, { type: "back" });
    g.chartMarks = [];
    expect(g.records.chart.chartMarks).toEqual(["A", "E"]);
    expect(parseSave(JSON.stringify(g))?.records.chart.chartMarks).toEqual([
      "A",
      "E",
    ]);
  });
  it("船溜まりは左右で拡大せず、旧裏向きセーブも進行を保持して全景に戻す", () => {
    const g = newGame();
    g.room = "dock";
    expect(run(g, { type: "face" }).face).toBe(0);
    g.face = 1;
    g.detail = "gate";
    g.boatOutside = true;
    const restored = parseSave(JSON.stringify(g));
    expect(restored?.face).toBe(0);
    expect(restored?.detail).toBe("gate");
    expect(restored?.boatOutside).toBe(true);
    g.room = "office";
    expect(run(g, { type: "face" }).face).toBe(0);
  });
  it("船灯のつまみはガラスを清掃せず、取り付け後もガラスを拭いて点灯できる", () => {
    const g = newGame();
    g.items.lens = "inventory";
    const mounted = run(
      g,
      { type: "mountLamp", tool: "lens" },
      { type: "lightLamp" },
    );
    expect(mounted.lensClean).toBe(false);
    expect(mounted.lampLit).toBe(false);
    const lit = run(mounted, { type: "cleanLens" }, { type: "lightLamp" });
    expect(lit.lensClean).toBe(true);
    expect(lit.lampLit).toBe(true);
  });
  it("地図の記録は後の線の消去で変わらず、保存再開と旧形式に対応する", () => {
    const g = newGame();
    g.chartMarks = ["A", "E", "B", "D"];
    const recorded = act(g, { type: "record", id: "chart" }).game;
    const cleared = act(recorded, { type: "chartClear" }).game;
    expect(cleared.chartMarks).toEqual([]);
    expect(cleared.records.chart.chartMarks).toEqual(["A", "E", "B", "D"]);
    expect(
      parseSave(JSON.stringify(cleared))?.records.chart.chartMarks,
    ).toEqual(["A", "E", "B", "D"]);
    delete cleared.records.chart.chartMarks;
    expect(parseSave(JSON.stringify(cleared))).not.toBeNull();
  });
  it("見通しの交点が二つの船着き場を区別し、それぞれの安全な最初の水路が異なる", () => {
    const onLine = (port: string, a: string, b: string) => {
      const p = chartPoints[port],
        q = chartPoints[a],
        r = chartPoints[b];
      return (
        Math.abs(
          (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]),
        ) < 1e-6
      );
    };
    expect(onLine("S", "A", "E") && onLine("S", "B", "D")).toBe(true);
    expect(onLine("X", "A", "E") && onLine("X", "B", "D")).toBe(false);
    const safe = (port: string) =>
      channels
        .filter(
          ([a, b, z, blocked]) =>
            (a === port || b === port) && !blocked && 3 - z >= boatDraft - 1e-9,
        )
        .map(([a, b]) => (a === port ? b : a));
    expect(safe("S")).toEqual(["B"]);
    expect(safe("X")).toEqual(["A"]);
  });
  it("岸上の予備型は高水位でも写せ、観察時の記録は後の水位操作で変わらない", () => {
    const g = newGame();
    g.water = 2;
    g.items.chalk = "inventory";
    const traced = act(g, { type: "trace", tool: "chalk" }).game;
    expect(traced.tracing).toBe(true);
    const recorded = act(traced, { type: "record", id: "pontoon" }).game;
    recorded.room = "pump";
    recorded.beltTested = true;
    recorded.strainerClear = true;
    recorded.valves = [true, false, true];
    recorded.target = 0;
    const drained = act(recorded, { type: "pump" }).game;
    expect(drained.water).toBe(0);
    expect(drained.records.pontoon.water).toBe(2);
    expect(drained.records.pontoon.raised).toBe(false);
  });
  it("情報を一切読まなくても復旧済みの浮体は上がり、未復旧なら上がらない", () => {
    const g = newGame();
    g.room = "pump";
    g.shutterOpen = true;
    g.valves = [false, true, false];
    g.target = 2;
    g.patchMounted = true;
    g.patchBolts = [true, true, true, true];
    g.tankDry = true;
    g.pins = [false, false];
    const high = act(g, { type: "pump" });
    expect(high.transition).toBe("rise");
    expect(raised(high.game)).toBe(true);
    expect(high.game.seen).toEqual([]);
    g.pins[0] = true;
    expect(raised(act(g, { type: "pump" }).game)).toBe(false);
    g.pins[0] = false;
    g.patchBolts[2] = false;
    expect(raised(act(g, { type: "pump" }).game)).toBe(false);
  });
  it("注水と排水を逆に使えず、水門を開いたまま排水できない", () => {
    const g = newGame();
    g.room = "pump";
    g.beltTested = true;
    g.strainerClear = true;
    g.valves = [true, false, true];
    g.target = 2;
    expect(act(g, { type: "pump" }).game.water).toBe(1);
    g.water = 2;
    g.target = 0;
    g.gateOpen = true;
    expect(act(g, { type: "pump" }).game.water).toBe(2);
    const closed = run(g, { type: "gate" }, { type: "pump" });
    expect(closed.water).toBe(0);
  });
  it("固定具の荷重を受け、ピンを抜き、支持脚を戻して初めて自由になる", () => {
    const g = newGame();
    g.water = 0;
    g.items.crank = "inventory";
    expect(act(g, { type: "pin", index: 0 }).game.pins).toEqual([true, true]);
    const released = run(
      g,
      ...[0, 1].flatMap(
        (index) =>
          [
            { type: "support", index, direction: 1, tool: "crank" },
            { type: "support", index, direction: 1, tool: "crank" },
            { type: "pin", index },
            { type: "support", index, direction: -1, tool: "crank" },
            { type: "support", index, direction: -1, tool: "crank" },
          ] as Action[],
      ),
    );
    expect(freePontoon(released)).toBe(true);
  });
  it("取り忘れた物はその場に残り、取得と開錠を混同しない", () => {
    const g = newGame();
    g.room = "office";
    g.keyTurn = 1;
    const opened = run(
      g,
      { type: "inspect", detail: "drawer" },
      { type: "openDrawer" },
      { type: "back" },
    );
    expect(opened.items.crank).toBe("drawer");
    const taken = run(
      opened,
      { type: "inspect", detail: "drawer" },
      { type: "take", item: "crank" },
      { type: "take", item: "crank" },
    );
    expect(taken.items.crank).toBe("inventory");
  });
  it("鉤を分解して棒を計測に再利用でき、道具が複製されない", () => {
    const g = newGame();
    g.items.rod = "inventory";
    g.items.hookTip = "inventory";
    const hooked = run(g, { type: "combine", a: "rod", b: "hookTip" });
    expect(hooked.items.rod).toBe("installed");
    const separated = run(hooked, { type: "separate", item: "hook" });
    expect(separated.items.hook).toBe("absent");
    expect(separated.items.rod).toBe("inventory");
  });
});
describe("短問と出航", () => {
  it("収納材の初期配置は重ならず、検査した7手で取り出せる", () => {
    let g = newGame();
    const occupied = new Set<string>();
    blocks.forEach((b, i) => {
      for (let n = 0; n < b.length; n++) {
        const cell =
          b.axis === "x"
            ? `${g.tray[i] + n},${b.fixed}`
            : `${b.fixed},${g.tray[i] + n}`;
        expect(occupied.has(cell)).toBe(false);
        occupied.add(cell);
      }
    });
    for (const [index, value] of [
      [7, 0],
      [5, 4],
      [2, 0],
      [3, 0],
      [4, 3],
      [1, 3],
      [0, 4],
    ]) {
      expect(canSlide(g.tray, index, value)).toBe(true);
      g = act(g, { type: "slide", index, value }).game;
    }
    expect(act(g, { type: "openTray" }).game.trayOpen).toBe(true);
  });
  it("全条件で通れる航路は一本、異なる根拠を除けば複数になる", () => {
    function paths(ignoreDepth = false, ignoreBeam = false) {
      const found: string[] = [];
      function walk(at: string, visited: string[]) {
        if (at === "T") {
          found.push(visited.join(""));
          return;
        }
        for (const [a, b, z, beam] of channels) {
          if ((!ignoreDepth && 3 - z < 0.5) || (!ignoreBeam && beam)) continue;
          const n = a === at ? b : b === at ? a : null;
          if (n && !visited.includes(n)) walk(n, [...visited, n]);
        }
      }
      walk("S", ["S"]);
      return found;
    }
    expect(paths()).toEqual(["SBCEGHT"]);
    expect(paths(false, true)).toHaveLength(2);
    expect(paths(true, false).length).toBeGreaterThan(1);
  });
  it("出港後の連打では分岐を進めず、帰還して航路を引き直す", () => {
    let g = newGame();
    g.water = 2;
    g.boatInside = g.boatOutside = g.boatDry = g.lampLit = g.gateOpen = true;
    g = run(
      g,
      { type: "board" },
      ...["S", "A", "T"].map(
        (node) => ({ type: "routePoint", node }) as Action,
      ),
      { type: "depart" },
    );
    expect(g.voyageFailure).toBe("shallow");
    expect(g.failureLeg).toBe(0);
    const stopped = run(
      g,
      { type: "sail", node: "B" },
      { type: "routePoint", node: "B" },
      { type: "depart" },
    );
    expect(stopped.seaNode).toBe("A");
    expect(stopped.ended).toBe(false);
    g = run(g, { type: "returnDock" });
    expect(g.routePlan).toEqual(["S", "A", "T"]);
    g = run(
      g,
      { type: "routeClear" },
      ...["S", "B", "C", "E", "G", "H", "T"].map(
        (node) => ({ type: "routePoint", node }) as Action,
      ),
      { type: "depart" },
    );
    expect(g.ended).toBe(true);
    expect(g.seen).toEqual([]);
  });
});
describe("保存", () => {
  it("完成した図面は保存再開後も回転・入れ替えできない", () => {
    let g = newGame();
    g.detail = "diagram";
    g.papers = [0, 1, 2, 3];
    g.paperTurns = [0, 0, 0, 3];
    g = run(g, { type: "paperRotate", index: 3 });
    expect(g.paperTurns).toEqual([0, 0, 0, 0]);
    expect(g.records.diagram).toBeDefined();
    const restored = parseSave(JSON.stringify(g))!;
    const after = run(
      restored,
      { type: "paperRotate", index: 0 },
      { type: "paperSwap", a: 0, b: 1 },
      { type: "back" },
      { type: "inspect", detail: "diagram" },
      { type: "paperRotate", index: 3 },
    );
    expect(after.papers).toEqual([0, 1, 2, 3]);
    expect(after.paperTurns).toEqual([0, 0, 0, 0]);
  });
  it("範囲外の盤面や不正な画面名を拒否する", () => {
    const g = newGame();
    g.tray[0] = 9;
    expect(parseSave(JSON.stringify(g))).toBeNull();
    const h = newGame();
    (h as unknown as Record<string, unknown>).detail = "../../unexpected";
    expect(parseSave(JSON.stringify(h))).toBeNull();
  });
  it("調整途中と未取得物を往復後も維持する", () => {
    const g = newGame();
    g.rings = [3, 4, 7];
    g.rodMark = 5;
    g.drawerOpen = true;
    const loaded = parseSave(JSON.stringify(g));
    expect(loaded).toEqual(g);
  });
  it("壊れたデータや配列の不足を受け入れない", () => {
    expect(parseSave("{")).toBeNull();
    expect(parseSave("{}")).toBeNull();
    const g = newGame();
    g.valves = [];
    expect(parseSave(JSON.stringify(g))).toBeNull();
  });
  it("移行状態で不可能な部屋に残った保存から帰還できる", () => {
    const g = newGame();
    g.room = "service";
    g.water = 2;
    g.detail = "patch";
    const loaded = parseSave(JSON.stringify(g));
    expect(loaded?.room).toBe("concourse");
    expect(loaded?.detail).toBeNull();
  });
});
describe("見通し線", () => {
  it("二組の標が、同じ観測位置だけでそろう", () => {
    for (let pos = 0; pos < 5; pos++) {
      const ae = Math.abs(projection("A", pos).x - projection("E", pos).x);
      const bd = Math.abs(projection("B", pos).x - projection("D", pos).x);
      if (pos === 2) {
        expect(ae).toBeLessThan(1e-10);
        expect(bd).toBeLessThan(1e-10);
      } else {
        expect(ae).toBeGreaterThan(1);
        expect(bd).toBeGreaterThan(1);
      }
    }
  });
});

describe("床下の固定具と補修セット", () => {
  it("荷重を受けた側だけ抜け、抜いたピンの所持と完了状態を維持する", () => {
    let g = newGame();
    g.water = 0;
    g.items.crank = "inventory";
    expect(act(g, { type: "pin", index: 0 }).game.pins).toEqual([true, true]);
    for (const index of [0, 1]) {
      g = run(
        g,
        { type: "support", index, direction: 1, tool: "crank" },
        { type: "pin", index },
      );
      expect(g.items.lockingPins).toBe("inventory");
      expect(g.pins.filter((p) => !p)).toHaveLength(index + 1);
      g = run(g, { type: "support", index, direction: -1, tool: "crank" });
      const again = act(g, { type: "pin", index });
      expect(again.message).toContain("抜いてある");
      expect(again.game.pins[index]).toBe(false);
    }
    expect(freePontoon(g)).toBe(true);
  });
  it("旧セーブの抜去済みピンを復元し、未抜去なら所持に加えない", () => {
    for (const pins of [
      [true, true],
      [false, true],
      [false, false],
    ]) {
      const g = newGame();
      g.pins = pins;
      const raw = JSON.parse(JSON.stringify(g));
      delete raw.items.lockingPins;
      const loaded = parseSave(JSON.stringify(raw));
      expect(loaded?.items.lockingPins).toBe(
        pins.every(Boolean) ? "absent" : "inventory",
      );
      expect(loaded?.pins).toEqual(pins);
    }
  });
  it("向きを合わせて取り付け、四本の締結後だけ排水できる", () => {
    let g = newGame();
    g.water = 0;
    g.items.patch = "inventory";
    g.items.pliers = "inventory";
    g = run(g, { type: "mountPatch", tool: "patch" });
    expect(g.patchMounted).toBe(false);
    g = run(g, { type: "patchRotate" }, { type: "mountPatch", tool: "patch" });
    expect(g.items.patch).toBe("installed");
    g = run(g, { type: "drainTank" });
    expect(g.tankDry).toBe(false);
    for (let index = 0; index < 4; index++)
      g = run(g, { type: "patchBolt", index, tool: "pliers" });
    g = run(
      g,
      { type: "patchBolt", index: 0, tool: "pliers" },
      { type: "drainTank" },
    );
    expect(g.patchBolts).toEqual([true, true, true, true]);
    expect(g.tankDry).toBe(true);
  });
});
