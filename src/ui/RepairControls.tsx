import { PatchView, patchBoltCenters } from "./PontoonView";
import { SceneAction } from "./ActionBar";
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
      {!g.strainerClear && (
        <Hit
          label="吸込み口の奥へ道具を伸ばす"
          x={49}
          y={37}
          w={19}
          h={30}
          onClick={() => send({ type: "clearStrainer", tool: selected })}
        />
      )}
    </>
  );
}

export function Patch({ game: g, send, selected }: ControlProps) {
  const [fitting, setFitting] = useState(false);
  const preview = fitting && selected === "patch" && !g.patchMounted;
  return (
    <>
      <PatchView game={g} />
      {preview &&
        (g.patchTurn % 2 === 1 ? (
          <Photo
            src={closeup("patch-mounted")}
            alt="四つの穴に合わせたボルト付き補修板"
          />
        ) : (
          <img
            className="patch-fitting"
            src={itemImage("patch")}
            alt="割れ目に当てたボルト付き補修板"
            style={{ transform: `rotate(${g.patchTurn * 90}deg)` }}
          />
        ))}
      {!g.patchMounted && !preview && (
        <Hit
          label="割れ目に補修板を当てる"
          x={40}
          y={30}
          w={20}
          h={34}
          onClick={() =>
            selected === "patch" && g.items.patch === "inventory"
              ? setFitting(true)
              : send({ type: "mountPatch", tool: selected })
          }
        />
      )}
      {preview && (
        <>
          <SceneAction onClick={() => send({ type: "patchRotate" })}>
            補修板を回す ↻
          </SceneAction>
          <SceneAction
            onClick={() => send({ type: "mountPatch", tool: selected })}
          >
            穴を合わせて取り付ける
          </SceneAction>
        </>
      )}
      {g.patchMounted &&
        patchBoltCenters.map(
          ([x, y], i) =>
            !g.patchBolts[i] && (
              <Hit
                key={i}
                label={`補修板のボルト ${i + 1} を締める`}
                x={x - 2.5}
                y={y - 4.4}
                w={5}
                h={8.8}
                shape="ellipse"
                onClick={() =>
                  send({ type: "patchBolt", index: i, tool: selected })
                }
              />
            ),
        )}
      {!g.tankDry && (
        <Hit
          label="浮体の排水コックを開く"
          x={77}
          y={63}
          w={8}
          h={12}
          onClick={() => send({ type: "drainTank" })}
        />
      )}
      {g.patchMounted && (
        <p className="mechanical-note">
          {g.tankDry
            ? "水位管が空になった。"
            : `締めたボルト ${g.patchBolts.filter(Boolean).length} / 4`}
        </p>
      )}
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
          <SceneAction className="view-turn" onClick={() => setStern(!stern)}>
            {stern ? "船の側面へ" : "船尾側へ回る"}
            <Icon name="right" />
          </SceneAction>
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
          {!repaired && (
            <Hit
              label={
                side === "inside"
                  ? "内側から補修具を当てる"
                  : "外側から補修具を当てる"
              }
              x={side === "inside" ? 45.5 : 46}
              y={side === "inside" ? 50 : 30}
              w={side === "inside" ? 6 : 8}
              h={side === "inside" ? 20 : 14}
              onClick={() => send({ type: "boatPatch", side, tool: selected })}
            />
          )}
          <SceneAction
            className="view-turn"
            onClick={() => setSide(side === "inside" ? "outside" : "inside")}
          >
            {side === "inside" ? "船底へ" : "船内へ"}
            <Icon name="right" />
          </SceneAction>
        </>
      )}
      {g.water === 0 && side === "inside" && !g.boatDry && (
        <Hit
          label="船の水を汲み出す"
          x={70}
          y={54}
          w={16}
          h={27}
          shape="0,10 28,0 61,10 80,42 63,52 100,90 88,100 52,63 15,63 5,40"
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
      {(!g.lampMounted || !g.lensClean) && (
        <Hit
          label={g.lampMounted ? "船灯のガラスを拭く" : "船灯にガラスを戻す"}
          x={30}
          y={7}
          w={29}
          h={54}
          shape="ellipse"
          onClick={() =>
            send(
              g.lampMounted
                ? { type: "cleanLens" }
                : { type: "mountLamp", tool: selected },
            )
          }
        />
      )}
      <Hit
        label="船灯のつまみを回す"
        x={64}
        y={43}
        w={6}
        h={11}
        shape="ellipse"
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
        <SceneAction
          className="record-button"
          onClick={() => send({ type: "gate" })}
        >
          水門を閉める
        </SceneAction>
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
