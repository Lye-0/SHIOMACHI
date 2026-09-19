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
      aria-label="案内柱を上下する桟橋の断面図"
    >
      <g fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="24" y="24" width="552" height="552" strokeWidth=".6" />
        <path d="M45 90H555M45 340H555" strokeWidth=".6" />
        <path d="M75 310H530V145H495V310M145 110V310M160 110V310M385 110V310M400 110V310" />
        <path d="M124 230H422V246H124ZM177 246V274H370V246" />
        <path
          d="M124 163H422V179H124ZM177 179V207H370V179"
          strokeDasharray="7 7"
        />
        <path
          d="M80 253q12-8 24 0t24 0t24 0t24 0t24 0t24 0t24 0t24 0t24 0t24 0t24 0t24 0t24 0t24 0t24 0t24 0"
          strokeWidth="1.3"
        />
        <path d="M422 231 495 170M422 164H495M110 293V246H126M410 293V246H426" />
        <path d="M86 382H245V404H86ZM124 404V485M190 404V485M100 485H222V510H100Z" />
        <rect x="137" y="425" width="70" height="17" />
        <circle cx="209" cy="433" r="12" />
        <path d="M157 465V526M149 470l16-4M149 478l16-4M149 486l16-4M149 494l16-4M149 502l16-4" />
        <path d="M337 382H509V404H337ZM381 404V485M449 404V485M350 485H480V510H350Z" />
        <path d="M408 406V527M399 417l17-4M399 426l17-4M399 435l17-4M399 444l17-4M399 453l17-4M399 462l17-4M399 471l17-4M399 480l17-4M399 489l17-4" />
        <circle cx="449" cy="433" r="12" />
        <path d="M474 434H536M525 428l11 6-11 6" />
        <path d="M277 444h35m-10-8 10 8-10 8" />
      </g>
      <g fill="currentColor" fontFamily="serif" fontSize="16">
        <text x="47" y="61">
          係留桟橋　断面
        </text>
        <text x="51" y="184">
          Ⅲ
        </text>
        <text x="51" y="250">
          Ⅱ
        </text>
        <text x="51" y="301">
          Ⅰ
        </text>
        <text x="89" y="550">
          荷重受け
        </text>
        <text x="360" y="550">
          固定ピン
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
export function HarborDrawing({
  game: g,
  mark,
  flat = false,
}: {
  game?: Game;
  mark?: (node: string) => void;
  flat?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 900 600"
      preserveAspectRatio={flat ? "none" : "xMidYMid meet"}
      className="ink-drawing harbor-drawing"
      aria-label="水路と海底断面の測量図"
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M50 80q100-60 171 20l45 110 61-80q72-38 133-22l70-39 34 65 85-102 200-4M41 556l188-14 90 39 182-7 113-69 110 34 132-31" />
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
            depth = Math.round((3 - z) * 10);
          const d =
            a === "A" && b === "T"
              ? `M${ax} ${ay}C680 -10 855 10 ${bx} ${by}`
              : a === "X" && b === "A"
                ? "M70 520C8 480 8 370 8 200C8 8 280 0 280 100"
                : `M${ax} ${ay}L${bx} ${by}`;
          return (
            <g key={i}>
              <path d={d} strokeDasharray="5 4" opacity=".5" />
              <g transform={`translate(${x} ${y})`}>
                <rect
                  x="-25"
                  y="-33"
                  width="50"
                  height="72"
                  fill="#fff"
                  stroke="none"
                />
                <path
                  d={`M-21-28H21M-20 ${-28 + depth * 6}H20`}
                  strokeWidth="2"
                />
                <path
                  d={`M-18-28v${depth * 6}M18-28v${depth * 6}`}
                  strokeWidth=".65"
                />
                {Array.from({ length: depth - 1 }, (_, n) => (
                  <path key={n} d={`M-18 ${-22 + n * 6}h7`} />
                ))}
              </g>
            </g>
          );
        })}
        {Object.entries(chartPoints).map(([node, [x, y]]) => (
          <g
            key={node}
            onClick={() => mark?.(node)}
            role={mark ? "button" : undefined}
            tabIndex={mark ? 0 : undefined}
            aria-label={
              mark
                ? `${node === "S" ? "船着き場 1" : node === "X" ? "船着き場 2" : seaNames[node]}を測量図で選ぶ`
                : undefined
            }
            onKeyDown={(e) => {
              if (mark && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                mark(node);
              }
            }}
            className={mark ? "map-mark" : ""}
          >
            <circle cx={x} cy={y} r="27" fill="#fff" stroke="none" />
            <Landmark node={node} x={x} y={y} />
            {g?.chartMarks.includes(node) && (
              <circle cx={x} cy={y} r="27" stroke="#884c35" strokeWidth="2" />
            )}
          </g>
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
        <text x="618" y="576" fontSize="18">
          一目盛 十糎
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

export function HullDrawing({ showWater = true }: { showWater?: boolean }) {
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
        <path d="M716 175V340" />
        {Array.from({ length: 9 }, (_, i) => (
          <path
            key={i}
            d={`M${i % 2 ? 713 : 707} ${hull.keel - i * hull.step}h${i % 2 ? 12 : 18}`}
          />
        ))}
      </g>
      <text
        x="710"
        y="358"
        fill="currentColor"
        fontFamily="serif"
        fontSize="16"
      >
        十糎
      </text>
    </svg>
  );
}
