import { useState } from "react";
import { channels, seaNames, type Game } from "../game/model";
import { hull } from "../game/hull";
import { chartPoints } from "../game/bearings";
export { chartPoints, observer } from "../game/bearings";

export function PontoonDrawing({ flat = false }: { flat?: boolean } = {}) {
  return (
    <svg
      viewBox="0 0 600 600"
      preserveAspectRatio={flat ? "none" : "xMidYMid meet"}
      className="ink-drawing"
      aria-label="待合室の密閉箱、案内柱と別置きの支持ねじの断面図"
    >
      <g fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="24" y="24" width="552" height="552" strokeWidth=".6" />
        <path d="M45 90H555M45 330H555M140 112V310M152 112V310M390 112V310M402 112V310M160 218V150L270 114 380 150V218ZM177 165h40v28h-40zM320 165h40v53M155 218H385V266Q270 278 155 266ZM385 218 495 170V310H530V145H495" />
        <path
          d="M80 255q15-8 30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0"
          strokeWidth="1"
        />
        <path d="M160 184H380V232H160ZM385 184H495" strokeDasharray="6 6" />
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${62 + i * 172} 355)`}>
            <path d="M22 8V168H38V8M110 68v55M98 80l24-5m-24 16 24-5m-24 16 24-5m-24 16 24-5M88 123h44v39H88ZM80 162h62v8H80" />
            <g transform={i === 2 ? "translate(0 -20)" : undefined}>
              <path d="M0 0H140V32H0ZM38 40h40v22H38" />
            </g>
            {i === 2 && (
              <path d="M2 72q10-5 20 0t20 0t20 0t20 0t20 0t20 0M148 32V-10m-5 7 5-7 5 7" />
            )}
            <path
              d={
                i !== 0
                  ? "M92 34h36v8H92ZM110 42V68"
                  : "M92 48h36v8H92ZM110 56V68"
              }
            />
            {i === 0 ? (
              <path d="M12 49H77m-4-7v15" strokeWidth="6" />
            ) : (
              <>
                <circle cx="54" cy={i === 2 ? 30 : 50} r="6" />
                {i === 1 && <path d="M4 50h12m0-5-7 5 7 5" />}
              </>
            )}
          </g>
        ))}
      </g>
      <g fill="currentColor" fontFamily="serif" fontSize="15">
        <text x="47" y="61">
          待合室　床下断面
        </text>
        <text x="238" y="170">
          待合室
        </text>
        <text x="226" y="254">
          密閉箱
        </text>
        <text x="52" y="188">
          Ⅲ
        </text>
        <text x="52" y="253">
          Ⅱ
        </text>
        <text x="52" y="302">
          Ⅰ
        </text>
        <text x="67" y="550">
          固定ピン
        </text>
        <text x="229" y="550">
          荷重を受け、抜く
        </text>
        <text x="409" y="550">
          水位とともに浮く
        </text>
      </g>
    </svg>
  );
}

export function PipeDrawing() {
  return (
    <svg
      viewBox="0 0 900 600"
      className="ink-drawing"
      aria-label="吸込み、注水、排水と逃がし管の関係"
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M80 280V480H175V280M83 420q15-12 30 0t30 0t30 0M768 220V480H852V220M770 320q12-9 24 0t24 0t24 0" />
        <path d="M175 385H385M455 385H768M812 220V147H450V253H125V280" />
        <circle cx="420" cy="385" r="35" />
        <path d="m404 408 39-23-39-23Z" />
        <path
          d="M483 385V510H125V480"
          strokeDasharray="7 5"
          strokeWidth="1.5"
        />
        <path d="m467 495 16-8 16 8-16 8Z" />
        <path d="M483 487v-20m-7-4 14-6-14-6 14-6" strokeWidth="1.5" />
        {[
          [270, 385],
          [450, 196],
          [650, 385],
        ].map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="24" fill="#bca071" />
            <path d={`M${x - 16} ${y}h32M${x} ${y - 16}v32`} />
          </g>
        ))}
        <path d="m202 379 11 6-11 6m332-12 11 6-11 6m168-12 11 6-11 6M700 142l-11 5 11 5M265 248l-11 5 11 5" />
        <path
          d="M109 311h31v30h-31zM115 315v20m9-20v20m9-20v20"
          strokeWidth="1.5"
        />
      </g>
      <g fill="currentColor" fontFamily="serif" fontSize="22">
        <text x="76" y="542">
          船溜まり
        </text>
        <text x="785" y="542">
          海
        </text>
        <text x="393" y="456">
          駆動
        </text>
        <text x="265" y="347">
          左
        </text>
        <text x="493" y="202">
          中央
        </text>
        <text x="640" y="347">
          右
        </text>
        <text x="296" y="550" fontSize="15">
          圧力逃がし
        </text>
      </g>
    </svg>
  );
}

export function Landmark({
  node,
  x = 0,
  y = 0,
  size = 18,
}: {
  node: string;
  x?: number;
  y?: number;
  size?: number;
}) {
  const d: Record<string, string> = {
    S: "M-12 10V-7L0-15 12-7v17ZM-15 10h30",
    X: "M-12 10V-7L0-15 12-7v17ZM-15 10h30",
    A: "M-7 12V-12M7 12V-12M-11-12h8M3-12h8",
    B: "M0 4v13M-9-5a9 9 0 1 0 18 0 9 9 0 1 0-18 0",
    C: "M-16 12-8-15 0-1 7 5 11 1 17 12ZM-7-6l3 18",
    D: "M-15-13h30v6h-30ZM-11-7v20M11-7v20",
    E: "M0-15-13 8h26ZM0 8v9",
    F: "M-17 13Q0 3 17 13ZM-10 9V-2m-5 1 5-6 5 6M0 7V-10m-6 2 6-8 6 8M10 9V-2m-5 1 5-6 5 6",
    G: "M-8 14-5-14 5-16 9 14Z",
    H: "M-17 14Q-17-16 0-16T17 14H8Q8-6 0-6T-8 14Z",
    T: "M-6 13-3-10h6l3 23ZM-6-10l6-6 6 6M-10-3h-7M10-3h7",
  };
  return (
    <g
      transform={`translate(${x} ${y}) scale(${size / 18})`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d[node] ?? d.F} />
    </g>
  );
}
export const chartLabel = (node: string) =>
  node === "S" ? "船着き場 1" : node === "X" ? "船着き場 2" : seaNames[node];
export function channelPath(a: string, b: string) {
  if ((a === "D" && b === "T") || (b === "D" && a === "T"))
    return "M500 560C820 590 1160 580 1140 220";
  if ((a === "A" && b === "T") || (b === "A" && a === "T"))
    return "M280 100C680 -10 1080 0 1140 220";
  if ((a === "X" && b === "A") || (b === "X" && a === "A"))
    return "M70 520C8 480 8 370 8 200C8 8 280 0 280 100";
  return `M${chartPoints[a].join(" ")}L${chartPoints[b].join(" ")}`;
}
export function HarborDrawing({
  game: g,
  mark,
  flat = false,
  route,
  onChannel,
}: {
  route?: string[];
  onChannel?: (a: string, b: string) => void;
  game?: Game;
  mark?: (node: string) => void;
  flat?: boolean;
}) {
  const [hovered, setHovered] = useState<string>();
  const tail = route?.at(-1);
  const adjacent = (node: string) =>
    !!tail &&
    tail !== "T" &&
    channels.some(
      ([a, b]) => (a === tail && b === node) || (b === tail && a === node),
    );
  const selectable = (node: string) =>
    !route ||
    route.includes(node) ||
    (!tail ? node === "S" || node === "X" : adjacent(node));
  return (
    <svg
      viewBox="0 0 1200 600"
      preserveAspectRatio={flat ? "none" : "xMidYMid meet"}
      className="ink-drawing harbor-drawing"
      aria-label="水路と海底断面の測量図"
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M50 80q100-60 171 20l45 110 61-80q72-38 133-22l70-39 34 65 85-102 500-4M41 556l188-14 90 39 182-7 113-69 110 34 432-31" />
        {channels.map(([a, b, z], i) => {
          const [ax, ay] = chartPoints[a],
            [bx, by] = chartPoints[b],
            x =
              a === "X" && b === "A"
                ? 35
                : a === "A" && b === "T"
                  ? 725
                  : (ax + bx) / 2,
            y =
              a === "X" && b === "A"
                ? 310
                : a === "A" && b === "T"
                  ? 65
                  : (ay + by) / 2,
            depth = Math.round((3 - z) * 100);
          const d = channelPath(a, b);
          const offset: Record<string, [number, number]> = {
            "D:T": [930, 535],
            "F:T": [970, 315],
            "G:H": [920, 210],
          };
          const center = offset[`${a}:${b}`] ?? [x, y];
          return (
            <g key={i}>
              <path d={d} strokeDasharray="5 4" opacity=".5" />
              {!route && (
                <g
                  transform={`translate(${center[0]} ${center[1]})`}
                  role={onChannel ? "button" : undefined}
                  tabIndex={onChannel ? 0 : undefined}
                  aria-label={
                    onChannel
                      ? `${chartLabel(a)}から${chartLabel(b)}の水深を拡大`
                      : undefined
                  }
                  onClick={() => onChannel?.(a, b)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onChannel?.(a, b);
                    }
                  }}
                  className={onChannel ? "sounding-target" : undefined}
                >
                  <rect
                    x="-25"
                    y="-33"
                    width="50"
                    height="72"
                    fill="#fff"
                    stroke="none"
                  />
                  <path
                    d={`M-21-28H21M-20 ${-28 + depth * 0.8}H20`}
                    strokeWidth="2"
                  />
                  <path
                    d={`M-18-28v${depth * 0.8}M18-28v${depth * 0.8}`}
                    strokeWidth=".65"
                  />
                  {Array.from({ length: depth - 1 }, (_, n) => (
                    <path
                      key={n}
                      d={`M-18 ${-28 + (n + 1) * 0.8}h${(n + 1) % 5 === 0 ? 10 : 4}`}
                    />
                  ))}
                </g>
              )}
              {route && (
                <path
                  d={d}
                  className="route-channel-hit"
                  stroke="transparent"
                  strokeWidth="24"
                  pointerEvents="stroke"
                  role="button"
                  tabIndex={0}
                  aria-label={`${chartLabel(a)}から${chartLabel(b)}の水深を拡大`}
                  onClick={() => onChannel?.(a, b)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onChannel?.(a, b);
                    }
                  }}
                >
                  <title>
                    {chartLabel(a)} — {chartLabel(b)}：水深を見る
                  </title>
                </path>
              )}
            </g>
          );
        })}
        {Object.entries(chartPoints).map(([node, [x, y]]) => (
          <g
            key={node}
            onClick={() => selectable(node) && mark?.(node)}
            role={mark ? "button" : undefined}
            tabIndex={mark && selectable(node) ? 0 : -1}
            aria-disabled={mark ? !selectable(node) : undefined}
            onMouseEnter={() => setHovered(node)}
            onMouseLeave={() => setHovered(undefined)}
            onFocus={() => setHovered(node)}
            onBlur={() => setHovered(undefined)}
            aria-label={
              mark
                ? `${node === "S" ? "船着き場 1" : node === "X" ? "船着き場 2" : seaNames[node]}を測量図で選ぶ`
                : undefined
            }
            onKeyDown={(e) => {
              if (
                mark &&
                selectable(node) &&
                (e.key === "Enter" || e.key === " ")
              ) {
                e.preventDefault();
                mark(node);
              }
            }}
            className={mark ? "map-mark" : ""}
          >
            {mark && (
              <circle
                cx={x}
                cy={y}
                r={route ? 48 : 40}
                fill="transparent"
                stroke="none"
                pointerEvents="all"
              />
            )}
            <circle cx={x} cy={y} r="27" fill="#fff" stroke="none" />
            {route && selectable(node) && !route.includes(node) && (
              <circle
                cx={x}
                cy={y}
                r="34"
                stroke="#785d3b"
                strokeWidth="2"
                opacity=".55"
              />
            )}
            {route && tail === node && (
              <circle cx={x} cy={y} r="36" stroke="#884c35" strokeWidth="3" />
            )}
            {route && hovered === node && (
              <g pointerEvents="none">
                <rect
                  x={Math.min(1080, Math.max(5, x - 65))}
                  y={y < 75 ? y + 45 : y - 72}
                  width="130"
                  height="28"
                  rx="3"
                  fill="#ead6af"
                  stroke="none"
                />
                <text
                  x={Math.min(1145, Math.max(70, x))}
                  y={y < 75 ? y + 65 : y - 52}
                  textAnchor="middle"
                  fill="currentColor"
                  stroke="none"
                  fontSize="18"
                >
                  {chartLabel(node)}
                </text>
              </g>
            )}
            <Landmark node={node} x={x} y={y} size={node === "T" ? 28 : 18} />
            {(route?.includes(node) ||
              (!route && g?.chartMarks.includes(node))) && (
              <circle cx={x} cy={y} r="27" stroke="#884c35" strokeWidth="2" />
            )}
          </g>
        ))}
        {route &&
          tail &&
          hovered &&
          !route.includes(hovered) &&
          adjacent(hovered) && (
            <path
              className="route-preview"
              d={channelPath(tail, hovered)}
              stroke="#884c35"
              strokeWidth="3"
              strokeDasharray="8 7"
              pointerEvents="none"
            />
          )}
        {route &&
          route
            .slice(1)
            .map((node, i) => (
              <path
                key={`route-${i}`}
                d={channelPath(route[i], node)}
                stroke="#884c35"
                strokeWidth="4"
                pointerEvents="none"
              />
            ))}
        {g &&
          Array.from(
            { length: Math.floor(g.chartMarks.length / 2) },
            (_, i) => {
              const a = chartPoints[g.chartMarks[i * 2]],
                b = chartPoints[g.chartMarks[i * 2 + 1]];
              if (!a || !b) return null;
              const dx = b[0] - a[0],
                dy = b[1] - a[1];
              return (
                <path
                  key={`bearing-${i}`}
                  d={`M${a[0] - dx * 4} ${a[1] - dy * 4}L${b[0] + dx * 4} ${b[1] + dy * 4}`}
                  stroke="#785d3b"
                  strokeWidth="2.5"
                  strokeDasharray="10 4"
                  opacity=".8"
                  pointerEvents="none"
                />
              );
            },
          )}
        <path d="M618 546h105m-105-5v10m35-10v10m35-10v10m35-10v10" />
      </g>
      <g fill="currentColor" fontFamily="serif">
        <text x="618" y="576" fontSize="15">
          一目盛 一糎・長線 五糎
        </text>
        <text x="380" y="35" fontSize="20">
          渡船場 測量図
        </text>
        <text x="740" y="551" fontSize="18">
          Ⅲ 水面基準
        </text>
      </g>
    </svg>
  );
}

export function HullDrawing({
  showWater = true,
  showScale = true,
}: {
  showWater?: boolean;
  showScale?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 800 450"
      className="ink-drawing"
      aria-label="船台から写した船底の輪郭"
    >
      <g fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M106 134Q130 284 400 300Q670 284 694 134M106 134H694M86 134V360M714 134V360" />
        <path
          d="M106 145Q130 313 400 327Q670 313 694 145M86 360H714"
          strokeWidth="1.2"
        />
        <path d="M400 300V370m-6-70h12" />
        {showWater && (
          <path
            d={`M65 ${hull.waterline}H730`}
            strokeDasharray="8 5"
            stroke="#476364"
          />
        )}
        {showScale && (
          <>
            <path d="M716 175V340" />
            {Array.from({ length: 81 }, (_, i) => (
              <path
                key={i}
                d={`M${i % 5 ? 714 : 707} ${hull.keel - (i * hull.step) / 10}h${i % 5 ? 8 : 18}`}
              />
            ))}
          </>
        )}
      </g>
      {showScale && (
        <text
          x="710"
          y="358"
          fill="currentColor"
          fontFamily="serif"
          fontSize="16"
        >
          一糎
        </text>
      )}
    </svg>
  );
}
