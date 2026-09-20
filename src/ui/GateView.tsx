import { closeup } from "../content/assets";
import type { Game } from "../game/model";
import { Photo } from "./Primitives";

/** The entire gate, including its mounted hardware, remains one photographic surface. */
export function GateView({ game: g }: { game: Game }) {
  return (
    <>
      <Photo
        src={closeup(
          g.gateOpen ? "gate-open" : ["gate-low", "gate", "gate-high"][g.water],
        )}
        alt={
          g.gateOpen
            ? "石のアーチの下で両側に開いた水門"
            : "石のアーチに収まる両開きの水門と水位窓"
        }
      />
      <div
        className={`gate-level inner ${g.gateOpen ? "opened" : ""}`}
        style={{ "--fill": `${[8, 44, 80][g.water]}%` } as React.CSSProperties}
      />
      <div
        className={`gate-level outer ${g.gateOpen ? "opened" : ""}`}
        style={{ "--fill": "80%" } as React.CSSProperties}
      />
    </>
  );
}
