import type { CSSProperties } from "react";
import { scene, closeup, mechanism, itemImage } from "../content/assets";
import { boatReady, type Game } from "../game/model";
import { Photo } from "./Primitives";

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
      {!g.gateOpen && (
        <div className="gate-miniature" aria-hidden="true">
          <svg width="0" height="0">
            <defs>
              <clipPath id="gate-hardware" clipPathUnits="objectBoundingBox">
                <rect x=".32" y=".018" width=".108" height=".44" rx=".004" />
                <rect x=".571" y=".018" width=".108" height=".44" rx=".004" />
                <rect x=".06" y=".548" width=".875" height=".11" rx=".05" />
                <rect x=".123" y=".45" width=".093" height=".31" rx=".015" />
                <rect x=".43" y=".474" width=".14" height=".272" rx=".013" />
                <rect x=".785" y=".45" width=".09" height=".31" rx=".015" />
              </clipPath>
            </defs>
          </svg>
          <Photo
            src={closeup("gate")}
            style={{ clipPath: "url(#gate-hardware)" }}
          />
          <div
            className="gate-level inner"
            style={{ "--fill": `${[8, 44, 80][g.water]}%` } as CSSProperties}
          />
          <div
            className="gate-level outer"
            style={{ "--fill": "80%" } as CSSProperties}
          />
        </div>
      )}
      {g.gateOpen && (
        <Photo
          src={scene("dock-high-open")}
          style={{ clipPath: "polygon(55% 10%,77% 10%,77% 38%,55% 38%)" }}
        />
      )}
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
