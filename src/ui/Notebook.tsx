import { hull } from "../game/hull";
import { useState } from "react";
import type { Game } from "../game/model";
import { Photo, Icon } from "./Primitives";
import { scene, closeup } from "../content/assets";
import {
  PontoonDrawing,
  PipeDrawing,
  HarborDrawing,
  HullDrawing,
} from "./drawings";
import { SurveyFrame } from "./Navigation";

const labels: Record<string, string> = {
  diagram: "係留桟橋の断面図",
  pontoon: "柱と渡り板",
  "pipe-map": "配管のつながり",
  "fallen-beam": "水の下の梁",
  bearings: "見通し標",
  chart: "古い測量図",
  tracing: "船台の輪郭",
  waterline: "船の水線と喫水の計測",
};
export function Notebook({ game: g }: { game: Game }) {
  const [opened, setOpened] = useState<string>();
  const records = g.records ?? {};
  const ids = Object.keys(labels).filter(
    (id) => id in records || (id === "tracing" && g.tracing),
  );
  const record = opened ? records[opened] : undefined;
  return (
    <>
      <span className="eyebrow">NOTES</span>
      <h2>{opened ? labels[opened] : "記録帳"}</h2>
      {!opened ? (
        ids.length ? (
          <div className="notes">
            {ids.map((id) => (
              <button key={id} onClick={() => setOpened(id)}>
                {labels[id]}
                <Icon name="right" />
              </button>
            ))}
          </div>
        ) : (
          <p>まだ、何も挟まれていない。</p>
        )
      ) : (
        <>
          <div className="read-only-document">
            {["diagram", "pipe-map", "chart", "tracing"].includes(opened) && (
              <>
                <Photo src={closeup("paper-desk")} />
                <div className="document-ink">
                  {opened === "diagram" ? (
                    <PontoonDrawing />
                  ) : opened === "pipe-map" ? (
                    <PipeDrawing />
                  ) : opened === "chart" ? (
                    <HarborDrawing
                      game={{ ...g, chartMarks: record?.chartMarks ?? [] }}
                    />
                  ) : (
                    <HullDrawing showWater={false} />
                  )}
                </div>
              </>
            )}
            {opened === "pontoon" && (
              <Photo
                src={scene(
                  record?.water === 0
                    ? "concourse-low"
                    : record?.water === 2
                      ? record?.raised
                        ? "concourse-high"
                        : "concourse-high-held"
                      : "concourse-mid",
                )}
              />
            )}
            {opened === "fallen-beam" && <Photo src={scene("shore-low")} />}
            {opened === "bearings" && (
              <SurveyFrame position={record?.view ?? 2} />
            )}
            {opened === "waterline" && (
              <>
                <Photo src={closeup("boat-floating")} />
                {record?.draftMarks && (
                  <>
                    <div className="depth-template on-boat">
                      <HullDrawing showWater={false} showScale={false} />
                    </div>
                    <svg
                      viewBox="0 0 800 450"
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                      }}
                      aria-label="計測時に付けた船底と水線の印"
                    >
                      {record.draftMarks.map((mark, i) => (
                        <line
                          key={i}
                          x1="650"
                          x2="770"
                          y1={hull.keel - (mark * hull.step) / 10}
                          y2={hull.keel - (mark * hull.step) / 10}
                          stroke={i ? "#75bdce" : "#fff2c7"}
                          strokeWidth="2"
                        />
                      ))}
                    </svg>
                  </>
                )}
              </>
            )}
          </div>
          {opened === "waterline" && (
            <p>
              {record?.draftMarks
                ? `計測した印の間隔：${Math.abs(record.draftMarks[1] - record.draftMarks[0])} cm（白：船底／青：水線）`
                : "船の水線の記録。船尾で写しを重ね、棒を添えて測ると、計測した印もここに残る。"}
            </p>
          )}
          <button className="text-button" onClick={() => setOpened(undefined)}>
            一覧へ戻る
          </button>
        </>
      )}
    </>
  );
}
