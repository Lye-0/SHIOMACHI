import { useState } from "react";
import { closeup, itemImage, mechanism, scene } from "../content/assets";
import { boatReady, type Item } from "../game/model";
import { Hit, Photo, Icon } from "./Primitives";
import type { ControlProps } from "./PumpControls";
import { PipeDrawing } from "./drawings";
import { GateView } from "./GateView";
import { DockView } from "./DockView";
import { Draft } from "./Navigation";
import { PaperSurface } from "./PaperSurface";

export function Strainer({ game: g, send, selected }: ControlProps) {
  return (
    <>
      <Photo
        src={closeup(g.strainerClear ? "strainer-clear" : "strainer")}
        alt="格子の奥の吸込み口"
      />
      <Hit
        label="吸込み口の奥へ道具を伸ばす"
        x={18}
        y={15}
        w={65}
        h={67}
        onClick={() => send({ type: "clearStrainer", tool: selected })}
      />
    </>
  );
}

export function Patch({ game: g, send, selected }: ControlProps) {
  const holes = [
    [40.6, 17.3],
    [57, 17.3],
    [40.6, 53.8],
    [57, 53.8],
  ];
  return (
    <>
      <svg width="0" height="0" aria-hidden="true">
        <defs>
          <clipPath id="patch-hardware" clipPathUnits="objectBoundingBox">
            <rect x=".735" y=".115" width=".16" height=".5" />
            <ellipse cx=".806" cy=".789" rx=".055" ry=".09" />
          </clipPath>
        </defs>
      </svg>
      <Photo
        src={closeup(g.tankDry ? "patch-dry" : "patch")}
        alt="浮体の割れ目と取り付け穴"
      />
      {!g.tankDry && <div className="tank-water" aria-hidden="true" />}
      {selected === "patch" && !g.patchMounted && (
        <Hit
          label="手元の補修板を回す"
          x={5}
          y={37}
          w={26}
          h={46}
          onClick={() => send({ type: "patchRotate" })}
          className="patch-preview"
        >
          <img
            src={itemImage("patch")}
            alt=""
            style={{ transform: `rotate(${g.patchTurn * 90}deg)` }}
          />
          <span>↻</span>
        </Hit>
      )}
      {g.patchMounted && (
        <div className="installed-patch">
          <img
            src={itemImage("patch")}
            alt=""
            style={{ transform: `rotate(${g.patchTurn * 90}deg)` }}
          />
        </div>
      )}
      {!g.patchMounted ? (
        <Hit
          label="割れ目に補修板を当てる"
          x={34}
          y={20}
          w={32}
          h={56}
          onClick={() => send({ type: "mountPatch", tool: selected })}
        />
      ) : (
        holes.map(([x, y], i) => (
          <Hit
            key={i}
            label={`補修板のボルト ${i + 1} を締める`}
            x={x - 2.5}
            y={y - 4.4}
            w={5}
            h={8.8}
            className={`photo-bolt ${g.patchBolts[i] ? "tight" : ""}`}
            onClick={() =>
              send({ type: "patchBolt", index: i, tool: selected })
            }
          >
            <span
              style={{ backgroundImage: `url(${mechanism("valve-wheel")})` }}
            />
          </Hit>
        ))
      )}
      <Hit
        label="浮体の排水栓を引く"
        x={74}
        y={69}
        w={13}
        h={16}
        onClick={() => send({ type: "drainTank" })}
      />
    </>
  );
}
export function BoatRepair({ game: g, send, selected }: ControlProps) {
  const [side, setSide] = useState<"inside" | "outside">("outside");
  const [stern, setStern] = useState(false);
  if (g.water !== 0)
    return (
      <>
        {stern && boatReady(g) ? (
          <Draft game={g} send={send} selected={selected} />
        ) : (
          <DockView
            game={g}
            style={{ transform: "scale(1.45)", transformOrigin: "35% 47%" }}
          />
        )}
        {g.water === 2 && boatReady(g) ? (
          <button className="view-turn" onClick={() => setStern(!stern)}>
            {stern ? "船の側面へ" : "船尾側へ回る"}
            <Icon name="right" />
          </button>
        ) : (
          <p className="observation-caption">
            {g.water === 1
              ? "船台へ降りる足場が、水に沈んでいる。"
              : "船内まで、水が入り込んでいる。"}
          </p>
        )}
      </>
    );
  const repaired = side === "inside" ? g.boatInside : g.boatOutside;
  const asset = `boat-${side}${side === "inside" && g.boatDry ? "-final" : repaired ? "-repaired" : ""}`;
  return (
    <>
      <Photo
        src={closeup(asset)}
        alt={
          g.water === 0
            ? side === "inside"
              ? "船の内側"
              : "船底と船台"
            : "浮かんだ船の水線"
        }
      />
      {g.water === 0 && (
        <>
          <Hit
            label={
              side === "inside"
                ? "内側から補修具を当てる"
                : "外側から補修具を当てる"
            }
            x={30}
            y={32}
            w={43}
            h={40}
            onClick={() => send({ type: "boatPatch", side, tool: selected })}
          />
          <button
            className="view-turn"
            onClick={() => setSide(side === "inside" ? "outside" : "inside")}
          >
            {side === "inside" ? "船底へ" : "船内へ"}
            <Icon name="right" />
          </button>
        </>
      )}
      {g.water === 0 && side === "inside" && (
        <Hit
          label="船の水を汲み出す"
          x={77}
          y={56}
          w={14}
          h={26}
          onClick={() => send({ type: "bailBoat" })}
        />
      )}
    </>
  );
}
export function Lantern({ game: g, send, selected }: ControlProps) {
  return (
    <>
      <Photo
        src={closeup(
          g.lampLit
            ? "lantern-lit"
            : g.lampMounted
              ? g.lensClean
                ? "lantern-glass"
                : "lantern-dirty"
              : "lantern",
        )}
        alt="船首の船灯"
      />
      <Hit
        label={g.lampMounted ? "船灯のガラスを拭く" : "船灯にガラスを戻す"}
        x={34}
        y={19}
        w={35}
        h={51}
        onClick={() =>
          send(
            g.lampMounted
              ? { type: "cleanLens" }
              : { type: "mountLamp", tool: selected },
          )
        }
      />
      <Hit
        label="船灯のつまみを回す"
        x={61}
        y={44}
        w={12}
        h={16}
        onClick={() => send({ type: "lightLamp" })}
      />
    </>
  );
}
export function Gate({ game: g, send }: ControlProps) {
  return (
    <>
      <GateView game={g} />
      {g.gateOpen ? (
        <button
          className="record-button"
          onClick={() => send({ type: "gate" })}
        >
          水門を閉める
        </button>
      ) : (
        <Hit
          label="水門の閂を引く"
          x={39}
          y={51}
          w={22}
          h={10}
          onClick={() => send({ type: "gate" })}
        />
      )}
    </>
  );
}

export function Shore({ game: g, send }: ControlProps) {
  if (g.room === "service")
    return (
      <>
        <Photo
          src={scene("shore-low")}
          alt="水が引いた水路の向こうにある倒れた梁"
        />
      </>
    );
  return (
    <>
      <PaperSurface
        background={g.room === "workshop" ? "workshop-rack" : "office-shelves"}
      />
      <div className="document-ink">
        <PipeDrawing />
      </div>
    </>
  );
}
