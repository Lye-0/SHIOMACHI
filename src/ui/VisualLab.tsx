import { ItemArt } from "./Primitives";
import { ActionBar, SceneAction } from "./ActionBar";
import { useState } from "react";
import { act } from "../game/engine";
import {
  newGame,
  itemNames,
  type Game,
  type Item,
  type Room,
  type Detail,
} from "../game/model";
import { Scene } from "./Scene";
import { Details } from "./Details";

// DEV-only isolated render fixtures. Never read or write localStorage.
type Fixture = {
  id: string;
  room: Room;
  detail?: Detail;
  face?: 0 | 1;
  patch?: Partial<Game>;
  selected?: Item;
  ready?: boolean;
};
const fixtures: Fixture[] = [
  {
    id: "pontoon-operation",
    room: "service",
    detail: "supports",
    patch: { water: 0 },
    selected: "crank",
  },
  {
    id: "patch-operation",
    room: "service",
    detail: "patch",
    patch: { water: 0 },
    selected: "patch",
  },
  { id: "waiting-closed", room: "waiting", patch: { shutterOpen: false } },
  { id: "waiting-open", room: "waiting" },
  { id: "waiting-raised", room: "waiting", ready: true },
  { id: "waiting-rear-raised", room: "waiting", face: 1, ready: true },
  { id: "hub-low", room: "concourse", patch: { water: 0 } },
  { id: "hub-mid", room: "concourse" },
  { id: "hub-high-held", room: "concourse", patch: { water: 2 } },
  { id: "hub-high-raised", room: "concourse", ready: true },
  { id: "office-drawer-items", room: "office", patch: { drawerOpen: true } },
  { id: "office-paper", room: "office", detail: "diagram" },
  { id: "office-shelves", room: "office", face: 1 },
  {
    id: "workshop-tools",
    room: "workshop",
    patch: { trayOpen: true, tray: [4, 3, 0, 0, 3, 4, 3, 0] },
  },
  { id: "workshop-rack", room: "workshop", face: 1 },
  { id: "pump-start", room: "pump" },
  {
    id: "pump-running",
    room: "pump",
    patch: {
      beltMounted: true,
      beltTested: true,
      beltRoute: [0, 2, 1, 3, 0],
      strainerClear: true,
      valves: [true, false, true],
    },
  },
  { id: "pump-level-high", room: "pump", face: 1, patch: { water: 2 } },
  {
    id: "service-one-pin",
    room: "service",
    patch: { water: 0, pins: [false, true] },
  },
  { id: "service-repaired", room: "service", ready: true, patch: { water: 0 } },
  {
    id: "supports-one-loaded",
    room: "service",
    detail: "supports",
    patch: { water: 0, support: [2, 0] },
  },
  {
    id: "supports-one-released",
    room: "service",
    detail: "supports",
    patch: { water: 0, support: [2, 0], pins: [false, true] },
  },
  { id: "case-closed", room: "service", detail: "rings", patch: { water: 0 } },
  {
    id: "case-open",
    room: "service",
    detail: "rings",
    patch: { water: 0, caseOpen: true, rings: [0, 0, 0] },
  },
  {
    id: "case-open-room",
    room: "service",
    face: 1,
    patch: { water: 0, caseOpen: true, rings: [0, 0, 0] },
  },
  { id: "lookout-lens", room: "lookout", ready: true },
  { id: "lookout-window", room: "lookout", face: 1, ready: true },
  {
    id: "survey-offset",
    room: "lookout",
    detail: "survey",
    ready: true,
    patch: { surveyPosition: 0 },
  },
  {
    id: "survey-aligned",
    room: "lookout",
    detail: "survey",
    ready: true,
    patch: { surveyPosition: 2 },
  },
  {
    id: "chart-bearings",
    room: "lookout",
    detail: "chart",
    ready: true,
    patch: { chartMarks: ["A", "E", "B", "D"] },
  },
  { id: "dock-low", room: "dock", patch: { water: 0 } },
  { id: "dock-mid", room: "dock" },
  { id: "dock-high-flooded", room: "dock", patch: { water: 2 } },
  { id: "dock-high-repaired", room: "dock", ready: true },
  {
    id: "dock-gate-open",
    room: "dock",
    face: 1,
    ready: true,
    patch: { gateOpen: true, lampLit: true },
  },
  {
    id: "boat-outside-repaired",
    room: "dock",
    detail: "boat",
    patch: { water: 0, boatOutside: true },
  },
  { id: "boat-floating", room: "dock", detail: "boat", ready: true },
  { id: "trace-low", room: "dock", detail: "trace", patch: { water: 0 } },
  { id: "trace-mid", room: "dock", detail: "trace" },
  { id: "trace-high", room: "dock", detail: "trace", ready: true },
  {
    id: "trace-gate-open",
    room: "dock",
    detail: "trace",
    ready: true,
    patch: { gateOpen: true },
  },
  { id: "lamp-bare", room: "dock", detail: "lantern", ready: true },
  {
    id: "lamp-dirty",
    room: "dock",
    detail: "lantern",
    ready: true,
    patch: { lampMounted: true },
  },
  {
    id: "lamp-clean",
    room: "dock",
    detail: "lantern",
    ready: true,
    patch: { lampMounted: true, lensClean: true },
  },
  {
    id: "lamp-lit",
    room: "dock",
    detail: "lantern",
    ready: true,
    patch: { lampMounted: true, lensClean: true, lampLit: true },
  },
  { id: "gate-pressure", room: "dock", detail: "gate", patch: { water: 0 } },
  { id: "gate-equal", room: "dock", detail: "gate", ready: true },
  {
    id: "gate-open",
    room: "dock",
    detail: "gate",
    ready: true,
    patch: { gateOpen: true },
  },
  {
    id: "sea-first",
    room: "dock",
    ready: true,
    patch: { atSea: true, seaNode: "S", seaHistory: ["S"] },
  },
  {
    id: "sea-branch",
    room: "dock",
    ready: true,
    patch: { atSea: true, seaNode: "B", seaHistory: ["S", "B"] },
  },
  {
    id: "sea-beam",
    room: "dock",
    ready: true,
    patch: { atSea: true, seaNode: "C", seaHistory: ["S", "B", "C"] },
  },
  {
    id: "ending",
    room: "dock",
    ready: true,
    patch: { atSea: true, ended: true, seaNode: "T" },
  },
];
const rooms: Room[] = [
  "waiting",
  "concourse",
  "office",
  "workshop",
  "pump",
  "service",
  "lookout",
  "dock",
];
for (const room of rooms)
  for (const face of [0, 1] as const)
    for (const water of [0, 1, 2] as const) {
      if (room === "service" && water !== 0) continue;
      if (room === "lookout" && water !== 2) continue;
      fixtures.push({
        id: `audit-${room}-${face}-water${water}`,
        room,
        face,
        patch: { water },
        ready: room === "lookout",
      });
    }
const detailRooms: Partial<Record<Detail, Room>> = {
  shutter: "waiting",
  tray: "workshop",
  key: "office",
  drawer: "office",
  diagram: "office",
  belt: "pump",
  pipes: "pump",
  strainer: "pump",
  supports: "service",
  patch: "service",
  rings: "service",
  rack: "workshop",
  survey: "lookout",
  chart: "lookout",
  trace: "dock",
  depth: "dock",
  boat: "dock",
  lantern: "dock",
  gate: "dock",
  landward: "concourse",
};
for (const [detail, room] of Object.entries(detailRooms) as [Detail, Room][])
  fixtures.push({
    id: `audit-detail-${detail}`,
    room,
    detail,
    patch: room === "service" ? { water: 0 } : undefined,
    ready: room === "lookout",
  });
for (const water of [0, 1, 2] as const)
  for (const detail of ["boat", "depth", "trace"] as const) {
    fixtures.push({
      id: `audit-${detail}-water${water}-repaired`,
      room: "dock",
      detail,
      ready: true,
      patch: { water },
    });
  }
fixtures.push(
  {
    id: "audit-support-mid",
    room: "service",
    detail: "supports",
    patch: { water: 0, support: [1, 0] },
    selected: "crank",
  },
  {
    id: "audit-patch-one-bolt",
    room: "service",
    detail: "patch",
    patch: {
      water: 0,
      patchMounted: true,
      patchTurn: 1,
      patchBolts: [true, false, false, false],
    },
    selected: "pliers",
  },
  {
    id: "audit-draft-tools",
    room: "dock",
    detail: "boat",
    ready: true,
    patch: { tracing: true, items: { ...newGame().items, rod: "inventory" } },
    selected: "rod",
  },
  {
    id: "audit-case-taken",
    room: "service",
    detail: "rings",
    patch: {
      water: 0,
      caseOpen: true,
      rings: [0, 0, 0],
      items: { ...newGame().items, boatKit: "inventory" },
    },
  },
  {
    id: "audit-drawer-one-taken",
    room: "office",
    detail: "drawer",
    patch: {
      drawerOpen: true,
      items: { ...newGame().items, crank: "inventory" },
    },
  },
  {
    id: "audit-drawer-empty",
    room: "office",
    detail: "drawer",
    patch: {
      drawerOpen: true,
      items: { ...newGame().items, crank: "inventory", hookTip: "inventory" },
    },
  },
);
fixtures.push(
  {
    id: "audit-waiting-rear-open",
    room: "waiting",
    face: 1,
    ready: true,
    patch: { visited: ["waiting", "lookout"] },
  },
  {
    id: "audit-service-load-left",
    room: "service",
    patch: { water: 0, support: [2, 0] },
  },
  {
    id: "audit-service-load-right",
    room: "service",
    patch: { water: 0, support: [0, 2] },
  },
  {
    id: "audit-service-load-both",
    room: "service",
    patch: { water: 0, support: [2, 2] },
  },
);
for (const seaNode of ["A", "D", "E", "F", "X"])
  fixtures.push({
    id: `audit-sea-${seaNode}`,
    room: "dock",
    ready: true,
    patch: { atSea: true, seaNode, seaHistory: ["S", seaNode] },
  });
fixtures.push(
  {
    id: "targets-shutter-latches",
    room: "waiting",
    detail: "shutter",
    patch: { shutterOpen: false },
  },
  {
    id: "targets-office-unlocked",
    room: "office",
    patch: { keyTurn: 1, keyExtracted: true },
  },
  {
    id: "targets-office-open",
    room: "office",
    patch: { keyTurn: 1, drawerOpen: true },
  },
  {
    id: "targets-key-unlocked",
    room: "office",
    detail: "key",
    patch: { keyTurn: 1, keyExtracted: true },
  },
  {
    id: "targets-rack-taken",
    room: "workshop",
    face: 1,
    patch: { items: { ...newGame().items, patch: "inventory" } },
  },
  {
    id: "targets-belt-tested",
    room: "pump",
    detail: "belt",
    patch: { beltTested: true },
  },
  {
    id: "targets-strainer-clear",
    room: "pump",
    detail: "strainer",
    patch: { strainerClear: true },
  },
  {
    id: "targets-boat-repair",
    room: "dock",
    detail: "boat",
    patch: { water: 0 },
  },
  {
    id: "targets-patch-drained",
    room: "service",
    detail: "patch",
    ready: true,
    patch: { water: 0 },
  },
);
// Exhaustive independent left/right support states and captive-bolt states.
for (let left = 0; left < 4; left++)
  for (let right = 0; right < 4; right++) {
    const patch: Partial<Game> = {
      water: 0,
      pins: [left < 2, right < 2],
      support: [
        left === 1 || left === 2 ? 2 : 0,
        right === 1 || right === 2 ? 2 : 0,
      ],
    };
    fixtures.push({
      id: `pontoon-wide-${left}-${right}`,
      room: "service",
      patch,
    });
    fixtures.push({
      id: `pontoon-detail-${left}-${right}`,
      room: "service",
      detail: "supports",
      patch,
    });
  }
for (let mask = 0; mask < 16; mask++)
  fixtures.push({
    id: `patch-bolts-${mask}`,
    room: "service",
    detail: "patch",
    patch: {
      water: 0,
      patchMounted: true,
      patchTurn: 1,
      patchBolts: [0, 1, 2, 3].map((i) => !!(mask & (1 << i))),
    },
  });
function create(f: Fixture) {
  const g = newGame();
  Object.assign(g, {
    started: true,
    shutterOpen: true,
    room: f.room,
    face: f.face ?? 0,
    detail: f.detail ?? null,
  });
  if (f.ready)
    Object.assign(g, {
      water: 2,
      pins: [false, false],
      support: [0, 0],
      patchMounted: true,
      patchTurn: 1,
      patchBolts: [true, true, true, true],
      tankDry: true,
      boatInside: true,
      boatOutside: true,
      boatDry: true,
    });
  Object.assign(g, f.patch);
  g.items.lockingPins = g.pins.some((p) => !p) ? "inventory" : "absent";
  if (f.id.endsWith("-operation")) {
    g.items.crank = "inventory";
    g.items.patch = "inventory";
    g.items.pliers = "inventory";
  }
  return g;
}
export function VisualLab() {
  const [selected, setSelected] = useState<Item | undefined>(
    fixtures[0].selected,
  );
  const [message, setMessage] = useState("");
  const [index, setIndex] = useState(0),
    [g, setGame] = useState(() => create(fixtures[0]));
  const choose = (n: number) => {
    setIndex(n);
    setSelected(fixtures[n].selected);
    setGame(create(fixtures[n]));
    setMessage("");
  };
  const fixture = fixtures[index];
  const props = {
    game: g,
    selected,
    send: (a: Parameters<typeof act>[1]) => {
      const result = act(g, a);
      setGame(result.game);
      setMessage(result.message);
    },
  };
  return (
    <main className="app">
      <ActionBar>
        <section className="stage" aria-label={fixture.id}>
          {g.detail ? (
            <Details key={fixture.id} {...props} />
          ) : (
            <Scene {...props} />
          )}
          {g.detail && (
            <SceneAction
              aria-label="部屋へ戻る"
              onClick={() => props.send({ type: "back" })}
            >
              ⌄ 部屋へ戻る
            </SceneAction>
          )}
          {message && (
            <p className="toast" role="status">
              {message}
            </p>
          )}
        </section>
      </ActionBar>
      <div
        style={{ height: 88, display: "flex", alignItems: "center", gap: 20 }}
      >
        <label>
          検証場面{" "}
          <select
            aria-label="検証場面"
            value={index}
            onChange={(e) => choose(Number(e.target.value))}
          >
            {fixtures.map((f, i) => (
              <option key={f.id} value={i}>
                {f.id}
              </option>
            ))}
          </select>
        </label>
        <button onClick={() => choose((index + 1) % fixtures.length)}>
          次の場面
        </button>
        <select
          aria-label="検証用の道具"
          value={selected ?? ""}
          onChange={(e) => setSelected((e.target.value as Item) || undefined)}
        >
          <option value="">道具なし</option>
          {(Object.keys(g.items) as Item[])
            .filter((i) => g.items[i] === "inventory")
            .map((i) => (
              <option key={i} value={i}>
                {itemNames[i]}
              </option>
            ))}
        </select>
        <output aria-label="固定ピンの所持数">
          {g.items.lockingPins === "inventory"
            ? g.pins.filter((p) => !p).length
            : 0}
        </output>
        {g.items.lockingPins === "inventory" && (
          <div style={{ width: 64, height: 64 }}>
            <ItemArt item="lockingPins" game={g} />
          </div>
        )}
        <small>保存領域を使用しない描画検証</small>
      </div>
    </main>
  );
}
