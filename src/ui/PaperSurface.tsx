import { closeup, scene } from "../content/assets";
import { Photo } from "./Primitives";

/** A readable document held in the current room, not a jump to another desk. */
export function PaperSurface({ background }: { background: string }) {
  return (
    <>
      <Photo
        src={scene(background)}
        style={{ filter: "brightness(.45) blur(2px)" }}
      />
      <Photo
        src={closeup("paper-desk")}
        style={{ clipPath: "polygon(14% 5%,86% 6%,90% 91%,9% 90%)" }}
      />
    </>
  );
}
