import { SupportsView } from "./PontoonView";
import { useEffect, useRef, useState } from "react";
import { closeup, itemImage } from "../content/assets";
import {
  draining,
  filling,
  type Action,
  type Game,
  type Item,
  type Water,
} from "../game/model";
import { Hit, Photo, Wheel } from "./Primitives";

export type ControlProps = {
  game: Game;
  send: (a: Action) => void;
  selected?: Item;
};
export function Pipes({ game: g, send }: ControlProps) {
  const [flow, setFlow] = useState(false),
    timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const pump = () => {
    send({ type: "pump" });
    clearTimeout(timer.current);
    setFlow(
      !g.gateOpen &&
        ((filling(g) && g.target > g.water) ||
          (draining(g) &&
            g.beltTested &&
            Math.max(g.target, g.strainerClear ? 0 : 1) < g.water)),
    );
    timer.current = setTimeout(() => setFlow(false), 3000);
  };
  return (
    <>
      <Photo
        src={closeup("pipes")}
        alt="三つの弁と、水位を止める浮きの操作盤"
      />
      {[26.7, 49.9, 73.7].map((x, i) => (
        <Wheel
          key={i}
          x={x}
          y={34.5}
          size={16}
          angle={g.valves[i] ? 90 : 0}
          label={`${["左", "中央", "右"][i]}の弁を回す`}
          onClick={() => send({ type: "valve", index: i })}
        />
      ))}
      {[26.6, 49.9, 73.4].map((x, i) => (
        <div
          key={i}
          className={`sight-flow ${flow && g.valves[i] ? "flowing" : ""} ${draining(g) ? "down" : ""}`}
          style={{
            left: `${x - 0.8}%`,
            top: "49%",
            width: "1.6%",
            height: "13%",
          }}
        >
          <i />
          <i />
          <i />
        </div>
      ))}
      <div
        className="level-handle"
        style={{ left: `${[28, 34.4, 40.8][g.target]}%`, top: "78.5%" }}
      />
      {([0, 1, 2] as Water[]).map((level) => (
        <Hit
          key={level}
          label={`浮きの留め位置 ${["低", "中", "高"][level]}`}
          x={25 + level * 6.4}
          y={74}
          w={6.3}
          h={10}
          onClick={() => send({ type: "target", value: level })}
        />
      ))}
      <Hit
        label="操作盤の押釦"
        x={66.5}
        y={71.5}
        w={8}
        h={14}
        onClick={pump}
        className={flow ? "pressed" : ""}
      />
      <div className="engraved-levels" aria-hidden="true">
        <span>Ⅰ</span>
        <span>Ⅱ</span>
        <span>Ⅲ</span>
      </div>
      <span
        className={`flow-status ${flow ? "active" : ""}`}
        aria-hidden="true"
      />
    </>
  );
}

export function Supports({ game: g, send, selected }: ControlProps) {
  const [socket, setSocket] = useState<number>();
  const [turning, setTurning] = useState<{
    index: number;
    direction: 1 | -1;
  }>();
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const turn = (index: number) => {
    if (turning) return;
    const direction = g.support[index] === 2 ? -1 : 1;
    if (
      selected !== "crank" ||
      g.items.crank !== "inventory" ||
      g.water !== 0
    ) {
      send({ type: "support", index, direction, tool: selected });
      return;
    }
    setSocket(index);
    setTurning({ index, direction });
    timer.current = setTimeout(() => {
      send({ type: "support", index, direction, tool: "crank" });
      setTurning(undefined);
    }, 850);
  };
  return (
    <>
      <SupportsView game={g} />
      {[35, 80].map((x, i) => (
        <span key={i}>
          {socket === i && selected === "crank" && (
            <img
              className={
                "crank-seated " +
                (turning
                  ? "turning " + (turning.direction < 0 ? "reverse" : "")
                  : "")
              }
              src={itemImage("crank")}
              alt="軸穴に差し込んだクランク"
              style={{
                left: x - 14 * 0.072 + "%",
                top: 67.5 - ((14 * 16) / 9) * 0.78 + "%",
              }}
            />
          )}
          <Hit
            label={(i ? "右" : "左") + "の支持ねじを回す"}
            x={x - 3}
            y={63}
            w={6}
            h={10}
            disabled={!!turning}
            onClick={() => turn(i)}
          />
          {g.pins[i] && (
            <Hit
              label={(i ? "右" : "左") + "の固定ピンを引く"}
              x={i ? 69.5 : 20.5}
              y={25}
              w={i ? 10 : 10}
              h={10}
              disabled={!!turning}
              onClick={() => send({ type: "pin", index: i })}
            />
          )}
        </span>
      ))}
      <p className="mechanical-note">
        {g.pins.every((p) => !p)
          ? g.support.every((p) => p === 0)
            ? "固定ピンは手元にある。支持ねじも離れた。"
            : "固定ピンは手元にある。箱は支持ねじに載っている。"
          : "柱のピンが、床下の箱を留めている。"}
      </p>
    </>
  );
}
