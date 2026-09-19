import { useState } from "react";
import { act } from "../game/engine";
import {
  newGame,
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
  return g;
}
export function VisualLab() {
  const [index, setIndex] = useState(0),
    [g, setGame] = useState(() => create(fixtures[0]));
  const choose = (n: number) => {
    setIndex(n);
    setGame(create(fixtures[n]));
  };
  const fixture = fixtures[index];
  const props = {
    game: g,
    selected: fixture.selected,
    send: (a: Parameters<typeof act>[1]) =>
      setGame((current) => act(current, a).game),
  };
  return (
    <main className="app">
      <section className="stage" aria-label={fixture.id}>
        {g.detail ? (
          <Details key={fixture.id} {...props} />
        ) : (
          <Scene {...props} />
        )}
      </section>
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
        <small>保存領域を使用しない描画検証</small>
      </div>
    </main>
  );
}
