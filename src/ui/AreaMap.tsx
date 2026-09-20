import { raised, roomNames, type Game, type Room } from "../game/model";

const positions: Record<Room, [number, number]> = {
  office: [80, 65],
  workshop: [240, 65],
  pump: [400, 65],
  concourse: [240, 205],
  waiting: [80, 315],
  dock: [400, 315],
  lookout: [80, 450],
  service: [400, 450],
};
const links: [Room, Room][] = [
  ["concourse", "office"],
  ["concourse", "workshop"],
  ["concourse", "pump"],
  ["concourse", "waiting"],
  ["concourse", "dock"],
  ["concourse", "service"],
  ["waiting", "lookout"],
  ["concourse", "lookout"],
];

export function AreaMap({ game: g }: { game: Game }) {
  const known = new Set([...g.visited, g.room]);
  const rows = [...known].map((room) => positions[room][1]);
  const top = Math.min(...rows) - 65;
  const height = Math.max(...rows) - top + 60;
  const blocked = (room: Room) =>
    room === "service"
      ? g.water !== 0
      : room === "lookout"
        ? !raised(g)
        : false;
  return (
    <>
      <span className="eyebrow">AREA MAP</span>
      <h2>渡船場のマップ</h2>
      <p className="map-location">
        現在地{" "}
        <strong>
          {g.atSea
            ? g.ended
              ? "渡船場の沖"
              : "水路を航行中"
            : roomNames[g.room]}
        </strong>
      </p>
      <svg
        className="area-map"
        viewBox={`0 ${top} 480 ${height}`}
        role="img"
        aria-label={`訪れた場所のつながり。現在地：${g.atSea ? "渡船場の沖" : roomNames[g.room]}`}
      >
        <defs>
          <marker
            id="map-arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M0 0 10 5 0 10" fill="none" stroke="currentColor" />
          </marker>
        </defs>
        {links
          .filter(([a, b]) => known.has(a) && known.has(b))
          .map(([a, b]) => {
            const [x1, y1] = positions[a],
              [x2, y2] = positions[b];
            const closed = blocked(a) || blocked(b);
            const oneWay = a === "concourse" && b === "lookout";
            return (
              <g
                key={`${a}-${b}`}
                className={closed ? "map-link closed" : "map-link"}
              >
                <path
                  d={
                    oneWay
                      ? "M225 235 V405 H105 L80 423"
                      : `M${x1} ${y1} L${x2} ${y2}`
                  }
                  markerEnd={oneWay ? "url(#map-arrow)" : undefined}
                />
                {closed && (
                  <text
                    x={oneWay ? 225 : (x1 + x2) / 2}
                    y={oneWay ? 365 : (y1 + y2) / 2}
                    className="map-blocked"
                  >
                    ×
                  </text>
                )}
              </g>
            );
          })}
        {(Object.keys(positions) as Room[])
          .filter((room) => known.has(room))
          .map((room) => {
            const [x, y] = positions[room],
              current = !g.atSea && g.room === room;
            return (
              <g
                key={room}
                transform={`translate(${x} ${y})`}
                className={`map-room ${current ? "current" : ""}`}
              >
                <rect x="-65" y="-27" width="130" height="54" rx="5" />
                <text textAnchor="middle" y="7">
                  {roomNames[room]}
                </text>
                {current && (
                  <>
                    <circle cx="-52" cy="-38" r="4" />
                    <text className="map-you" x="-42" y="-33">
                      現在地
                    </text>
                  </>
                )}
              </g>
            );
          })}
      </svg>
      <p className="map-note">
        訪れた場所を記録した概略図です。×
        は今は通れない通路。矢印は片方向の移動です。
      </p>
      {g.atSea && (
        <p className="map-note">
          水路では、記録帳の測量図と目印を確かめてください。
        </p>
      )}
    </>
  );
}
