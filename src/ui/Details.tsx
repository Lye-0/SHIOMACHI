import { closeup, scene, waitingSceneName } from "../content/assets";
import { Photo, Hit } from "./Primitives";
import { Pipes, Supports, type ControlProps } from "./PumpControls";
import {
  Shutter,
  Tray,
  KeyLock,
  Drawer,
  Diagram,
  Belt,
  Rings,
  Rack,
} from "./SmallPuzzles";
import {
  Strainer,
  Patch,
  BoatRepair,
  Lantern,
  Gate,
  Shore,
} from "./RepairControls";
import { Survey, Chart, Trace, Depth } from "./Navigation";
import { raised } from "../game/model";

export function Details(props: ControlProps) {
  const { game: g, send } = props;
  if (g.detail === "landward")
    return (
      <Photo src={scene("landward")} alt="中央が崩れ、水で隔てられた陸への橋" />
    );
  if (g.detail === "pipes") return <Pipes {...props} />;
  if (g.detail === "supports") return <Supports {...props} />;
  const components = {
    shutter: Shutter,
    tray: Tray,
    key: KeyLock,
    drawer: Drawer,
    diagram: Diagram,
    belt: Belt,
    rings: Rings,
    rack: Rack,
    strainer: Strainer,
    patch: Patch,
    boat: BoatRepair,
    lantern: Lantern,
    gate: Gate,
    shore: Shore,
    survey: Survey,
    chart: Chart,
    trace: Trace,
    depth: Depth,
  };
  if (g.detail && g.detail in components) {
    const Component = components[g.detail as keyof typeof components];
    return <Component {...props} />;
  }
  if (g.detail === "window")
    return (
      <>
        {g.room === "waiting" ? (
          <Photo
            src={scene(waitingSceneName(g))}
            alt="選んだ窓から見える岸と水面"
            style={{
              transform: "scale(2.6)",
              transformOrigin: g.face === 0 ? "22% 25%" : "27% 24%",
            }}
          />
        ) : g.room === "pump" ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              transform: "scale(2.2)",
              transformOrigin: "28% 42%",
            }}
          >
            <Photo src={scene("pump-back")} />
            <div
              className="pump-room-level"
              style={{ height: `${[3, 16, 30][g.water]}%` }}
            />
          </div>
        ) : (
          <Photo
            src={scene(
              g.water === 0
                ? "concourse-low"
                : g.water === 2
                  ? raised(g)
                    ? "concourse-high"
                    : "concourse-high-held"
                  : "concourse-mid",
            )}
          />
        )}
        {g.room === "concourse" && (
          <Hit
            label="柱と渡り板を記録する"
            x={12}
            y={8}
            w={50}
            h={70}
            onClick={() => send({ type: "record", id: "pontoon" })}
          />
        )}
      </>
    );
  return <Photo src={closeup(g.detail ?? "shutter")} />;
}
