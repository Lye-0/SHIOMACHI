import { SceneAction } from "./ActionBar";
import { useState } from "react";
import { closeup, scene, mechanism, itemImage } from "../content/assets";
import { channels } from "../game/model";
import { projection } from "../game/bearings";
import { Photo, Hit } from "./Primitives";
import {
  HarborDrawing,
  HullDrawing,
  chartPoints,
  chartLabel,
} from "./drawings";
import type { ControlProps } from "./PumpControls";
import { DockView } from "./DockView";
import { MeasureMarks } from "./MeasureMarks";

const markerNames: Record<string, string> = {
  A: "marker-twin",
  B: "marker-ring",
  D: "marker-gate",
  E: "marker-triangle",
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
  const [section, setSection] = useState<[string, string]>();
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
            onChannel={(a, b) => setSection([a, b])}
            mark={(node) => send({ type: "chartMark", node })}
          />
        </div>
      </div>
      {section && (
        <div className="chart-sounding">
          <Sounding a={section[0]} b={section[1]} />
          <button onClick={() => setSection(undefined)}>断面を閉じる</button>
        </div>
      )}
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
      {!g.tracing && (
        <Hit
          label="木型の輪郭を写し取る"
          x={6}
          y={35}
          w={88}
          h={53}
          shape="0,0 6,0 10,17 25,45 50,63 75,45 91,15 96,0 100,0 100,100 0,100"
          onClick={() => send({ type: "trace", tool: selected })}
        />
      )}
      {g.tracing && (
        <div className="tracing-in-hand">
          <HullDrawing showWater={false} showScale={false} />
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
          <HullDrawing showWater={false} showScale={false} />
        </div>
      )}
      {rod && g.items.rod === "inventory" && (
        <MeasureMarks game={g} send={send} onBoat />
      )}
      {selected === "rod" && !rod && (
        <Hit
          label="船べりに棒を添える"
          x={86}
          y={28}
          w={5}
          h={38}
          onClick={() => setRod(true)}
        />
      )}
      <div className="observation-actions">
        {g.tracing && (
          <SceneAction aria-pressed={paper} onClick={() => setPaper(!paper)}>
            {paper ? "写しをしまう" : "記録帳の写しを重ねる"}
          </SceneAction>
        )}
        {rod && (
          <SceneAction onClick={() => setRod(false)}>棒をしまう</SceneAction>
        )}
      </div>
    </>
  );
}
export function Sounding({ a, b }: { a: string; b: string }) {
  const edge = channels.find(
    ([x, y]) => (x === a && y === b) || (y === a && x === b),
  );
  if (!edge) return null;
  const depth = Math.round((3 - edge[2]) * 100);
  return (
    <div className="sounding-detail">
      <span>
        {chartLabel(a)} — {chartLabel(b)}
      </span>
      <svg
        viewBox="0 0 230 300"
        role="img"
        aria-label="水面から海底までの拡大断面。小目盛り1cm、長線5cm"
      >
        <g stroke="currentColor" fill="none">
          <path d="M50 30H200M65 30V270" />
          {Array.from({ length: 81 }, (_, i) => (
            <path key={i} d={`M65 ${30 + i * 3}h${i % 5 === 0 ? 20 : 9}`} />
          ))}
          <path d={`M65 ${30 + depth * 3}H200`} strokeWidth="3" />
        </g>
        <g fill="currentColor" fontSize="13">
          <text x="100" y="22">
            Ⅲ 水面
          </text>
          <text x="110" y={48 + depth * 3}>
            海底
          </text>
          {[0, 10, 20, 30, 40, 50, 60, 70, 80].map((i) => (
            <text key={i} x="32" y={34 + i * 3}>
              {i}
            </text>
          ))}
        </g>
      </svg>
      <small>小目盛り 1cm ／ 長線 5cm</small>
    </div>
  );
}
export function SeaScene({ game: g, send }: ControlProps) {
  const [chart, setChart] = useState(false);
  const [soundingOpen, setSoundingOpen] = useState(false);
  const [section, setSection] = useState<[string, string]>();
  const failureImage =
    g.voyageFailure === "beam"
      ? "voyage-beam"
      : g.voyageFailure === "heading"
        ? "voyage-entrance"
        : ({
            A: "voyage-twin",
            D: "voyage-gate",
            F: "voyage-islet",
            T: "voyage-light",
          }[g.seaNode] ?? "voyage-entrance");
  if (g.atSea)
    return (
      <>
        <Photo
          src={scene(g.ended ? "voyage-arrived" : failureImage)}
          alt={
            g.ended
              ? "灯台を越え、開けた海へ出た船"
              : "計画した航路の途中で止まった船"
          }
        />
        <div className="voyage-result">
          <p>
            {g.ended
              ? "岩場が途切れた。目の前に、海が開けている。"
              : g.voyageFailure === "beam"
                ? "水面のすぐ下に、太い梁がある。ここは通れない。"
                : "船底に、浅瀬が触れた。船を止めた。"}
          </p>
        </div>
        <SceneAction
          onClick={() => {
            setChart(false);
            send({ type: "returnDock" });
          }}
        >
          {g.ended ? "出港前の渡船場へ" : "船着き場へ引き返す"}
        </SceneAction>
      </>
    );
  return (
    <>
      <Photo
        src={scene("voyage-moored")}
        alt="停泊中の船から、二本杭と輪の標、沖の灯を望む"
      />
      {chart && (
        <div
          className="route-planner"
          style={{ backgroundImage: `url(${closeup("paper-desk")})` }}
        >
          <div className="route-paper">
            <HarborDrawing
              game={g}
              route={g.routePlan}
              mark={(node) => {
                const prev = g.routePlan.at(-1);
                const existing = g.routePlan.indexOf(node);
                send({ type: "routePoint", node });
                if (existing >= 0) {
                  setSection(
                    existing > 0
                      ? [g.routePlan[existing - 1], node]
                      : undefined,
                  );
                } else if (
                  prev &&
                  channels.some(
                    ([a, b]) =>
                      (a === prev && b === node) || (b === prev && a === node),
                  )
                )
                  setSection([prev, node]);
              }}
              onChannel={(a, b) => setSection([a, b])}
            />
          </div>
          <aside
            className={`route-soundings ${soundingOpen ? "open" : ""}`}
            aria-label="水深の確認"
          >
            {section ? (
              <Sounding a={section[0]} b={section[1]} />
            ) : (
              <p>水路の線を選ぶと、水深を確認できます。</p>
            )}
            <button
              className="sounding-close"
              onClick={() => setSoundingOpen(false)}
            >
              水深を閉じる
            </button>
          </aside>
          <div className="route-edit-tools">
            {g.routePlan.length > 0 && (
              <>
                <button
                  onClick={() => {
                    send({ type: "routeUndo" });
                    setSection(
                      g.routePlan.length > 2
                        ? [
                            g.routePlan[g.routePlan.length - 3],
                            g.routePlan[g.routePlan.length - 2],
                          ]
                        : undefined,
                    );
                  }}
                >
                  ↶ 戻す
                </button>
                <button
                  onClick={() => {
                    send({ type: "routeClear" });
                    setSection(undefined);
                    setSoundingOpen(false);
                  }}
                >
                  引き直す
                </button>
              </>
            )}
          </div>
          {section && (
            <button
              className="sounding-expand"
              onClick={() => setSoundingOpen(true)}
            >
              水深を見る
            </button>
          )}
          <p>標を順につなぐ。選んだ標を押すと、そこまで戻る。</p>
        </div>
      )}
      {chart ? (
        <>
          <SceneAction
            onClick={() => {
              setChart(false);
              setSoundingOpen(false);
            }}
          >
            図を閉じる
          </SceneAction>
          {g.routePlan.at(-1) === "T" && (
            <SceneAction onClick={() => send({ type: "depart" })}>
              この航路で出港する
            </SceneAction>
          )}
        </>
      ) : (
        <>
          <SceneAction onClick={() => setChart(true)}>航路図を開く</SceneAction>
          <SceneAction onClick={() => send({ type: "disembark" })}>
            岸へ戻る
          </SceneAction>
        </>
      )}
    </>
  );
}
