import type { CSSProperties } from "react";
import { scene, mechanism, itemImage } from "../content/assets";
import { boatReady, type Game } from "../game/model";
import { Photo } from "./Primitives";
import { GateView } from "./GateView";

export const dockSceneName = (g: Game) =>
  g.water === 0
    ? "dock-low"
    : g.water === 1
      ? "dock-mid"
      : boatReady(g)
        ? "dock-high"
        : "dock-high-flooded";

/** One source of physical state; close-up cameras may use dedicated photographs. */
export function DockView({
  game: g,
  style,
}: {
  game: Game;
  style?: CSSProperties;
}) {
  const sunk = g.water === 2 && !boatReady(g);
  return (
    <div className="world-frame" style={style}>
      <Photo src={scene(dockSceneName(g))} alt="船溜まりの船・船台・水門" />
      <svg width="0" height="0" aria-hidden="true">
        <defs>
          <clipPath id="gate-door-surface" clipPathUnits="objectBoundingBox">
            <path d="M.23 .315 Q.5 .095 .77 .315 L.77 .91 L.23 .91Z" />
          </clipPath>
        </defs>
      </svg>
      <div className="gate-miniature" aria-hidden="true">
        <GateView game={g} />
      </div>
      {g.boatOutside && !sunk && (
        <span
          className="world-overlay item-art kit-left"
          style={{
            left: g.water === 2 ? "30.6%" : "32.3%",
            top: "45.5%",
            width: "10%",
            height: "10%",
            filter: "brightness(.65)",
          }}
        >
          <img src={itemImage("boatKit")} alt="" />
        </span>
      )}
      <img
        className="world-overlay"
        src={mechanism(g.lampMounted ? "boat-lamp" : "boat-lamp-bare")}
        alt=""
        style={{
          left: "64%",
          top: `${37 + (sunk ? 6 : 0)}%`,
          width: "4%",
          height: "7%",
          objectFit: "contain",
          filter: g.lampLit
            ? "brightness(1.5) drop-shadow(0 0 8px #ffd079)"
            : "brightness(.55)",
        }}
      />
    </div>
  );
}
