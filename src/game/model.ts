export const SAVE_KEY = "shiomachi.save.v1";
export type Room =
  | "waiting"
  | "concourse"
  | "office"
  | "workshop"
  | "pump"
  | "service"
  | "lookout"
  | "dock";
export type Detail =
  | "shutter"
  | "tray"
  | "key"
  | "drawer"
  | "diagram"
  | "belt"
  | "pipes"
  | "strainer"
  | "supports"
  | "patch"
  | "rings"
  | "survey"
  | "depth"
  | "landward"
  | "boat"
  | "lantern"
  | "gate"
  | "chart"
  | "rack"
  | "window"
  | "trace"
  | "shore";
export type Item =
  | "pliers"
  | "keyTip"
  | "keyBow"
  | "keyJig"
  | "key"
  | "crank"
  | "belt"
  | "rod"
  | "hookTip"
  | "hook"
  | "patch"
  | "boatKit"
  | "lens"
  | "chalk"
  | "lockingPins"
  | "tracingPaper";
export type Place =
  | "tray"
  | "lock"
  | "desk"
  | "drawer"
  | "bench"
  | "rack"
  | "case"
  | "shelf"
  | "inventory"
  | "installed"
  | "absent";
export type Water = 0 | 1 | 2;
export interface Game {
  version: 1;
  started: boolean;
  room: Room;
  face: 0 | 1;
  detail: Detail | null;
  water: Water;
  valves: boolean[];
  target: Water;
  drive: boolean;
  shutter: boolean[];
  shutterOpen: boolean;
  tray: number[];
  trayOpen: boolean;
  keyExtracted: boolean;
  keyTurn: number;
  drawerOpen: boolean;
  papers: number[];
  paperTurns: number[];
  beltRoute: number[];
  beltMounted: boolean;
  beltTested: boolean;
  strainerClear: boolean;
  support: number[];
  pins: boolean[];
  patchTurn: number;
  patchMounted: boolean;
  patchBolts: boolean[];
  tankDry: boolean;
  rings: number[];
  caseOpen: boolean;
  boatInside: boolean;
  boatOutside: boolean;
  boatDry: boolean;
  lensClean: boolean;
  lampMounted: boolean;
  lampLit: boolean;
  mapTurn: number;
  surveyPosition: number;
  chartMarks: string[];
  tracing: boolean;
  rodMark: number;
  waterMark: number;
  gateOpen: boolean;
  boarded: boolean;
  routePlan: string[];
  voyageFailure: "" | "shallow" | "beam" | "heading";
  failureLeg: number;
  navigationVersion: 2;
  atSea: boolean;
  seaNode: string;
  seaHistory: string[];
  ended: boolean;
  items: Record<Item, Place>;
  seen: string[];
  records: Record<
    string,
    {
      water: Water;
      view: number;
      mapTurn: number;
      raised?: boolean;
      chartMarks?: string[];
      draftMarks?: [number, number];
    }
  >;
  visited: Room[];
  elapsed: number;
  moves: number;
}
export function newGame(): Game {
  return {
    version: 1,
    started: false,
    room: "waiting",
    face: 0,
    detail: null,
    water: 1,
    target: 1,
    valves: [false, false, false],
    drive: false,
    shutter: [false, false, false],
    shutterOpen: false,
    tray: [0, 1, 2, 3, 1, 1, 3, 1],
    trayOpen: false,
    keyExtracted: false,
    keyTurn: 0,
    drawerOpen: false,
    papers: [2, 0, 3, 1],
    paperTurns: [1, 3, 2, 1],
    beltRoute: [],
    beltMounted: false,
    beltTested: false,
    strainerClear: false,
    support: [0, 0],
    pins: [true, true],
    patchTurn: 0,
    patchMounted: false,
    patchBolts: [false, false, false, false],
    tankDry: false,
    rings: [0, 3, 6],
    caseOpen: false,
    boatInside: false,
    boatOutside: false,
    boatDry: false,
    lensClean: false,
    lampMounted: false,
    lampLit: false,
    mapTurn: 0,
    surveyPosition: 0,
    chartMarks: [],
    tracing: false,
    rodMark: 0,
    waterMark: 0,
    gateOpen: false,
    boarded: false,
    routePlan: [],
    voyageFailure: "",
    failureLeg: -1,
    navigationVersion: 2,
    atSea: false,
    seaNode: "S",
    seaHistory: ["S"],
    ended: false,
    items: {
      pliers: "tray",
      keyTip: "lock",
      keyBow: "desk",
      keyJig: "tray",
      key: "absent",
      crank: "drawer",
      belt: "bench",
      rod: "bench",
      hookTip: "drawer",
      hook: "absent",
      patch: "rack",
      boatKit: "case",
      lens: "shelf",
      chalk: "desk",
      lockingPins: "absent",
      tracingPaper: "absent",
    },
    seen: [],
    records: {},
    visited: ["waiting"],
    elapsed: 0,
    moves: 0,
  };
}
export const has = (g: Game, item: Item) => g.items[item] === "inventory";
export const freePontoon = (g: Game) => g.pins.every((p) => !p);
export const soundPontoon = (g: Game) =>
  g.patchMounted && g.patchBolts.every(Boolean) && g.tankDry;
export const raised = (g: Game) =>
  g.water === 2 && freePontoon(g) && soundPontoon(g);
export function mapTravelBlock(g: Game, room: Room): string | null {
  if (g.atSea || g.ended) return "航行中はマップから移動できません";
  if (!g.visited.includes(room) && room !== g.room) return "まだ訪れていません";
  if (room !== "waiting" && !g.shutterOpen) return "待合室の戸が閉じています";
  if (room === "service" && g.water !== 0) return "床下の足場は水の中です";
  if (room === "lookout" && !raised(g)) return "観測室の敷居に届きません";
  return null;
}
export const boatReady = (g: Game) =>
  g.boatInside && g.boatOutside && g.boatDry;
export const paperComplete = (g: Game) =>
  g.papers.every((p, i) => p === i) && g.paperTurns.every((p) => p === 0);
export const ringAligned = (g: Game) => g.rings.every((r) => r === 0);
export const draining = (g: Game) => g.valves[0] && !g.valves[1] && g.valves[2];
export const filling = (g: Game) => g.valves[1];
export const roomNames: Record<Room, string> = {
  waiting: "待合室",
  concourse: "連絡桟橋",
  office: "事務室",
  workshop: "整備工房",
  pump: "ポンプ室",
  service: "待合室の床下",
  lookout: "観測室",
  dock: "船溜まり",
};
export const itemNames: Record<Item, string> = {
  pliers: "細口のペンチ",
  keyTip: "鍵の先端",
  keyBow: "折れた鍵",
  keyJig: "小さな保持具",
  key: "保持具で支えた鍵",
  crank: "クランク",
  belt: "駆動ベルト",
  rod: "長い棒",
  hookTip: "鉤の先端",
  hook: "長柄の鉤",
  patch: "浮体の補修セット",
  boatKit: "船の補修具",
  lens: "船灯のガラス",
  chalk: "白墨",
  lockingPins: "固定ピン",
  tracingPaper: "船底の写し",
};

export interface Block {
  axis: "x" | "y";
  fixed: number;
  length: number;
  name: string;
}
export const blocks: Block[] = [
  { axis: "x", fixed: 2, length: 2, name: "工具の受け台" },
  { axis: "y", fixed: 2, length: 3, name: "長い収納材" },
  { axis: "x", fixed: 0, length: 2, name: "上の収納材" },
  { axis: "y", fixed: 3, length: 2, name: "中央の収納材" },
  { axis: "x", fixed: 4, length: 2, name: "下の収納材" },
  { axis: "y", fixed: 5, length: 2, name: "右の収納材" },
  { axis: "y", fixed: 0, length: 2, name: "左の収納材" },
  { axis: "x", fixed: 5, length: 2, name: "底の収納材" },
];
export function canSlide(
  positions: number[],
  index: number,
  next: number,
): boolean {
  const block = blocks[index];
  if (!block || !Number.isInteger(next) || next < 0 || next + block.length > 6)
    return false;
  const cells = new Set<string>();
  blocks.forEach((b, i) => {
    if (i !== index)
      for (let n = 0; n < b.length; n++)
        cells.add(
          b.axis === "x"
            ? `${positions[i] + n},${b.fixed}`
            : `${b.fixed},${positions[i] + n}`,
        );
  });
  const from = Math.min(next, positions[index]),
    to = Math.max(next, positions[index]) + block.length;
  for (let n = from; n < to; n++)
    if (
      cells.has(
        block.axis === "x" ? `${n},${block.fixed}` : `${block.fixed},${n}`,
      )
    )
      return false;
  return true;
}
// Elevations in metres relative to the same datum as water level III (3m).
export const channels = [
  ["S", "A", 2.54, false],
  ["A", "T", 2.44, false],
  ["S", "B", 2.44, false],
  ["B", "C", 2.46, false],
  ["B", "D", 2.52, false],
  ["C", "E", 2.42, false],
  ["C", "F", 2.4, false],
  ["E", "G", 2.47, false],
  ["E", "F", 2.51, false],
  ["G", "H", 2.45, false],
  ["G", "T", 2.52, false],
  ["H", "T", 2.44, false],
  ["D", "T", 2.44, false],
  ["F", "T", 2.52, false],
  ["X", "A", 2.44, false],
  ["X", "B", 2.52, false],
] as const;
export const seaNames: Record<string, string> = {
  S: "渡船場",
  A: "二本杭",
  B: "輪の標",
  C: "割れた岬",
  D: "石の門",
  E: "三角の標",
  F: "松の小島",
  X: "古い船着き場",
  G: "白い岩柱",
  H: "低い岩のアーチ",
  T: "沖の灯",
};

export type Action =
  | { type: "start" }
  | { type: "visit"; room: Room }
  | { type: "mapTravel"; room: Room }
  | { type: "face" }
  | { type: "inspect"; detail: Detail }
  | { type: "back" }
  | { type: "record"; id: string }
  | { type: "take"; item: Item }
  | { type: "combine"; a: Item; b: Item }
  | { type: "separate"; item: Item }
  | { type: "shutter"; index: number }
  | { type: "openShutter" }
  | { type: "slide"; index: number; value: number }
  | { type: "openTray" }
  | { type: "extractKey"; tool?: Item }
  | { type: "turnKey"; tool?: Item }
  | { type: "openDrawer" }
  | { type: "paperRotate"; index: number }
  | { type: "paperSwap"; a: number; b: number }
  | { type: "beltPin"; index: number }
  | { type: "beltReset" }
  | { type: "beltTest" }
  | { type: "valve"; index: number }
  | { type: "target"; value: Water }
  | { type: "pump" }
  | { type: "clearStrainer"; tool?: Item }
  | { type: "support"; index: number; direction: 1 | -1; tool?: Item }
  | { type: "pin"; index: number }
  | { type: "patchRotate" }
  | { type: "mountPatch"; tool?: Item }
  | { type: "patchBolt"; index: number; tool?: Item }
  | { type: "drainTank" }
  | { type: "ring"; index: number; direction: number }
  | { type: "openCase" }
  | { type: "boatPatch"; side: "inside" | "outside"; tool?: Item }
  | { type: "bailBoat" }
  | { type: "cleanLens" }
  | { type: "mountLamp"; tool?: Item }
  | { type: "lightLamp" }
  | { type: "mapTurn" }
  | { type: "surveyPosition"; value: number }
  | { type: "chartMark"; node: string }
  | { type: "chartClear" }
  | { type: "trace"; tool?: Item }
  | { type: "measureDraft" }
  | { type: "rodMark"; value: number }
  | { type: "waterMark"; value: number }
  | { type: "gate" }
  | { type: "board" }
  | { type: "disembark" }
  | { type: "routePoint"; node: string }
  | { type: "routeUndo" }
  | { type: "routeClear" }
  | { type: "depart" }
  | { type: "sail"; node: string }
  | { type: "returnDock" }
  | { type: "tick"; seconds: number };
export interface Result {
  game: Game;
  message: string;
  sound?: "metal" | "wood" | "water" | "take" | "success";
  transition?: "water" | "rise" | "depart";
}
