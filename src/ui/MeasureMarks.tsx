import type { PointerEvent } from "react";
import { itemImage } from "../content/assets";
import type { ControlProps } from "./PumpControls";
import { hull } from "../game/hull";

/** The traced keel and ten-centimetre steps share HullDrawing's 800×450 coordinates. */
export function MeasureMarks({
  game: g,
  send,
  onBoat = false,
}: ControlProps & { onBoat?: boolean }) {
  const scale = onBoat ? 1 : 0.7,
    top = onBoat ? 0 : 12,
    keel = top + ((scale * hull.keel) / hull.height) * 100,
    step = ((scale * hull.step) / 10 / hull.height) * 100;
  const move = (
    e: PointerEvent<HTMLButtonElement>,
    type: "rodMark" | "waterMark",
  ) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    const rect = e.currentTarget.closest(".stage")!.getBoundingClientRect();
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    send({
      type,
      value: Math.max(0, Math.min(80, Math.round((keel - y) / step))),
    });
  };
  return (
    <>
      <img
        className="measure-rod-photo"
        src={itemImage("rod")}
        alt="測深棒"
        style={
          onBoat
            ? { left: "87.75%", top: "2%", height: "70.4%" }
            : { left: "73.9%", top: "13.4%", height: "49.28%" }
        }
      />
      <svg
        className="measure-ticks"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
        aria-hidden="true"
      >
        {Array.from({ length: 81 }, (_, i) => (
          <line
            key={i}
            x1={onBoat ? 88.9 : 74.7}
            x2={(onBoat ? 88.9 : 74.7) + (i % 5 === 0 ? 1.3 : 0.65)}
            y1={keel - i * step}
            y2={keel - i * step}
            stroke="#eadbc0"
            strokeWidth={i % 5 === 0 ? 0.1 : 0.055}
          />
        ))}
      </svg>
      {(["rodMark", "waterMark"] as const).map((type, i) => (
        <button
          key={type}
          role="slider"
          aria-label={i ? "水線の印を動かす" : "船底の印を動かす"}
          aria-valuemin={0}
          aria-valuemax={80}
          aria-valuenow={g[type]}
          aria-valuetext={`${g[type]} cm`}
          className={`measure-grip ${i ? "water" : ""}`}
          style={{
            top: `${keel - g[type] * step}%`,
            left: onBoat ? (i ? "91%" : "83%") : i ? "78%" : "70%",
          }}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => move(e, type)}
          onKeyDown={(e) => {
            const d = e.key === "ArrowUp" ? 1 : e.key === "ArrowDown" ? -1 : 0;
            if (d) {
              e.preventDefault();
              send({ type, value: g[type] + d });
            }
          }}
        >
          <span />
          {i ? "◀" : "▶"}
        </button>
      ))}
      <p className={`measure-key ${onBoat ? "on-water" : ""}`}>
        白は船底、青は水線。差 {Math.abs(g.waterMark - g.rodMark)} cm
      </p>
    </>
  );
}
