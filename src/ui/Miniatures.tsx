import { closeup, itemImage, mechanism } from "../content/assets";
import { blocks, type Game } from "../game/model";
import { PontoonDrawing, PipeDrawing, HarborDrawing } from "./drawings";

export function TrayMiniature({ game: g }: { game: Game }) {
  return (
    <div className="room-tray-preview" aria-hidden="true">
      <svg viewBox="0 0 600 600" preserveAspectRatio="none">
        <rect width="600" height="600" fill="#241c11" />
        {blocks.map((b, i) => {
          if (i === 0 && g.trayOpen) return null;
          const x = (b.axis === "x" ? g.tray[i] : b.fixed) * 100,
            y = (b.axis === "y" ? g.tray[i] : b.fixed) * 100,
            w = (b.axis === "x" ? b.length : 1) * 100,
            h = (b.axis === "y" ? b.length : 1) * 100;
          return (
            <g key={i}>
              <image
                href={mechanism("wood-block")}
                x={x + 2}
                y={y + 2}
                width={w - 4}
                height={h - 4}
                preserveAspectRatio="none"
              />
              <circle
                cx={x + w / 2}
                cy={y + h / 2}
                r={i === 0 ? 12 : 5}
                fill={i === 0 ? "#ae9460" : "#40382c"}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
export function PaperMiniature({ game: g }: { game: Game }) {
  return (
    <div className="room-paper-preview" aria-hidden="true">
      {g.papers.map((piece, i) => (
        <div key={i}>
          <div
            className="mini-paper-rot"
            style={{ transform: `rotate(${g.paperTurns[i] * 90}deg)` }}
          >
            <div
              style={{
                position: "absolute",
                width: "200%",
                height: "200%",
                left: `${(-piece % 2) * 100}%`,
                top: `${-Math.floor(piece / 2) * 100}%`,
              }}
            >
              <PontoonDrawing flat />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
export function PipeMiniature({ className = "" }: { className?: string }) {
  return (
    <div className={`room-pipe-preview ${className}`} aria-hidden="true">
      <PipeDrawing />
    </div>
  );
}
export function MapMiniature({ game }: { game?: Game }) {
  return (
    <div className="room-chart-preview" aria-hidden="true">
      <HarborDrawing flat game={game} />
    </div>
  );
}
