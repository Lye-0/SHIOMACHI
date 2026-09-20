import { useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { closeup, itemImage, mechanism } from "../content/assets";
import { blocks, itemNames, raised, type Item } from "../game/model";
import { Hit, Photo, Pickup } from "./Primitives";
import type { ControlProps } from "./PumpControls";
import { PontoonDrawing } from "./drawings";
import { PaperSurface } from "./PaperSurface";

export function Shutter({ game: g, send }: ControlProps) {
  if (g.shutterOpen)
    return (
      <>
        <Photo
          src={closeup(raised(g) ? "shutter-open-high" : "shutter-open")}
          alt="開いた戸の向こうの渡り板"
        />
        <Hit
          label="桟橋へ出る"
          x={53}
          y={19}
          w={16}
          h={57}
          onClick={() => send({ type: "visit", room: "concourse" })}
        />
      </>
    );
  return (
    <>
      <Photo src={closeup("shutter-base")} alt="戸枠に掛かった三つの留め金" />
      {[20, 49, 79].map((y, i) => (
        <Hit
          key={i}
          label={`${["上", "中", "下"][i]}の留め金を動かす`}
          x={27 + (g.shutter[i] ? 11 : 0)}
          y={y - 15}
          w={42}
          h={25}
          onClick={() => send({ type: "shutter", index: i })}
          className="slide-bolt"
        >
          <img src={mechanism("slide-bolt")} alt="" />
        </Hit>
      ))}
      <svg width="0" height="0" aria-hidden="true">
        <defs>
          <clipPath id="latch-guides" clipPathUnits="objectBoundingBox">
            {[0.15, 0.44, 0.73].flatMap((y) =>
              [0.37, 0.565].map((x) => (
                <rect
                  key={`${x}-${y}`}
                  x={x}
                  y={y}
                  width=".105"
                  height=".102"
                />
              )),
            )}
          </clipPath>
        </defs>
      </svg>
      <Photo
        src={closeup("shutter-base")}
        style={{ clipPath: "url(#latch-guides)", zIndex: 6 }}
      />
      <Hit
        label="戸を開く"
        x={83}
        y={15}
        w={11}
        h={70}
        onClick={() => send({ type: "openShutter" })}
      />
    </>
  );
}
export function Tray({ game: g, send }: ControlProps) {
  const board = useRef<HTMLDivElement>(null),
    drag = useRef<{ index: number; start: number; value: number } | null>(null);
  const start = (e: PointerEvent<HTMLButtonElement>, index: number) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = {
      index,
      start: blocks[index].axis === "x" ? e.clientX : e.clientY,
      value: g.tray[index],
    };
  };
  const move = (e: PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || !board.current) return;
    const axis = blocks[d.index].axis,
      rect = board.current.getBoundingClientRect();
    const point = axis === "x" ? e.clientX : e.clientY;
    const next =
      d.value +
      Math.round(
        (point - d.start) / ((axis === "x" ? rect.width : rect.height) / 6),
      );
    if (next !== g.tray[d.index])
      send({ type: "slide", index: d.index, value: next });
  };
  return (
    <>
      <Photo src={closeup("tray")} alt="工具箱の収納材" />
      <div className="tray-board" ref={board}>
        {blocks.map((b, i) =>
          g.trayOpen && i === 0 ? null : (
            <button
              key={i}
              disabled={g.trayOpen}
              aria-label={b.name}
              className={`tray-block ${i === 0 ? "tool-carriage" : ""}`}
              style={{
                left: `${((b.axis === "x" ? g.tray[i] : b.fixed) * 100) / 6}%`,
                top: `${((b.axis === "y" ? g.tray[i] : b.fixed) * 100) / 6}%`,
                width: `${((b.axis === "x" ? b.length : 1) * 100) / 6}%`,
                height: `${((b.axis === "y" ? b.length : 1) * 100) / 6}%`,
              }}
              onPointerDown={(e) => start(e, i)}
              onPointerMove={move}
              onPointerUp={() => {
                drag.current = null;
              }}
              onPointerCancel={() => {
                drag.current = null;
              }}
              onKeyDown={(e) => {
                const direction =
                  b.axis === "x"
                    ? e.key === "ArrowRight"
                      ? 1
                      : e.key === "ArrowLeft"
                        ? -1
                        : 0
                    : e.key === "ArrowDown"
                      ? 1
                      : e.key === "ArrowUp"
                        ? -1
                        : 0;
                if (direction) {
                  e.preventDefault();
                  send({
                    type: "slide",
                    index: i,
                    value: g.tray[i] + direction,
                  });
                }
              }}
            >
              <img
                src={mechanism("wood-block")}
                alt=""
                style={
                  b.axis === "y"
                    ? {
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        width: `${(b.length / 1.19753) * 100}%`,
                        height: `${(1.19753 / b.length) * 100}%`,
                        transform: "translate(-50%,-50%) rotate(90deg)",
                      }
                    : undefined
                }
              />
              <span
                className={`carriage-grip ${i === 0 ? "brass" : ""}`}
                style={{ backgroundImage: `url(${mechanism("valve-wheel")})` }}
              />
            </button>
          ),
        )}
      </div>
      <Hit
        label="工具の受け台を引き出す"
        x={64.5}
        y={38}
        w={24}
        h={14}
        onClick={() => send({ type: "openTray" })}
      />
      {g.trayOpen && (
        <>
          <div className="withdrawn-carriage" />
          {(["pliers", "keyJig"] as Item[]).map(
            (item, i) =>
              g.items[item] === "tray" && (
                <Pickup
                  key={item}
                  item={item}
                  x={i ? 82 : 70}
                  y={40}
                  w={i ? 5 : 11}
                  h={9}
                  onClick={() => send({ type: "take", item })}
                />
              ),
          )}
        </>
      )}
    </>
  );
}
export function KeyLock({ game: g, send, selected }: ControlProps) {
  return (
    <>
      <Photo
        src={closeup(g.keyExtracted ? "key-empty" : "key-broken")}
        alt={g.keyExtracted ? "先端を抜いた机の錠" : "折れた鍵が残る、机の錠"}
      />
      <Hit
        label={g.keyExtracted ? "鍵を差して回す" : "錠の中の鍵を抜く"}
        x={37}
        y={24}
        w={26}
        h={52}
        onClick={() =>
          send({
            type: g.keyExtracted ? "turnKey" : "extractKey",
            tool: selected,
          })
        }
      />
    </>
  );
}
export function Drawer({ game: g, send, selected }: ControlProps) {
  return (
    <>
      <Photo
        src={closeup(g.drawerOpen ? "drawer-open" : "drawer")}
        alt="机の引き出し"
      />
      <Hit
        label={g.drawerOpen ? "引き出しを閉じる" : "引き出しを開ける"}
        x={13}
        y={g.drawerOpen ? 72 : 56}
        w={73}
        h={16}
        onClick={() => send({ type: "openDrawer" })}
      />
      {!g.drawerOpen && (
        <Hit
          label="引き出しの錠に道具を使う"
          x={45}
          y={40}
          w={10}
          h={15}
          onClick={() =>
            send({
              type: g.keyExtracted ? "turnKey" : "extractKey",
              tool: selected,
            })
          }
        />
      )}
      {g.drawerOpen &&
        (["crank", "hookTip"] as Item[]).map(
          (item, i) =>
            g.items[item] === "drawer" && (
              <Pickup
                key={item}
                item={item}
                x={26 + i * 31}
                y={34}
                w={23}
                h={29}
                onClick={() => send({ type: "take", item })}
              />
            ),
        )}
    </>
  );
}
export function Diagram({ game: g, send }: ControlProps) {
  const [picked, setPicked] = useState<number>();
  return (
    <>
      <PaperSurface background={g.drawerOpen ? "office-open" : "office"} />
      <div className="paper-puzzle">
        {g.papers.map((piece, index) => (
          <div
            key={index}
            className={`paper-piece ${picked === index ? "picked" : ""}`}
          >
            <button
              aria-label={`図面の紙片 ${index + 1} を選ぶ`}
              onClick={() => {
                if (picked === undefined) setPicked(index);
                else {
                  send({ type: "paperSwap", a: picked, b: index });
                  setPicked(undefined);
                }
              }}
            >
              <div
                className="paper-rotation"
                style={{ transform: `rotate(${g.paperTurns[index] * 90}deg)` }}
              >
                <div
                  className="paper-quadrant"
                  style={{
                    left: `${-(piece % 2) * 100}%`,
                    top: `${-Math.floor(piece / 2) * 100}%`,
                  }}
                >
                  <PontoonDrawing />
                </div>
              </div>
            </button>
            <button
              className="paper-rotate"
              aria-label={`図面の紙片 ${index + 1} を回す`}
              onClick={() => send({ type: "paperRotate", index })}
            >
              ↻
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
const pulleyPoints = [
  [37.7, 56.5],
  [77, 34],
  [45.4, 23],
  [66.5, 62.5],
];
export function beltGeometry(
  route: number[],
  positions: number[][] = pulleyPoints,
) {
  const points = route.map((i) => [
    positions[i][0] * 10,
    positions[i][1] * 5.625,
  ]);
  if (points.length < 2) return "";
  const closed = route.length === 5 && route[0] === route[4];
  const ps = closed ? points.slice(0, -1) : points;
  let area = 0;
  for (let i = 0; i < ps.length; i++) {
    const a = ps[i],
      b = ps[(i + 1) % ps.length];
    area += a[0] * b[1] - b[0] * a[1];
  }
  const sign = area >= 0 ? 1 : -1,
    r = positions === pulleyPoints ? 47 : 15;
  const normal = (a: number[], b: number[]) => {
    const dx = b[0] - a[0],
      dy = b[1] - a[1],
      length = Math.hypot(dx, dy) || 1;
    return [((sign * dy) / length) * r, ((-sign * dx) / length) * r];
  };
  const plus = (p: number[], n: number[]) =>
    `${(p[0] + n[0]).toFixed(2)} ${(p[1] + n[1]).toFixed(2)}`;
  if (!closed) {
    const n = normal(ps[0], ps[1]);
    let d = `M${plus(ps[0], n)}`;
    for (let i = 1; i < ps.length; i++)
      d += `L${plus(ps[i], normal(ps[i - 1], ps[i]))}`;
    return d;
  }
  let d = `M${plus(ps[0], normal(ps[ps.length - 1], ps[0]))}`;
  for (let i = 0; i < ps.length; i++) {
    const p = ps[i],
      next = ps[(i + 1) % ps.length],
      n = normal(p, next);
    d += `A${r} ${r} 0 0 ${sign > 0 ? 1 : 0} ${plus(p, n)}L${plus(next, n)}`;
  }
  return d + "Z";
}
export function Belt({ game: g, send }: ControlProps) {
  const d = beltGeometry(g.beltRoute);
  return (
    <>
      <Photo src={closeup("belt")} alt="ベルトが外れた四つの滑車" />
      {pulleyPoints.map(([x, y], i) => (
        <img
          key={i}
          src={mechanism("pulley")}
          alt=""
          className="pulley-sprite"
          style={{
            left: `${x - 5}%`,
            top: `${y - 8.8889}%`,
            width: "10%",
            height: "17.7778%",
          }}
        />
      ))}
      <svg
        className="mechanism-svg"
        viewBox="0 0 1000 562.5"
        aria-hidden="true"
      >
        <path
          d={d}
          fill="none"
          stroke="#080b0a"
          strokeWidth="13"
          strokeLinejoin="round"
        />
        <path
          d={d}
          fill="none"
          stroke="#514630"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
      {pulleyPoints.map(([x, y], i) => (
        <Hit
          key={i}
          label={`滑車 ${i + 1} にベルトを掛ける`}
          x={x - 8}
          y={y - 12}
          w={16}
          h={24}
          onClick={() => send({ type: "beltPin", index: i })}
        />
      ))}
      <Hit
        label="駆動軸を手で回す"
        x={7}
        y={72}
        w={17}
        h={17}
        onClick={() => send({ type: "beltTest" })}
      />
      {g.beltMounted && !g.beltTested && (
        <button
          className="record-button"
          onClick={() => send({ type: "beltReset" })}
        >
          ベルトを外す
        </button>
      )}
    </>
  );
}
export function Rings({ game: g, send }: ControlProps) {
  return (
    <>
      <Photo
        src={closeup(g.caseOpen ? "rings-open" : "rings")}
        alt="分割環で留められた船具ケース"
      />
      {!g.caseOpen && (
        <>
          {[16, 11, 6].map((size, i) => (
            <Hit
              key={i}
              className="ring-control"
              label={`${["外", "中", "内"][i]}の環を回す`}
              x={50 - size / 2}
              y={47 - (size * 16) / 18}
              w={size}
              h={(size * 16) / 9}
              onClick={() => send({ type: "ring", index: i, direction: 1 })}
              style={{ zIndex: 5 + i }}
            >
              <img
                src={mechanism("locking-ring")}
                style={{ transform: `rotate(${g.rings[i] * 45}deg)` }}
                alt=""
              />
            </Hit>
          ))}
          <Hit
            label="留め爪を抜く"
            x={47}
            y={32}
            w={6}
            h={9}
            style={{ zIndex: 9 }}
            onClick={() => send({ type: "openCase" })}
          />
        </>
      )}
      {g.caseOpen &&
        [16, 11, 6].map((size, i) => (
          <img
            key={i}
            src={mechanism("locking-ring")}
            alt=""
            style={{
              position: "absolute",
              left: `${50 - size / 2}%`,
              top: `${62.5 - size * 0.8889}%`,
              width: `${size}%`,
              height: `${size * 1.7778}%`,
              transform: `rotate(${g.rings[i] * 45}deg)`,
              filter: "brightness(.78)",
              pointerEvents: "none",
            }}
          />
        ))}
      {g.caseOpen && g.items.boatKit === "case" && (
        <Pickup
          item="boatKit"
          x={35}
          y={29}
          w={30}
          h={17}
          onClick={() => send({ type: "take", item: "boatKit" })}
        />
      )}
    </>
  );
}
export function Rack({ game: g, send }: ControlProps) {
  return (
    <>
      <Photo src={closeup("rack")} alt="形の違う補修材の棚" />
      {g.items.patch === "rack" && (
        <Pickup
          item="patch"
          x={33}
          y={26}
          w={35}
          h={49}
          onClick={() => send({ type: "take", item: "patch" })}
        />
      )}
    </>
  );
}
