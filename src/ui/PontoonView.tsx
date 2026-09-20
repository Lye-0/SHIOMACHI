import { closeup, scene } from "../content/assets";
import type { Game } from "../game/model";
import { Photo } from "./Primitives";

export function supportState(g: Game, i: number) {
  return g.pins[i]
    ? g.support[i] === 2
      ? "loaded"
      : "base"
    : g.support[i] === 2
      ? "released"
      : "free";
}

export function SupportsView({ game: g }: { game: Game }) {
  return (
    <>
      <Photo
        src={closeup(`supports-${supportState(g, 0)}`)}
        alt="木の床を載せた箱、案内柱の固定ピンと別置きの支持ジャッキ"
      />
      <Photo
        src={closeup(`supports-${supportState(g, 1)}`)}
        style={{ clipPath: "inset(0 0 0 50%)" }}
      />
    </>
  );
}

export function ServiceView({ game: g }: { game: Game }) {
  return (
    <>
      <Photo
        src={scene(
          g.tankDry
            ? "service-dry"
            : g.patchMounted
              ? "service-patched"
              : "service",
        )}
        alt="待合室の木の床、その下の密閉箱と固定具"
      />
      {[0, 1].map((i) => (
        <Photo
          key={i}
          src={scene(`service-${supportState(g, i)}`)}
          style={{
            clipPath:
              i === 0 ? "inset(15% 68% 24% 19%)" : "inset(12% 48% 15% 32%)",
          }}
        />
      ))}
    </>
  );
}

export const patchBoltCenters = [
  [42.8, 34.7],
  [55.9, 34.7],
  [42.8, 59.4],
  [55.9, 59.4],
];
export function PatchView({ game: g }: { game: Game }) {
  return (
    <>
      <Photo
        src={closeup(
          g.tankDry
            ? "patch-drained"
            : g.patchMounted
              ? "patch-mounted"
              : "patch",
        )}
        alt="密閉箱の損傷と補修穴、内部の水が見える管と排水コック"
      />
      {g.patchMounted &&
        !g.tankDry &&
        patchBoltCenters.map(
          ([x, y], i) =>
            g.patchBolts[i] && (
              <Photo
                key={i}
                src={closeup("patch-tight")}
                style={{ clipPath: `ellipse(2.7% 4.8% at ${x}% ${y}%)` }}
              />
            ),
        )}
    </>
  );
}
