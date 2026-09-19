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
    setFlow(filling(g) || (g.beltTested && g.valves[0]));
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
        className={g.drive ? "pressed" : ""}
      />
      <div className="engraved-levels" aria-hidden="true">
        <span>Ⅰ</span>
        <span>Ⅱ</span>
        <span>Ⅲ</span>
      </div>
      <span
        className={`flow-status ${filling(g) || draining(g) ? "active" : ""}`}
        aria-hidden="true"
      />
    </>
  );
}

export function Supports({ game: g, send, selected }: ControlProps) {
  const [turning, setTurning] = useState<number>(),
    timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const turn = (index: number) => {
    send({
      type: "support",
      index,
      direction: g.support[index] === 2 ? -1 : 1,
      tool: selected,
    });
    if (selected === "crank") {
      clearTimeout(timer.current);
      setTurning(index);
      timer.current = setTimeout(() => setTurning(undefined), 650);
    }
  };
  const photoFor = (i: number) =>
    g.pins[i]
      ? g.support[i] === 2
        ? "supports-loaded"
        : "supports"
      : g.support[i] === 2
        ? "supports-released"
        : "supports-free";
  return (
    <>
      <Photo src={closeup(photoFor(0))} alt="浮体を支えるねじと固定ピン" />
      <Photo
        src={closeup(photoFor(1))}
        style={{
          maskImage: "linear-gradient(to right, transparent 49%, black 51%)",
        }}
      />
      {[29.5, 72].map((x, i) => (
        <span key={i}>
          {turning === i && (
            <img
              className="crank-in-use"
              src={itemImage("crank")}
              alt=""
              style={{ left: `${x - 2.4}%`, top: "56%" }}
            />
          )}
          <Hit
            label={`${i ? "右" : "左"}の支持ねじを回す`}
            x={x - 6}
            y={70}
            w={12}
            h={18}
            onClick={() => turn(i)}
          />
          <Hit
            label={`${i ? "右" : "左"}の固定ピンを引く`}
            x={i ? 64 : 11}
            y={27}
            w={27}
            h={16}
            onClick={() => send({ type: "pin", index: i })}
          />
        </span>
      ))}
    </>
  );
}
