import { describe, expect, it } from "vitest";
import { hintFor } from "../src/content/hints";
import { act, parseSave } from "../src/game/engine";
import { newGame, type Game } from "../src/game/model";

function ready(): Game {
  const g = newGame();
  Object.assign(g, {
    started: true,
    shutterOpen: true,
    trayOpen: true,
    keyExtracted: true,
    keyTurn: 1,
    drawerOpen: false,
    beltTested: true,
    strainerClear: true,
    pins: [false, false],
    support: [0, 0],
    patchMounted: true,
    patchBolts: [true, true, true, true],
    tankDry: true,
    caseOpen: true,
    boatInside: true,
    boatOutside: true,
    boatDry: true,
    papers: [0, 1, 2, 3],
    paperTurns: [0, 0, 0, 0],
    tracing: true,
    water: 2,
    lampMounted: true,
    lensClean: true,
    lampLit: true,
    rodMark: 0,
    waterMark: 50,
    gateOpen: true,
  });
  Object.assign(g.items, {
    pliers: "inventory",
    keyJig: "installed",
    crank: "inventory",
    hookTip: "inventory",
    rod: "inventory",
    belt: "installed",
    boatKit: "installed",
    patch: "installed",
  });
  g.records = {
    "fallen-beam": { water: 0, view: 0, mapTurn: 0 },
    bearings: { water: 2, view: 2, mapTurn: 0 },
    chart: { water: 2, view: 2, mapTurn: 0, chartMarks: ["A", "E", "B", "D"] },
    waterline: { water: 2, view: 2, mapTurn: 0 },
  };
  return g;
}

describe("現在の進行から次の手がかりを選ぶ", () => {
  it("拡大中の対象ではなく、未完了の進行を優先する", () => {
    const g = newGame();
    g.detail = "gate";
    expect(hintFor(g).id).toBe("shutter");
    g.shutterOpen = true;
    g.detail = "shutter";
    expect(hintFor(g).id).toBe("tray");
    const complete = ready();
    for (const detail of [
      "shutter",
      "tray",
      "key",
      "boat",
      "lantern",
      "gate",
    ] as const) {
      complete.detail = detail;
      expect(hintFor(complete).id).toBe("depart");
    }
  });
  it("解いた工具箱では残った道具の取得だけを案内する", () => {
    let g = newGame();
    g.shutterOpen = true;
    g.tray[0] = 4;
    expect(hintFor(g).id).toBe("tray-open");
    g = act(g, { type: "openTray" }).game;
    g.detail = "tray";
    g = act(g, { type: "take", item: "pliers" }).game;
    expect(hintFor(g).steps.join()).toContain("保持具");
    expect(hintFor(g).steps.join()).not.toContain("ペンチ");
    g = act(g, { type: "take", item: "keyJig" }).game;
    expect(hintFor(g).id).toBe("key-extract");
  });
  it("鍵の抜取り・柄の取得・組合せ・使用を区別する", () => {
    let g = ready();
    g.keyTurn = 0;
    g.keyExtracted = false;
    g.items.keyJig = "inventory";
    expect(hintFor(g).id).toBe("key-extract");
    g = act(g, { type: "extractKey", tool: "pliers" }).game;
    expect(hintFor(g).id).toBe("key-bow");
    g.room = "office";
    g = act(g, { type: "take", item: "keyBow" }).game;
    expect(hintFor(g).id).toBe("key-combine");
    g = act(g, { type: "combine", a: "keyBow", b: "keyTip" }).game;
    expect(hintFor(g).id).toBe("key-use");
    g = act(g, { type: "turnKey", tool: "key" }).game;
    expect(hintFor(g).id).toBe("depart");
  });
  it("空の引き出しを閉じても取得済み道具を勧めない", () => {
    const g = ready();
    expect(hintFor(g).id).toBe("depart");
    g.items.hookTip = "drawer";
    expect(hintFor(g).steps.join()).toContain("鉤の先端");
    expect(hintFor(g).steps.join()).not.toContain("クランク");
  });
  it.each(["supports", "patch", "case", "boat", "beam"])(
    "%sが未完了なら高水位で作業させず、水門を閉じて排水へ導く",
    (task) => {
      let g = ready();
      if (task === "supports") g.pins[1] = true;
      if (task === "patch") g.tankDry = false;
      if (task === "case") g.items.boatKit = "case";
      if (task === "boat") g.boatOutside = false;
      if (task === "beam") delete g.records["fallen-beam"];
      expect(hintFor(g).id).toBe("gate-close");
      g = act(g, { type: "gate" }).game;
      expect(hintFor(g).id).toBe("pipes");
    },
  );
  it("抜去後は支持ねじの高さに関係なく補修や注水へ案内する", () => {
    for (const support of [
      [0, 0],
      [0, 2],
      [2, 0],
      [2, 2],
    ]) {
      const g = ready();
      g.water = 0;
      g.support = support;
      g.tankDry = false;
      expect(hintFor(g).id).toBe("tank-drain");
      g.tankDry = true;
      const baseline = { ...g, support: [0, 0] };
      expect(hintFor(g)).toEqual(hintFor(baseline));
      expect(hintFor(g).steps.join()).not.toContain("支持ねじ");
      g.water = 2;
      expect(hintFor(g).id).toBe("depart");
    }
  });
  it("補修板の固定と排水、船の片側修理と水汲みを区別する", () => {
    const g = ready();
    g.water = 0;
    g.patchBolts[2] = false;
    expect(hintFor(g).id).toBe("patch-bolts");
    g.patchBolts[2] = true;
    g.tankDry = false;
    expect(hintFor(g).id).toBe("tank-drain");
    g.tankDry = true;
    g.boatOutside = false;
    expect(hintFor(g).steps.join()).toContain("外側");
    expect(hintFor(g).steps.join()).not.toContain("両方");
    g.boatOutside = true;
    g.boatDry = false;
    expect(hintFor(g).id).toBe("boat-bail");
  });
  it("船灯の装着後は清掃と点灯だけを案内する", () => {
    const g = ready();
    g.lensClean = false;
    g.lampLit = false;
    expect(hintFor(g).id).toBe("lens-clean");
    g.lensClean = true;
    expect(hintFor(g).id).toBe("lamp-light");
    g.lampLit = true;
    expect(hintFor(g).id).toBe("depart");
  });
  it("観測・測線・測深の未完了を順に案内し記録済み情報も使う", () => {
    const g = ready();
    g.records.bearings.view = 1;
    expect(hintFor(g).id).toBe("survey");
    g.records.bearings.view = 2;
    g.records.chart.chartMarks = ["A", "B", "D", "E"];
    expect(hintFor(g).id).toBe("chart-lines");
    g.records.chart.chartMarks = ["D", "B", "E", "A"];
    g.waterMark = 40;
    g.items.hook = "inventory";
    expect(hintFor(g).id).toBe("draft");
    expect(hintFor(g).steps.join()).not.toContain("分離");
    g.items.hook = "absent";
    expect(hintFor(g).id).toBe("draft");
    g.waterMark = 50;
    expect(hintFor(g).id).toBe("depart");
  });
  it("水門と出航後の現在位置、脱出完了を区別する", () => {
    const g = ready();
    g.gateOpen = false;
    expect(hintFor(g).id).toBe("gate-open");
    g.gateOpen = true;
    expect(hintFor(g).id).toBe("depart");
    g.atSea = true;
    expect(hintFor(g).id).toBe("voyage-return");
    g.atSea = false;
    g.boarded = true;
    expect(hintFor(g).id).toBe("voyage-plan");
    g.ended = true;
    expect(hintFor(g).id).toBe("ended");
  });
  it("ヒントの表示だけでは進行を変更せず、保存再開後も同じ内容になる", () => {
    const g = ready();
    const before = JSON.stringify(g);
    const hint = hintFor(g);
    expect(JSON.stringify(g)).toBe(before);
    expect(hintFor(parseSave(before)!)).toEqual(hint);
  });
});
