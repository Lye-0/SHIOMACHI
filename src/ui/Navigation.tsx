import { useState } from "react";
import { closeup, scene, mechanism, itemImage } from "../content/assets";
import { boatReady, channels, type Item } from "../game/model";
import { projection } from "../game/bearings";
import { Photo, Hit, Icon } from "./Primitives";
import { HarborDrawing, HullDrawing, chartPoints } from "./drawings";
import type { ControlProps } from "./PumpControls";
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
      <button
        className="record-button"
        onClick={() => send({ type: "record", id: "bearings" })}
      >
        景色を記録する
      </button>
    </>
  );
}
export function Chart({ game: g, send }: ControlProps) {
  return (
    <>
      <Photo src={closeup("empty-desk")} />
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
      <button
        className="record-button"
        onClick={() => send({ type: "record", id: "chart" })}
      >
        記録に挟む
      </button>
    </>
  );
}
export function Trace({ game: g, send, selected }: ControlProps) {
  return (
    <>
      <Photo
        src={closeup(
          g.water === 0
            ? "trace"
            : g.water === 1
              ? "trace-mid"
              : g.gateOpen
                ? "trace-high-open"
                : "trace-high",
        )}
        alt="船台のくぼみ"
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
export function Depth({ game: g, send }: ControlProps) {
  const [view, setView] = useState<"boat" | "measure">("boat");
  const onBoat = g.water === 2 && boatReady(g);
  if (view === "boat")
    return (
      <>
        <Photo
          src={
            g.water === 1
              ? scene("dock-mid")
              : closeup(
                  g.water === 2
                    ? onBoat
                      ? "boat-floating"
                      : "boat-flooded"
                    : "boat-outside",
                )
          }
        />
        <button className="view-turn" onClick={() => setView("measure")}>
          棒と木型を見る
          <Icon name="right" />
        </button>
        {g.water === 2 && boatReady(g) && (
          <Hit
            label="船の水線を記録する"
            x={22}
            y={30}
            w={54}
            h={45}
            onClick={() => send({ type: "record", id: "waterline" })}
          />
        )}
      </>
    );
  return (
    <>
      <Photo src={closeup(onBoat ? "boat-floating" : "paper-desk")} />
      {g.tracing && (
        <div className={`depth-template ${onBoat ? "on-boat" : ""}`}>
          <HullDrawing showWater={false} />
        </div>
      )}
      {g.items.rod === "inventory" ? (
        <MeasureMarks game={g} send={send} onBoat={onBoat} />
      ) : (
        <p className="quiet-caption">まっすぐな棒を、置けそうだ。</p>
      )}
      <button className="view-turn" onClick={() => setView("boat")}>
        船を見る
        <Icon name="right" />
      </button>
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
                style={{ left: `${x}%`, top: "34%" }}
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
