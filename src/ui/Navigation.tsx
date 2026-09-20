import { useState } from "react";
import { closeup, scene, mechanism, itemImage } from "../content/assets";
import { boatReady, channels, type Item } from "../game/model";
import { projection } from "../game/bearings";
import { Photo, Hit, Icon } from "./Primitives";
import { HarborDrawing, HullDrawing, chartPoints } from "./drawings";
import type { ControlProps } from "./PumpControls";
import { DockView } from "./DockView";
import { MeasureMarks } from "./MeasureMarks";

const markerNames: Record<string, string> = {
  A: "marker-twin",
  B: "marker-ring",
  C: "marker-rock",
  D: "marker-gate",
  E: "marker-triangle",
  F: "marker-islet",
  T: "marker-light",
  X: "marker-landing",
};
export function SurveyFrame({ position }: { position: number }) {
  return (
    <>
      <Photo src={scene("survey-sea")} alt="観測窓から見える二組の見通し標" />
      <SurveyMarkers position={position} />
    </>
  );
}
export function SurveyMarkers({
  position,
  miniature = false,
}: {
  position: number;
  miniature?: boolean;
}) {
  const nodes = (["A", "B", "D", "E"] as const)
    .map((node) => ({ node, ...projection(node, position) }))
    .sort((a, b) => a.scale - b.scale);
  return (
    <>
      {nodes.map((p) => (
        <img
          key={p.node}
          className="survey-marker"
          src={mechanism(markerNames[p.node])}
          alt=""
          style={{
            left: `${miniature ? 13 + p.x * 0.76 : p.x}%`,
            top: miniature ? "31%" : "38%",
            width: `${7 * p.scale * (miniature ? 0.75 : 1)}%`,
            height: `${25 * p.scale * (miniature ? 0.55 : 1)}%`,
            transform: "translate(-50%,-15%)",
            zIndex: Math.round(p.scale * 10) + 1,
          }}
        />
      ))}
    </>
  );
}
export function Survey({ game: g, send }: ControlProps) {
  return (
    <>
      <SurveyFrame position={g.surveyPosition} />
      <div className="window-rail">
        <div
          className="viewfinder-foot"
          style={{ left: `${15 + g.surveyPosition * 17.5}%` }}
        />
        {[0, 1, 2, 3, 4].map((i) => (
          <button
            key={i}
            aria-label={`観測窓の位置 ${i + 1}`}
            aria-pressed={g.surveyPosition === i}
            onClick={() => send({ type: "surveyPosition", value: i })}
          />
        ))}
      </div>
    </>
  );
}
export function Chart({ game: g, send }: ControlProps) {
  return (
    <>
      <Photo
        src={scene("lookout")}
        style={{ filter: "brightness(.45) blur(2px)" }}
      />
      <div
        className="rotatable-document"
        style={{
          transform: `rotate(${g.mapTurn * 90}deg) scale(${g.mapTurn % 2 ? 0.63 : 1})`,
        }}
      >
        <Photo
          src={closeup("paper-desk")}
          alt="古い測量図"
          style={{ clipPath: "polygon(14% 5%,86% 6%,90% 91%,9% 90%)" }}
        />
        <div className="document-ink chart-sheet">
          <HarborDrawing
            game={g}
            mark={(node) => send({ type: "chartMark", node })}
          />
        </div>
      </div>
      <button
        className="paper-turn"
        aria-label="測量図を回す"
        onClick={() => send({ type: "mapTurn" })}
      >
        ↻
      </button>
      {g.chartMarks.length > 0 && (
        <button
          className="chart-clear"
          onClick={() => send({ type: "chartClear" })}
        >
          線を消す
        </button>
      )}
      {g.chartMarks.length % 2 === 1 && (
        <p className="chart-guide">もう一つの標を選ぶ。</p>
      )}
    </>
  );
}
export function Trace({ game: g, send, selected }: ControlProps) {
  return (
    <>
      <div className="trace-surroundings">
        <DockView game={g} />
      </div>
      <Photo src={closeup("trace")} style={{ clipPath: "inset(85% 0 0 0)" }} />
      <img
        className="trace-cradle"
        src={mechanism("cradle")}
        alt="岸上に置かれた予備船台のくぼみ"
      />
      <Hit
        label="木型の輪郭を写し取る"
        x={19}
        y={20}
        w={63}
        h={58}
        onClick={() => send({ type: "trace", tool: selected })}
      />
      {g.tracing && (
        <div className="tracing-in-hand">
          <HullDrawing showWater={false} />
        </div>
      )}
    </>
  );
}
export function Depth({ game: g }: ControlProps) {
  return (
    <>
      <Photo
        src={closeup(`gauge-${["low", "mid", "high"][g.water]}`)}
        alt="岸壁に固定された水位目盛と水面"
        style={{
          transform: "scale(2)",
          transformOrigin: `100% ${[95, 85, 65][g.water]}%`,
        }}
      />
      <p className="observation-caption">岸壁に固定された目盛と、水面。</p>
    </>
  );
}
export function Draft({ game: g, send, selected }: ControlProps) {
  const [paper, setPaper] = useState(false),
    [rod, setRod] = useState(false);
  return (
    <>
      <Photo
        src={closeup("boat-floating")}
        alt="船尾側から見た、浮かんだ船と水線"
      />
      {paper && g.tracing && (
        <div className="depth-template on-boat">
          <HullDrawing showWater={false} />
        </div>
      )}
      {rod && g.items.rod === "inventory" && (
        <MeasureMarks game={g} send={send} onBoat />
      )}
      {selected === "rod" && !rod && (
        <Hit
          label="船べりに棒を添える"
          x={75}
          y={15}
          w={23}
          h={65}
          onClick={() => setRod(true)}
        />
      )}
      <div className="observation-actions">
        {g.tracing && (
          <button aria-pressed={paper} onClick={() => setPaper(!paper)}>
            {paper ? "写しをしまう" : "記録帳の写しを重ねる"}
          </button>
        )}
        {rod && <button onClick={() => setRod(false)}>棒をしまう</button>}
      </div>
    </>
  );
}
export function SeaScene({ game: g, send }: ControlProps) {
  const next = channels
    .filter(([a, b]) => a === g.seaNode || b === g.seaNode)
    .map(([a, b]) => (a === g.seaNode ? b : a))
    .filter((n) => n !== "S");
  const previous =
    g.seaHistory.length > 1 ? g.seaHistory[g.seaHistory.length - 2] : "S";
  const choices = next.filter((n) => n !== previous);
  return (
    <>
      <Photo
        src={scene(g.ended ? "ending" : "sea-night")}
        alt="船首から望む水路"
      />
      {!g.ended &&
        choices.map((node, i) => {
          const x =
            choices.length === 1 ? 50 : 22 + (i * 56) / (choices.length - 1);
          return (
            <div key={node}>
              <img
                className="sea-marker"
                src={mechanism(markerNames[node] ?? "marker-light")}
                alt=""
                style={{
                  left: `${x}%`,
                  top: "34%",
                  width: node === "F" ? "16%" : undefined,
                }}
              />
              <Hit
                label={`${choices.length === 1 ? "正面" : i === 0 ? "左" : i === choices.length - 1 ? "右" : "中央"}の水路へ進む`}
                x={x - 12}
                y={35}
                w={24}
                h={47}
                onClick={() => send({ type: "sail", node })}
              />
            </div>
          );
        })}
      {g.ended ? (
        <div className="ending-copy">
          <span>潮待ち</span>
          <p>灯がひとつ、遠ざかった。</p>
          <button onClick={() => send({ type: "returnDock" })}>
            出航前の渡船場へ
          </button>
        </div>
      ) : (
        <button
          className="sea-return"
          onClick={() => send({ type: "returnDock" })}
        >
          渡船場へ戻る
        </button>
      )}
    </>
  );
}
