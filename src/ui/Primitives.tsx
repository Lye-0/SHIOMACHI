import { useContext, type CSSProperties, type ReactNode } from "react";
import { StageWidth } from "./ActionBar";
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
      {item === "lockingPins" && game && (
        <span className="pin-count">×{game.pins.filter((p) => !p).length}</span>
      )}
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
  shape,
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
  /** Polygon points in the button's 0–100 coordinates, or an ellipse. */
  shape?: string;
}) {
  const stageWidth = useContext(StageWidth);
  const padX = Math.max(0.7, ((38 / stageWidth) * 100 - w) / 2);
  const padY = Math.max(
    (0.7 * 16) / 9,
    (((38 / stageWidth) * 100 * 16) / 9 - h) / 2,
  );
  const left = Math.max(0, x - padX),
    top = Math.max(0, y - padY);
  const width = Math.min(100, x + w + padX) - left;
  const height = Math.min(100, y + h + padY) - top;
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`hit ${shape ? "shaped-hit" : ""} ${className}`}
      disabled={disabled}
      style={{
        left: `${left}%`,
        top: `${top}%`,
        width: `${width}%`,
        height: `${height}%`,
        ...(shape
          ? {
              clipPath:
                shape === "ellipse"
                  ? "ellipse(50% 50% at 50% 50%)"
                  : `polygon(${shape
                      .split(" ")
                      .map((p) =>
                        p
                          .split(",")
                          .map((n) => n + "%")
                          .join(" "),
                      )
                      .join(",")})`,
            }
          : {}),
        ...style,
      }}
      onClick={onClick}
    >
      {children && (
        <div
          className="hit-contents"
          style={{
            position: "absolute",
            left: `${((x - left) / width) * 100}%`,
            top: `${((y - top) / height) * 100}%`,
            width: `${(w / width) * 100}%`,
            height: `${(h / height) * 100}%`,
            pointerEvents: "none",
          }}
        >
          {children}
        </div>
      )}
      {shape && (
        <svg
          className="hit-outline"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {shape === "ellipse" ? (
            <ellipse cx="50" cy="50" rx="49.5" ry="49.5" />
          ) : (
            <polygon points={shape} />
          )}
        </svg>
      )}
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
  const stageWidth = useContext(StageWidth);
  return (
    <Hit
      label={`${itemNames[item]}を取る`}
      x={x}
      y={y}
      w={w}
      h={h}
      onClick={onClick}
      className="pickup"
      shape={pickupShape(item, w, h, stageWidth)}
    >
      <ItemArt item={item} />
    </Hit>
  );
}
// Bounds of the visible art, measured from the selected transparent assets.
// Preserve the photograph's scale; trim only the button's transparent margins.
function pickupShape(item: Item, w: number, h: number, stageWidth: number) {
  const bounds: Partial<
    Record<Item, [number, number, number, number, number]>
  > = {
    pliers: [1, 0.064, 0.035, 0.957, 0.959],
    keyJig: [1, 0.052, 0.287, 0.953, 0.74],
    crank: [1, 0.033, 0.157, 0.981, 0.841],
    belt: [1.5, 0.025, 0.223, 0.977, 0.778],
    rod: [2 / 3, 0.473, 0.011, 0.529, 0.989],
    hookTip: [1, 0.217, 0.03, 0.819, 0.944],
    patch: [1, 0.078, 0.169, 0.925, 0.836],
    boatKit: [1.5, 0.059, 0.102, 0.943, 0.886],
    lens: [1, 0.027, 0.03, 0.973, 0.967],
    chalk: [1, 0.102, 0.161, 0.921, 0.889],
  };
  if (item === "keyBow") return "20,22 88,22 88,79 20,79";
  const b = bounds[item];
  if (!b) return undefined;
  const [aspect, left, top, right, bottom] = b;
  const boxWidth = (w * 16) / 9;
  const scale =
    item === "rod"
      ? Math.max(boxWidth / aspect, h)
      : Math.min(boxWidth / aspect, h);
  const rw = (scale * aspect) / boxWidth,
    rh = scale / h;
  const cx = (1 - rw) / 2 + ((left + right) / 2) * rw,
    cy = (1 - rh) / 2 + ((top + bottom) / 2) * rh;
  const halfW = Math.max(
    ((right - left) * rw) / 2 + 0.5 / w,
    ((19 / stageWidth) * 100) / w,
  );
  const halfH = Math.max(
    ((bottom - top) * rh) / 2 + 0.9 / h,
    ((19 / stageWidth) * 100 * 16) / 9 / h,
  );
  const x1 = Math.max(0, cx - halfW) * 100,
    x2 = Math.min(1, cx + halfW) * 100;
  const y1 = Math.max(0, cy - halfH) * 100,
    y2 = Math.min(1, cy + halfH) * 100;
  return `${x1},${y1} ${x2},${y1} ${x2},${y2} ${x1},${y2}`;
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
      shape="ellipse"
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
  name:
    | "menu"
    | "book"
    | "map"
    | "back"
    | "left"
    | "right"
    | "sound"
    | "close"
    | "eye";
}) {
  const paths = {
    map: "m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2ZM9 3v16M15 5v16",
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
