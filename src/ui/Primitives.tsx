import type { CSSProperties, ReactNode } from "react";
import { itemImage, mechanism } from "../content/assets";
import { itemNames, type Item, type Game } from "../game/model";

export function ItemArt({
  item,
  game,
  className = "",
  style,
}: {
  item: Item;
  game?: Game;
  className?: string;
  style?: CSSProperties;
}) {
  const kind =
    item === "keyBow"
      ? "key-bow"
      : item === "keyTip"
        ? "key-tip"
        : item === "boatKit" && game?.boatInside && !game.boatOutside
          ? "kit-right"
          : item === "boatKit" && game?.boatOutside && !game.boatInside
            ? "kit-left"
            : "";
  if (item === "key")
    return (
      <span className={`item-art assembled-key ${className}`} style={style}>
        <img className="key-part-left" src={itemImage("key")} alt="" />
        <img className="key-part-right" src={itemImage("key")} alt="" />
        <img className="key-retainer" src={itemImage("keyJig")} alt="" />
      </span>
    );
  return (
    <span
      className={`item-art item-${item} ${kind} ${className}`}
      style={style}
    >
      <img
        draggable={false}
        src={itemImage(
          item === "lens" && game?.lensClean ? "lens-clean" : item,
        )}
        alt=""
      />
    </span>
  );
}

export function Photo({
  src,
  alt = "",
  className = "",
  style,
}: {
  src: string;
  alt?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <img
      draggable={false}
      className={`photo ${className}`}
      src={src}
      alt={alt}
      style={style}
    />
  );
}
export function Hit({
  label,
  x,
  y,
  w,
  h,
  onClick,
  children,
  className = "",
  style,
  disabled = false,
}: {
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  onClick: () => void;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`hit ${className}`}
      disabled={disabled}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${w}%`,
        height: `${h}%`,
        ...style,
      }}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
export function Pickup({
  item,
  x,
  y,
  w,
  h,
  onClick,
}: {
  item: Item;
  x: number;
  y: number;
  w: number;
  h: number;
  onClick: () => void;
}) {
  return (
    <Hit
      label={`${itemNames[item]}を取る`}
      x={x}
      y={y}
      w={w}
      h={h}
      onClick={onClick}
      className="pickup"
    >
      <ItemArt item={item} />
    </Hit>
  );
}
export function Wheel({
  x,
  y,
  size,
  angle,
  label,
  onClick,
}: {
  x: number;
  y: number;
  size: number;
  angle: number;
  label: string;
  onClick: () => void;
}) {
  return (
    <Hit
      label={label}
      x={x - size / 2}
      y={y - (size * 16) / 18}
      w={size}
      h={(size * 16) / 9}
      onClick={onClick}
      className="wheel"
    >
      <img
        draggable={false}
        src={mechanism("valve-wheel")}
        style={{ transform: `rotate(${angle}deg)` }}
        alt=""
      />
    </Hit>
  );
}
export function Icon({
  name,
}: {
  name: "menu" | "book" | "back" | "left" | "right" | "sound" | "close" | "eye";
}) {
  const paths = {
    menu: "M4 7h16M4 12h16M4 17h16",
    book: "M12 5v15M12 6C8 3 4 4 3 5v14c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1",
    back: "m7 9 5 5 5-5",
    left: "m15 5-7 7 7 7",
    right: "m9 5 7 7-7 7",
    sound: "M11 5 6 9H3v6h3l5 4ZM15 8q6 4 0 8M18 5q10 7 0 14",
    close: "m6 6 12 12M6 18 18 6",
    eye: "M2 12q10-14 20 0-10 14-20 0M15 12a3 3 0 1 1-6 0 3 3 0 1 1 6 0",
  };
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
