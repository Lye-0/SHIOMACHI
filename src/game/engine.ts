import {
  blocks,
  boatReady,
  canSlide,
  channels,
  draining,
  filling,
  has,
  itemNames,
  mapTravelBlock,
  newGame,
  paperComplete,
  raised,
  ringAligned,
  roomNames,
  seaNames,
  type Action,
  type Game,
  type Item,
  type Result,
} from "./model";
import { boatDraft } from "./hull";

/** Record only what the current observation reveals, without a separate save action. */
function recordObserved(g: Game) {
  let id: string | undefined;
  if (g.detail === "diagram" && paperComplete(g)) id = "diagram";
  if (g.detail === "window" && g.room === "concourse") id = "pontoon";
  if (g.detail === "shore")
    id = g.room === "service" ? "fallen-beam" : "pipe-map";
  if (g.detail === "survey") id = "bearings";
  if (g.detail === "chart") id = "chart";
  if (g.detail === "trace" && g.tracing) id = "tracing";
  if (g.detail === "boat" && g.water === 2 && boatReady(g)) id = "waterline";
  if (!id) return;
  g.records ??= {};
  g.records[id] = {
    water: g.water,
    view: g.surveyPosition,
    mapTurn: g.mapTurn,
    raised: raised(g),
    ...(id === "chart" ? { chartMarks: [...g.chartMarks] } : {}),
  };
  if (!g.seen.includes(id)) g.seen.push(id);
}

export function act(previous: Game, action: Action): Result {
  const g = structuredClone(previous);
  const result: Result = { game: g, message: "" };
  const say = (message: string, sound: Result["sound"] = "metal") => {
    result.message = message;
    result.sound = sound;
  };
  const use = (item: Item) => has(g, item);
  const remember = (id: string) => {
    if (!g.seen.includes(id)) g.seen.push(id);
  };
  const badIndex = (index: number, length: number) =>
    !Number.isInteger(index) || index < 0 || index >= length;
  if (action.type === "tick") {
    g.elapsed += Math.max(0, Math.min(action.seconds, 10));
    return result;
  }
  g.moves++;
  switch (action.type) {
    case "start":
      g.started = true;
      break;
    case "visit":
    case "mapTravel":
      if (g.atSea) {
        say("船着き場へ引き返したい。");
        break;
      }
      if (action.type === "mapTravel") {
        const blocked = mapTravelBlock(g, action.room);
        if (blocked) {
          say(blocked);
          break;
        }
      }
      if (action.room !== "waiting" && !g.shutterOpen) {
        say("戸が閉じている。");
        break;
      }
      if (action.room === "service" && g.water !== 0) {
        say("下の通路は、水の中だ。", "water");
        break;
      }
      if (action.room === "lookout" && !raised(g)) {
        say("向こうの敷居には、まだ届かない。");
        break;
      }
      g.boarded = false;
      g.room = action.room;
      g.face = 0;
      g.detail = null;
      if (!g.visited.includes(g.room)) g.visited.push(g.room);
      break;
    case "face":
      if (g.room === "dock") break;
      g.face = g.face === 0 ? 1 : 0;
      g.detail = null;
      break;
    case "inspect":
      g.detail = action.detail;
      remember(action.detail);
      break;
    case "back":
      g.detail = null;
      break;
    case "record":
      remember(action.id);
      g.records ??= {};
      g.records[action.id] = {
        water: g.water,
        view: g.surveyPosition,
        mapTurn: g.mapTurn,
        raised: raised(g),
        ...(action.id === "chart" ? { chartMarks: [...g.chartMarks] } : {}),
      };
      say("記録に挟んだ。", "wood");
      break;
    case "take": {
      const place = g.items[action.item];
      const allowed =
        (place === "tray" && g.trayOpen && g.detail === "tray") ||
        (place === "drawer" && g.drawerOpen && g.detail === "drawer") ||
        (place === "desk" && g.room === "office") ||
        (place === "bench" && g.room === "workshop") ||
        (place === "rack" && g.detail === "rack") ||
        (place === "case" && g.caseOpen && g.detail === "rings") ||
        (place === "shelf" && g.room === "lookout");
      if (allowed) {
        g.items[action.item] = "inventory";
        say(`${itemNames[action.item]}を手に取った。`, "take");
      }
      break;
    }
    case "combine": {
      if (!use(action.a) || !use(action.b)) break;
      const pair = [action.a, action.b].sort().join("+");
      if (pair === "keyBow+keyTip" && use("keyJig")) {
        g.items.keyBow = g.items.keyTip = g.items.keyJig = "installed";
        g.items.key = "inventory";
        say("欠けた軸を、保持具でまっすぐに支えた。", "success");
      } else if (pair === "keyBow+keyTip")
        say("軸が欠けている。支えないと回せない。");
      else if (pair === "hookTip+rod") {
        g.items.hookTip = g.items.rod = "installed";
        g.items.hook = "inventory";
        say("棒の先に、鉤を固定した。", "success");
      } else say("この二つは、合わない。", "wood");
      break;
    }
    case "separate":
      if (action.item === "hook" && use("hook")) {
        g.items.hook = "absent";
        g.items.rod = g.items.hookTip = "inventory";
        say("鉤を外した。");
      }
      break;
    case "shutter":
      if (badIndex(action.index, 3) || g.shutterOpen) break;
      g.shutter[action.index] = !g.shutter[action.index];
      result.sound = "metal";
      break;
    case "openShutter":
      if (g.shutter.every(Boolean)) {
        g.shutterOpen = true;
        say("湿った風が、入ってきた。", "wood");
      } else say("留め金が残っている。");
      break;
    case "slide":
      if (!g.trayOpen && canSlide(g.tray, action.index, action.value)) {
        g.tray[action.index] = action.value;
        result.sound = "wood";
      }
      break;
    case "openTray":
      if (g.tray[0] === 4) {
        g.trayOpen = true;
        say("受け台が抜けた。", "wood");
      } else say("横の取り出し口まで、通らない。", "wood");
      break;
    case "extractKey":
      if (g.keyTurn) {
        say("錠はすでに外れている。");
        break;
      }
      if (action.tool === "pliers" && use("pliers") && !g.keyExtracted) {
        g.keyExtracted = true;
        g.items.keyTip = "inventory";
        say("錠に残った先端を抜いた。", "take");
      } else
        say(
          g.keyExtracted
            ? "錠の中は空いている。"
            : "鍵の先端が、錠に残っている。",
        );
      break;
    case "turnKey":
      if (g.keyTurn) {
        say("錠はすでに外れている。");
        break;
      }
      if (action.tool === "key" && use("key")) {
        g.keyTurn = 1;
        say("錠が外れた。");
      } else say("途中で折れた鍵が必要だ。");
      break;
    case "openDrawer":
      if (g.keyTurn) {
        g.drawerOpen = !g.drawerOpen;
        result.sound = "wood";
      } else say("錠が掛かっている。");
      break;
    case "paperRotate":
      if (!paperComplete(g) && !badIndex(action.index, 4))
        g.paperTurns[action.index] = (g.paperTurns[action.index] + 1) % 4;
      break;
    case "paperSwap":
      if (
        !paperComplete(g) &&
        !badIndex(action.a, 4) &&
        !badIndex(action.b, 4)
      ) {
        [g.papers[action.a], g.papers[action.b]] = [
          g.papers[action.b],
          g.papers[action.a],
        ];
        [g.paperTurns[action.a], g.paperTurns[action.b]] = [
          g.paperTurns[action.b],
          g.paperTurns[action.a],
        ];
      }
      break;
    case "beltPin":
      if (badIndex(action.index, 4) || g.beltTested) break;
      if (!use("belt") && !g.beltMounted) {
        say("溝に、ベルトがない。");
        break;
      }
      if (g.beltRoute.length < 5) {
        g.beltRoute.push(action.index);
        g.beltMounted = true;
        g.items.belt = "installed";
      }
      break;
    case "beltReset":
      if (!g.beltTested) {
        g.beltRoute = [];
        g.beltMounted = false;
        if (g.items.belt === "installed") g.items.belt = "inventory";
      }
      break;
    case "beltTest": {
      const routes = [
        "0,2,1,3,0",
        "0,3,1,2,0",
        "1,2,0,3,1",
        "1,3,0,2,1",
        "2,0,3,1,2",
        "2,1,3,0,2",
        "3,0,2,1,3",
        "3,1,2,0,3",
      ];
      if (routes.includes(g.beltRoute.join(","))) {
        g.beltTested = true;
        say("軸が、引っ掛からずに回る。", "success");
      } else say("ベルトがたるむか、途中で擦れている。");
      break;
    }
    case "valve":
      if (!badIndex(action.index, 3)) {
        g.valves[action.index] = !g.valves[action.index];
        result.sound = "metal";
      }
      break;
    case "target":
      if ([0, 1, 2].includes(action.value)) g.target = action.value;
      break;
    case "pump": {
      if (g.room !== "pump") break;
      if (g.gateOpen) {
        say("海側が開いている。水位は、外の海と同じだ。", "water");
        break;
      }
      const beforeRaised = raised(g),
        oldWater = g.water;
      if (filling(g)) {
        g.water = Math.max(g.water, g.target) as Game["water"];
        g.drive = false;
        say("注水管を、水が流れている。", "water");
      } else if (!g.beltTested) say("駆動軸が、ポンプへつながっていない。");
      else if (draining(g)) {
        g.drive = true;
        g.water = Math.min(
          g.water,
          g.strainerClear ? g.target : Math.max(1, g.target),
        ) as Game["water"];
        say(
          g.strainerClear
            ? "排水管へ、水が流れている。"
            : "吸込み口の奥で、何かが詰まっている。",
          "water",
        );
      } else {
        g.drive = !g.drive;
        say(
          g.valves[0]
            ? "出口が閉じている。水は逃がし管へ戻っていく。"
            : "吸込み側が閉じている。水が来ない。",
          "water",
        );
      }
      if (oldWater !== g.water)
        result.transition = !beforeRaised && raised(g) ? "rise" : "water";
      break;
    }
    case "clearStrainer":
      if (action.tool === "hook" && use("hook")) {
        g.strainerClear = true;
        say("絡まった布を、引き抜いた。", "water");
      } else
        say(
          g.strainerClear ? "水が通っている。" : "手では、奥まで届かない。",
          "water",
        );
      break;
    case "support":
      if (badIndex(action.index, 2) || g.water !== 0) break;
      if (action.tool !== "crank" || !use("crank")) {
        say("四角い軸穴がある。");
        break;
      }
      g.support[action.index] = Math.max(
        0,
        Math.min(2, g.support[action.index] + action.direction * 2),
      );
      result.sound = "metal";
      break;
    case "pin":
      if (badIndex(action.index, 2) || g.water !== 0) break;
      if (!g.pins[action.index]) {
        say("固定ピンは抜いてある。持ち物に入っている。");
        break;
      }
      if (g.support[action.index] !== 2) say("荷重が掛かり、抜けない。");
      else {
        g.pins[action.index] = false;
        g.items.lockingPins = "inventory";
        say(
          `固定ピンを抜き、手に取った。${g.pins.filter((p) => !p).length}本。`,
          "take",
        );
      }
      break;
    case "patchRotate":
      if (!g.patchMounted) g.patchTurn = (g.patchTurn + 1) % 4;
      break;
    case "mountPatch":
      if (g.water !== 0 || g.patchMounted) break;
      if (action.tool !== "patch" || !use("patch"))
        say("割れ目の周りに、四つの穴がある。");
      else if (g.patchTurn % 2 !== 1) say("穴が、合わない。");
      else {
        g.patchMounted = true;
        g.items.patch = "installed";
        say("四つの穴が、揃った。");
      }
      break;
    case "patchBolt":
      if (g.water !== 0 || !g.patchMounted || badIndex(action.index, 4)) break;
      if (action.tool !== "pliers" || !use("pliers"))
        say("ボルトは、まだ緩い。");
      else {
        g.patchBolts[action.index] = true;
        result.sound = "metal";
      }
      break;
    case "drainTank":
      if (g.water !== 0) break;
      if (!g.patchMounted || !g.patchBolts.every(Boolean))
        say("水を抜いても、割れ目から入ってしまう。", "water");
      else {
        g.tankDry = true;
        say("浮体の中から、水が抜けた。", "water");
      }
      break;
    case "ring":
      if (!g.caseOpen && !badIndex(action.index, 3)) {
        g.rings[action.index] =
          (g.rings[action.index] + action.direction + 8) % 8;
        result.sound = "metal";
      }
      break;
    case "openCase":
      if (ringAligned(g)) {
        g.caseOpen = true;
        say("留め爪が抜け、蓋が開いた。", "wood");
      } else say("切れ目が、そろっていない。");
      break;
    case "boatPatch":
      if (g.water !== 0) {
        say("船が浮いている。下側へは届かない。", "water");
        break;
      }
      if (action.tool !== "boatKit" || !use("boatKit")) {
        say("船の内と外を、挟む形の穴だ。");
        break;
      }
      if (action.side === "inside") g.boatInside = true;
      else g.boatOutside = true;
      if (g.boatInside && g.boatOutside) g.items.boatKit = "installed";
      say("傷の上に、ゴムの付いた補修具を当てた。");
      break;
    case "bailBoat":
      if (!g.boatInside || !g.boatOutside)
        say("抜いた水が、傷から戻ってくる。", "water");
      else {
        g.boatDry = true;
        say("船底が、乾いていく。", "water");
      }
      break;
    case "cleanLens":
      if (use("lens") || g.lampMounted) {
        g.lensClean = true;
        say("ガラスの曇りを拭った。", "wood");
      }
      break;
    case "mountLamp":
      if (action.tool === "lens" && use("lens")) {
        g.lampMounted = true;
        g.items.lens = "installed";
        say("ガラスを、船灯に戻した。");
      }
      break;
    case "lightLamp":
      if (!g.lampMounted) say("ガラスの押さえが、外れている。");
      else if (!g.lensClean) {
        say("ガラスが曇り、光が通らない。");
      } else {
        g.lampLit = !g.lampLit;
        say(
          g.lampLit ? "細い光が、水面を照らした。" : "灯を落とした。",
          "wood",
        );
      }
      break;
    case "mapTurn":
      g.mapTurn = (g.mapTurn + 1) % 4;
      break;
    case "surveyPosition":
      g.surveyPosition = Math.max(0, Math.min(4, action.value));
      break;
    case "chartMark":
      g.chartMarks = g.chartMarks.includes(action.node)
        ? g.chartMarks.filter((n) => n !== action.node)
        : [...g.chartMarks, action.node];
      break;
    case "chartClear":
      g.chartMarks = [];
      break;
    case "trace":
      if (action.tool !== "chalk" || !use("chalk"))
        say("船底に沿った、深いくぼみがある。");
      else {
        g.tracing = true;
        remember("tracing");
        say("くぼみの輪郭を、記録帳の紙に写した。", "wood");
      }
      break;
    case "rodMark":
      g.rodMark = Math.max(0, Math.min(80, action.value));
      break;
    case "waterMark":
      g.waterMark = Math.max(0, Math.min(80, action.value));
      break;
    case "gate":
      if (g.gateOpen) {
        g.gateOpen = false;
        say("水門が閉じた。");
      } else if (g.water !== 2) say("閂に、水の圧力が掛かっている。", "water");
      else {
        g.gateOpen = true;
        say("内と外の水が、静かにつながった。", "water");
      }
      break;
    case "board":
      if (!boatReady(g) || g.water !== 2) {
        say("船がまだ浮かべられない。");
        break;
      }
      if (!g.gateOpen || !g.lampLit) {
        say("水門と船灯を確かめたい。");
        break;
      }
      g.boarded = true;
      g.detail = null;
      g.room = "dock";
      break;
    case "disembark":
      if (!g.atSea) {
        g.boarded = false;
        g.detail = null;
      }
      break;
    case "routePoint": {
      if (!g.boarded || g.atSea || !Object.hasOwn(seaNames, action.node)) break;
      const tail = g.routePlan.at(-1);
      if (!tail) {
        if (action.node === "S" || action.node === "X")
          g.routePlan = [action.node];
        else say("船着き場から線を引く。");
        break;
      }
      const existing = g.routePlan.indexOf(action.node);
      if (existing >= 0) {
        g.routePlan = g.routePlan.slice(0, existing + 1);
        break;
      }
      if (tail === "T") break;
      if (
        channels.some(
          ([a, b]) =>
            (a === tail && b === action.node) ||
            (b === tail && a === action.node),
        )
      )
        g.routePlan.push(action.node);
      else say("点線でつながった標を選ぶ。");
      break;
    }
    case "routeUndo":
      if (g.boarded && !g.atSea) g.routePlan.pop();
      break;
    case "routeClear":
      if (g.boarded && !g.atSea) g.routePlan = [];
      break;
    case "depart": {
      if (g.atSea) break;
      if (
        !g.boarded ||
        !boatReady(g) ||
        g.water !== 2 ||
        !g.gateOpen ||
        !g.lampLit
      ) {
        say("船と水門、船灯を確かめたい。");
        break;
      }
      if (g.routePlan.at(-1) !== "T" || g.routePlan.length < 2) {
        say("沖の灯まで、航路を引きたい。");
        break;
      }
      g.atSea = true;
      g.detail = null;
      g.ended = false;
      g.voyageFailure = "";
      g.failureLeg = -1;
      g.seaHistory = ["S"];
      // A course plotted from the other landing has a translated departure bearing:
      // the first leg crosses the shoal beside this harbor mouth, not the planned channel.
      if (g.routePlan[0] !== "S") {
        g.voyageFailure = "heading";
        g.failureLeg = 0;
        g.seaNode = "S";
      } else
        for (let i = 1; i < g.routePlan.length; i++) {
          const from = g.routePlan[i - 1],
            to = g.routePlan[i];
          const edge = channels.find(
            ([a, b]) => (a === from && b === to) || (b === from && a === to),
          );
          if (!edge) {
            g.voyageFailure = "heading";
            g.failureLeg = i - 1;
            g.seaNode = from;
            break;
          }
          if (edge[3] || 3 - edge[2] <= boatDraft + 1e-9) {
            g.voyageFailure = edge[3] ? "beam" : "shallow";
            g.failureLeg = i - 1;
            g.seaNode = to;
            break;
          }
          g.seaHistory.push(to);
          g.seaNode = to;
        }
      if (!g.voyageFailure) g.ended = true;
      result.transition = "depart";
      result.sound = "water";
      break;
    }
    case "sail":
      break; // Legacy incremental navigation cannot bypass a plotted voyage.
    case "returnDock":
      g.atSea = false;
      g.boarded = true;
      g.voyageFailure = "";
      g.failureLeg = -1;
      g.ended = false;
      g.seaNode = "S";
      g.seaHistory = ["S"];
      g.room = "dock";
      g.detail = null;
      break;
  }
  recordObserved(g);
  return result;
}

export function parseSave(raw: string | null): Game | null {
  if (!raw) return null;
  try {
    const input: unknown = JSON.parse(raw);
    if (!input || typeof input !== "object" || Array.isArray(input))
      return null;
    const g = input as Game,
      base = newGame();
    g.records ??= {};
    if (!("navigationVersion" in input)) {
      g.navigationVersion = 2;
      g.boarded = false;
      g.routePlan = [];
      g.voyageFailure = "";
      g.failureLeg = -1;
      g.rodMark *= 10;
      g.waterMark *= 10;
      if (g.atSea && !g.ended) {
        g.atSea = false;
        g.boarded = true;
        g.room = "dock";
        g.detail = null;
        g.seaNode = "S";
        g.seaHistory = ["S"];
      }
    }
    if (
      !Number.isInteger(g.failureLeg) ||
      g.failureLeg < -1 ||
      g.failureLeg > 10
    )
      return null;
    if (
      g.navigationVersion !== 2 ||
      !["", "shallow", "beam", "heading"].includes(g.voyageFailure)
    )
      return null;
    if (
      !Array.isArray(g.routePlan) ||
      g.routePlan.length > 11 ||
      !g.routePlan.every(
        (n) => typeof n === "string" && Object.hasOwn(seaNames, n),
      ) ||
      new Set(g.routePlan).size !== g.routePlan.length
    )
      return null;
    if (g.routePlan.length && !["S", "X"].includes(g.routePlan[0])) return null;
    if (
      g.routePlan.some(
        (n, i) =>
          i > 0 &&
          !channels.some(
            ([a, b]) =>
              (a === n && b === g.routePlan[i - 1]) ||
              (b === n && a === g.routePlan[i - 1]),
          ),
      )
    )
      return null;

    // Older saves did not track removed pins as inventory. Restore ownership.
    if (g.items && typeof g.items === "object" && Array.isArray(g.pins))
      g.items.lockingPins = g.pins.some((p) => p === false)
        ? "inventory"
        : "absent";
    if (
      g.version !== 1 ||
      !Object.hasOwn(roomNames, g.room) ||
      ![0, 1, 2].includes(g.water) ||
      ![0, 1].includes(g.face)
    )
      return null;
    for (const key of Object.keys(base) as (keyof Game)[]) {
      const expect = base[key],
        value = g[key];
      if (expect === null) {
        if (value !== null && typeof value !== "string") return null;
      } else if (Array.isArray(expect)) {
        if (!Array.isArray(value) || value.length > 1000) return null;
        if (expect.length && !value.every((v) => typeof v === typeof expect[0]))
          return null;
      } else if (typeof value !== typeof expect) return null;
    }
    for (const key of ["shutter", "valves", "rings"] as const)
      if (g[key].length !== 3) return null;
    for (const key of ["papers", "paperTurns", "patchBolts"] as const)
      if (g[key].length !== 4) return null;
    if (
      g.support.length !== 2 ||
      g.pins.length !== 2 ||
      g.tray.length !== blocks.length
    )
      return null;
    const integer = (n: unknown, min: number, max: number) =>
      typeof n === "number" && Number.isInteger(n) && n >= min && n <= max;
    if (
      !integer(g.target, 0, 2) ||
      !integer(g.keyTurn, 0, 1) ||
      !integer(g.patchTurn, 0, 3) ||
      !integer(g.mapTurn, 0, 3) ||
      !integer(g.surveyPosition, 0, 4) ||
      !integer(g.rodMark, 0, 80) ||
      !integer(g.waterMark, 0, 80)
    )
      return null;
    if (
      g.detail !== null &&
      ![
        "shutter",
        "tray",
        "key",
        "drawer",
        "diagram",
        "belt",
        "pipes",
        "strainer",
        "supports",
        "patch",
        "rings",
        "survey",
        "depth",
        "landward",
        "boat",
        "lantern",
        "gate",
        "chart",
        "rack",
        "window",
        "trace",
        "shore",
      ].includes(g.detail)
    )
      return null;
    if (
      !g.tray.every(
        (p, i) => integer(p, 0, 6 - blocks[i].length) && canSlide(g.tray, i, p),
      )
    )
      return null;
    if (
      [...g.papers].sort().join("") !== "0123" ||
      !g.paperTurns.every((p) => integer(p, 0, 3))
    )
      return null;
    if (
      !g.rings.every((p) => integer(p, 0, 7)) ||
      !g.support.every((p) => integer(p, 0, 2))
    )
      return null;
    if (g.beltRoute.length > 5 || !g.beltRoute.every((p) => integer(p, 0, 3)))
      return null;
    if (
      !g.visited.every((r) => Object.hasOwn(roomNames, r)) ||
      !Object.hasOwn(seaNames, g.seaNode) ||
      !g.seaHistory.every((r) => Object.hasOwn(seaNames, r))
    )
      return null;
    if (
      !g.items ||
      Array.isArray(g.items) ||
      !g.records ||
      Array.isArray(g.records)
    )
      return null;
    if (
      !Object.values(g.records).every(
        (r) =>
          r &&
          integer(r.water, 0, 2) &&
          integer(r.view, 0, 4) &&
          integer(r.mapTurn, 0, 3) &&
          (r.chartMarks === undefined ||
            (Array.isArray(r.chartMarks) &&
              r.chartMarks.every(
                (node) =>
                  typeof node === "string" && Object.hasOwn(seaNames, node),
              ))),
      )
    )
      return null;
    if (
      Object.keys(base.items).some(
        (item) =>
          ![
            "tray",
            "lock",
            "desk",
            "drawer",
            "bench",
            "rack",
            "case",
            "shelf",
            "inventory",
            "installed",
            "absent",
          ].includes(g.items[item as Item]),
      )
    )
      return null;
    if (
      !Number.isFinite(g.elapsed) ||
      !Number.isFinite(g.moves) ||
      g.elapsed < 0 ||
      g.moves < 0
    )
      return null;
    if (g.room === "service" && g.water !== 0) {
      g.room = "concourse";
      g.detail = null;
    }
    if (g.room === "lookout" && !raised(g)) {
      g.room = "waiting";
      g.detail = null;
    }
    if (g.room === "dock") g.face = 0;
    return g;
  } catch {
    return null;
  }
}
