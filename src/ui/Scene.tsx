import {
  scene,
  itemImage,
  mechanism,
  waitingSceneName,
} from "../content/assets";
import { raised, boatReady, type Detail, type Room } from "../game/model";
import { Hit, Photo, Pickup } from "./Primitives";
import type { ControlProps } from "./PumpControls";
import { SeaScene, SurveyMarkers } from "./Navigation";
import { DockView } from "./DockView";
import { Patch } from "./RepairControls";
import { beltGeometry } from "./SmallPuzzles";
import {
  TrayMiniature,
  PaperMiniature,
  PipeMiniature,
  MapMiniature,
} from "./Miniatures";

export function Scene({ game: g, send }: ControlProps) {
  if (g.atSea) return <SeaScene game={g} send={send} />;
  const inspect = (detail: Detail) => () => send({ type: "inspect", detail });
  const go = (room: Room) => () => send({ type: "visit", room });
  const front: Record<Room, string> = {
    waiting: waitingSceneName(g, 0),
    concourse:
      g.water === 0
        ? "concourse-low"
        : raised(g)
          ? "concourse-high"
          : g.water === 2
            ? "concourse-high-held"
            : "concourse-mid",
    office: g.drawerOpen ? "office-open" : "office",
    workshop: "workshop",
    pump: "pump",
    service: g.pins.some((pin) => !pin) ? "service-pins-out" : "service",
    lookout: "lookout",
    dock:
      g.water === 0
        ? "dock-low"
        : g.water === 2
          ? boatReady(g)
            ? "dock-high"
            : "dock-high-flooded"
          : "dock-mid",
  };
  const back: Record<Room, string> = {
    waiting: waitingSceneName(g, 1),
    concourse: "concourse-doors",
    office: "office-shelves",
    workshop: "workshop-rack",
    pump: "pump-back",
    service: g.caseOpen ? "service-end-open" : "service-end",
    lookout: "lookout-window",
    dock: front.dock,
  };
  return (
    <>
      {(["dock", "office", "workshop", "pump", "service"] as Room[]).includes(
        g.room,
      ) && (
        <button
          className="passage-link exit"
          onClick={
            (g.room === "office" || g.room === "workshop") && g.face === 0
              ? () => send({ type: "face" })
              : go("concourse")
          }
        >
          {(g.room === "office" || g.room === "workshop") && g.face === 0
            ? "入口を振り返る"
            : "連絡桟橋へ →"}
        </button>
      )}
      {g.room === "lookout" && (
        <button className="passage-link exit" onClick={go("waiting")}>
          待合室へ →
        </button>
      )}
      {g.room === "concourse" && (
        <button className="passage-link dock" onClick={go("dock")}>
          ← 船溜まりへ
        </button>
      )}
      {g.room === "dock" ? (
        <DockView game={g} />
      ) : (
        <Photo src={scene(g.face ? back[g.room] : front[g.room])} alt="" />
      )}
      {g.room === "service" && g.face === 0 && (
        <>
          <div className="room-patch-model" inert aria-hidden="true">
            <Patch game={g} send={() => {}} />
          </div>
          {g.pins[0] && (
            <Photo
              src={scene("service")}
              style={{ clipPath: "polygon(0 0,35% 0,35% 100%,0 100%)" }}
            />
          )}
          {g.pins[1] && (
            <Photo
              src={scene("service")}
              style={{ clipPath: "polygon(35% 0,53% 0,53% 100%,35% 100%)" }}
            />
          )}
          {g.support.map(
            (load, i) =>
              load > 0 && (
                <Photo
                  key={i}
                  src={scene("service-loaded")}
                  style={{
                    clipPath:
                      i === 0
                        ? "polygon(24% 34%,33% 34%,33% 37%,24% 37%)"
                        : "polygon(38% 33%,48% 33%,48% 36%,38% 36%)",
                    opacity: load / 2,
                  }}
                />
              ),
          )}
        </>
      )}
      {g.room === "service" && g.face === 1 && (
        <>
          {g.caseOpen && (
            <Photo
              src={scene("service-end")}
              style={{ clipPath: "polygon(52% 29%,70% 29%,70% 60%,52% 60%)" }}
            />
          )}
          {[4, 2.75, 1.5].map((size, i) => (
            <img
              key={i}
              src={mechanism("locking-ring")}
              alt=""
              style={{
                position: "absolute",
                left: `${35.6 - size / 2}%`,
                top: `${64.5 - size * 0.8889}%`,
                width: `${size}%`,
                height: `${size * 1.7778}%`,
                transform: `rotate(${g.rings[i] * 45}deg) skewY(-12deg)`,
                filter: "brightness(.65)",
                pointerEvents: "none",
              }}
            />
          ))}
          {g.caseOpen && g.items.boatKit === "case" && (
            <img
              src={itemImage("boatKit")}
              alt=""
              style={{
                position: "absolute",
                left: "22%",
                top: "52%",
                width: "12%",
                height: "5%",
                objectFit: "fill",
                filter: "brightness(.65)",
                pointerEvents: "none",
              }}
            />
          )}
        </>
      )}
      {g.room === "pump" && g.face === 1 && (
        <div
          className="pump-room-level"
          style={{ height: `${[3, 16, 30][g.water]}%` }}
        />
      )}
      {g.room === "workshop" && g.face === 1 && g.items.patch === "rack" && (
        <img
          src={itemImage("patch")}
          alt=""
          style={{
            position: "absolute",
            left: "16%",
            top: "40%",
            width: "19%",
            height: "23%",
            objectFit: "contain",
            filter: "brightness(.7) drop-shadow(3px 4px 2px #0008)",
            pointerEvents: "none",
          }}
        />
      )}
      {g.room === "lookout" && g.face === 1 && (
        <SurveyMarkers position={g.surveyPosition} miniature />
      )}
      {g.room === "office" &&
        g.face === 0 &&
        g.drawerOpen &&
        (["crank", "hookTip"] as const).map((item, i) =>
          g.items[item] === "drawer" ? (
            <img
              key={item}
              src={itemImage(item)}
              alt=""
              style={{
                position: "absolute",
                left: `${32 + i * 25}%`,
                top: "76%",
                width: "13%",
                height: "7%",
                objectFit: "contain",
                filter: "brightness(.7)",
                pointerEvents: "none",
              }}
            />
          ) : null,
        )}
      {g.room === "workshop" && g.face === 0 && g.trayOpen && (
        <div className="room-open-tray">
          {(["pliers", "keyJig"] as const).map((item) =>
            g.items[item] === "tray" ? (
              <img key={item} src={itemImage(item)} alt="" />
            ) : null,
          )}
        </div>
      )}
      {g.room === "pump" && g.face === 0 && (
        <>
          {g.strainerClear && (
            <Photo
              src={scene("pump-clear")}
              style={{ clipPath: "polygon(87% 50%,99% 50%,99% 84%,87% 84%)" }}
            />
          )}
          {[
            [64.8, 68.7],
            [71.3, 68.5],
            [64.5, 59],
            [68.5, 73],
          ].map(([x, y], i) => (
            <img
              key={i}
              src={mechanism("pulley")}
              alt=""
              style={{
                position: "absolute",
                left: `${x - 1.6}%`,
                top: `${y - 2.844}%`,
                width: "3.2%",
                height: "5.688%",
                filter: "brightness(.7)",
                pointerEvents: "none",
              }}
            />
          ))}
          <svg className="mechanism-svg" viewBox="0 0 1000 562.5">
            <path
              d={beltGeometry(g.beltRoute, [
                [64.8, 68.7],
                [71.3, 68.5],
                [64.5, 59],
                [68.5, 73],
              ])}
              fill="none"
              stroke="#101510"
              strokeWidth="5"
            />
          </svg>
          {[21.5, 31.9, 42.4].map((x, i) => (
            <img
              key={i}
              src={mechanism("valve-wheel")}
              alt=""
              style={{
                position: "absolute",
                left: `${x - 2.7}%`,
                top: "35%",
                width: "5.4%",
                height: "9.6%",
                transform: `rotate(${g.valves[i] ? 90 : 0}deg)`,
                filter: "brightness(.65)",
                pointerEvents: "none",
              }}
            />
          ))}
          <span
            className="level-handle"
            style={{
              left: `${[22.2, 25.2, 28.2][g.target]}%`,
              top: "60.5%",
              width: "1.5%",
              height: "2.7%",
            }}
          />
        </>
      )}
      {g.room === "waiting" &&
        (g.face === 0 ? (
          <>
            <Hit
              label={g.shutterOpen ? "桟橋へ" : "戸の留め金を調べる"}
              x={49}
              y={24}
              w={24}
              h={59}
              onClick={g.shutterOpen ? go("concourse") : inspect("shutter")}
            />
            <Hit
              label="窓の外を見る"
              x={17}
              y={16}
              w={32}
              h={35}
              onClick={inspect("window")}
            />
          </>
        ) : (
          <>
            <Hit
              label="向こうの通路を調べる"
              x={56}
              y={23}
              w={17}
              h={54}
              onClick={go("lookout")}
            />
            <Hit
              label="窓の外を見る"
              x={19}
              y={17}
              w={34}
              h={34}
              onClick={inspect("window")}
            />
          </>
        ))}
      {g.room === "concourse" &&
        (g.face === 0 ? (
          <>
            <Hit
              label="待合室へ"
              x={24}
              y={raised(g) ? 19 : 30}
              w={10}
              h={raised(g) ? 25 : 25}
              onClick={go("waiting")}
            />
            <Hit
              label="下の整備通路へ"
              x={69}
              y={54}
              w={17}
              h={22}
              onClick={go("service")}
            />
            <Hit
              label="船溜まりへ"
              x={2}
              y={53}
              w={13}
              h={30}
              onClick={go("dock")}
            />
            <Hit
              label="待合室と案内柱を見比べる"
              x={12}
              y={7}
              w={7}
              h={49}
              onClick={inspect("window")}
            />
            <Hit
              label="上の通路へ"
              x={76}
              y={21}
              w={7}
              h={23}
              onClick={go("lookout")}
            />
          </>
        ) : (
          <>
            <Hit
              label="事務室へ"
              x={10}
              y={20}
              w={23}
              h={65}
              onClick={go("office")}
            />
            <Hit
              label="整備工房へ"
              x={40}
              y={20}
              w={22}
              h={65}
              onClick={go("workshop")}
            />
            <Hit
              label="ポンプ室へ"
              x={70}
              y={20}
              w={20}
              h={65}
              onClick={go("pump")}
            />
            <button className="shore-exit" onClick={inspect("landward")}>
              陸側へ
            </button>
          </>
        ))}
      {g.room === "office" &&
        (g.face === 0 ? (
          <>
            <PaperMiniature game={g} />
            <Hit
              label="机の鍵穴を調べる"
              x={46}
              y={78}
              w={6}
              h={7}
              onClick={inspect("key")}
            />
            <Hit
              label="引き出しを調べる"
              x={14}
              y={85}
              w={72}
              h={9}
              onClick={inspect("drawer")}
            />
            <Hit
              label="紙片を調べる"
              x={32}
              y={55}
              w={32}
              h={12}
              onClick={inspect("diagram")}
            />
            {g.items.keyBow === "desk" && (
              <Pickup
                item="keyBow"
                x={65}
                y={57}
                w={8}
                h={7}
                onClick={() => send({ type: "take", item: "keyBow" })}
              />
            )}
            {g.items.chalk === "desk" && (
              <Pickup
                item="chalk"
                x={71}
                y={62}
                w={5}
                h={4}
                onClick={() => send({ type: "take", item: "chalk" })}
              />
            )}
          </>
        ) : (
          <>
            <PipeMiniature className="office-pipes" />
            <Hit
              label="壁の配管図を調べる"
              x={23}
              y={12}
              w={31}
              h={34}
              onClick={inspect("shore")}
            />
            <Hit
              label="桟橋へ戻る"
              x={70}
              y={15}
              w={23}
              h={71}
              onClick={go("concourse")}
            />
          </>
        ))}
      {g.room === "workshop" &&
        (g.face === 0 ? (
          <>
            <TrayMiniature game={g} />
            <Hit
              label="工具箱を調べる"
              x={23}
              y={46}
              w={29}
              h={23}
              onClick={inspect("tray")}
            />
            {g.items.belt === "bench" && (
              <Pickup
                item="belt"
                x={59}
                y={56}
                w={17}
                h={11}
                onClick={() => send({ type: "take", item: "belt" })}
              />
            )}
            {g.items.rod === "bench" && (
              <Pickup
                item="rod"
                x={76}
                y={19}
                w={6}
                h={63}
                onClick={() => send({ type: "take", item: "rod" })}
              />
            )}
          </>
        ) : (
          <>
            <PipeMiniature className="workshop-pipes" />
            <Hit
              label="補修板の棚を調べる"
              x={14}
              y={26}
              w={26}
              h={41}
              onClick={inspect("rack")}
            />
            <Hit
              label="配管の続きを見る"
              x={41}
              y={8}
              w={35}
              h={30}
              onClick={inspect("shore")}
            />
            <Hit
              label="桟橋へ戻る"
              x={79}
              y={15}
              w={17}
              h={72}
              onClick={go("concourse")}
            />
          </>
        ))}
      {g.room === "pump" &&
        (g.face === 0 ? (
          <>
            <Hit
              label="三つの弁を調べる"
              x={14}
              y={22}
              w={36}
              h={46}
              onClick={inspect("pipes")}
            />
            <Hit
              label="駆動部を調べる"
              x={52}
              y={54}
              w={28}
              h={32}
              onClick={inspect("belt")}
            />
            <Hit
              label="吸込み口を調べる"
              x={86}
              y={51}
              w={12}
              h={34}
              onClick={inspect("strainer")}
            />
          </>
        ) : (
          <>
            <Hit
              label="水位窓を調べる"
              x={22}
              y={20}
              w={22}
              h={57}
              onClick={inspect("window")}
            />
            <Hit
              label="桟橋へ戻る"
              x={62}
              y={16}
              w={28}
              h={74}
              onClick={go("concourse")}
            />
          </>
        ))}
      {g.room === "service" &&
        (g.face === 0 ? (
          <>
            <Hit
              label="浮体の固定具を調べる"
              x={11}
              y={35}
              w={38}
              h={43}
              onClick={inspect("supports")}
            />
            <Hit
              label="浮体の割れ目を調べる"
              x={52}
              y={34}
              w={30}
              h={39}
              onClick={inspect("patch")}
            />
          </>
        ) : (
          <>
            <Hit
              label="船具ケースを調べる"
              x={17}
              y={49}
              w={31}
              h={29}
              onClick={inspect("rings")}
            />
            <Hit
              label="水路の奥を見る"
              x={49}
              y={19}
              w={25}
              h={46}
              onClick={inspect("shore")}
            />
            <Hit
              label="岸へ上がる"
              x={79}
              y={18}
              w={17}
              h={67}
              onClick={go("concourse")}
            />
          </>
        ))}
      {g.room === "lookout" &&
        (g.face === 0 ? (
          <>
            <MapMiniature game={g} />
            <Hit
              label="測量図を調べる"
              x={20}
              y={51}
              w={45}
              h={32}
              onClick={inspect("chart")}
            />
            {g.items.lens === "shelf" && (
              <Pickup
                item="lens"
                x={74}
                y={24}
                w={9}
                h={16}
                onClick={() => send({ type: "take", item: "lens" })}
              />
            )}
            <Hit
              label="待合室へ戻る"
              x={83}
              y={66}
              w={13}
              h={22}
              onClick={go("waiting")}
            />
          </>
        ) : (
          <>
            <Hit
              label="見通し標を調べる"
              x={12}
              y={14}
              w={76}
              h={66}
              onClick={inspect("survey")}
            />
          </>
        ))}
      {g.room === "dock" && (
        <>
          <Hit
            label="船を調べる"
            x={8}
            y={33}
            w={55}
            h={28}
            onClick={inspect("boat")}
          />
          <Hit
            label="船台のくぼみを調べる"
            x={22}
            y={75}
            w={44}
            h={15}
            onClick={inspect("trace")}
          />
          <Hit
            label="岸壁の水位目盛を調べる"
            x={84}
            y={24}
            w={8}
            h={33}
            onClick={inspect("depth")}
          />
          <Hit
            label="水門の閂を調べる"
            x={55}
            y={10}
            w={23}
            h={28}
            onClick={inspect("gate")}
          />
          <Hit
            label="船灯を調べる"
            x={63}
            y={35 + (g.water === 2 && !boatReady(g) ? 6 : 0)}
            w={7}
            h={12}
            onClick={inspect("lantern")}
          />
          <button
            className="passage-link dock"
            onClick={() => send({ type: "depart" })}
          >
            船に乗る
          </button>
        </>
      )}
    </>
  );
}
