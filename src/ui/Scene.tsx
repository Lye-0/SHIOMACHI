import { SceneAction } from "./ActionBar";
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
import { ServiceView } from "./PontoonView";
import { beltGeometry } from "./SmallPuzzles";
import {
  TrayMiniature,
  PaperMiniature,
  PipeMiniature,
  MapMiniature,
} from "./Miniatures";

export function Scene({ game: g, send }: ControlProps) {
  if (g.atSea || g.boarded) return <SeaScene game={g} send={send} />;
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
    service: "service",
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
        <SceneAction
          className="passage-link exit"
          onClick={
            (g.room === "office" || g.room === "workshop") && g.face === 0
              ? () => send({ type: "face" })
              : go(g.room === "service" ? "waiting" : "concourse")
          }
        >
          {(g.room === "office" || g.room === "workshop") && g.face === 0
            ? "入口を振り返る"
            : g.room === "service"
              ? "待合室へ ↑"
              : "連絡桟橋へ →"}
        </SceneAction>
      )}
      {g.room === "waiting" && g.shutterOpen && g.water === 0 && (
        <SceneAction onClick={go("service")}>床下へ降りる ↓</SceneAction>
      )}
      {g.room === "lookout" && (
        <SceneAction className="passage-link exit" onClick={go("waiting")}>
          待合室へ →
        </SceneAction>
      )}
      {g.room === "concourse" && (
        <SceneAction className="passage-link dock" onClick={go("dock")}>
          ← 船溜まりへ
        </SceneAction>
      )}
      {g.room === "dock" ? (
        <DockView game={g} />
      ) : g.room === "service" && g.face === 0 ? (
        <ServiceView game={g} />
      ) : (
        <Photo src={scene(g.face ? back[g.room] : front[g.room])} alt="" />
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
              x={53}
              y={19}
              w={16}
              h={57}
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
              x={58}
              y={19}
              w={13}
              h={58}
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
              x={26}
              y={raised(g) ? 20 : 30}
              w={5.5}
              h={23}
              onClick={go("waiting")}
            />
            <Hit
              label="待合室の床下へ"
              x={18}
              y={56}
              w={14}
              h={22}
              onClick={go("service")}
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
              x={20.8}
              y={26.7}
              w={11}
              h={41.5}
              onClick={go("office")}
            />
            <Hit
              label="整備工房へ"
              x={39.2}
              y={26}
              w={23}
              h={43}
              onClick={go("workshop")}
            />
            <Hit
              label="ポンプ室へ"
              x={71}
              y={26}
              w={16.5}
              h={44}
              onClick={go("pump")}
            />
            <SceneAction className="shore-exit" onClick={inspect("landward")}>
              陸側へ
            </SceneAction>
          </>
        ))}
      {g.room === "office" &&
        (g.face === 0 ? (
          <>
            <PaperMiniature game={g} />
            {!g.keyTurn && !g.drawerOpen && (
              <Hit
                label="机の鍵穴を調べる"
                x={47.6}
                y={79}
                w={2.8}
                h={5}
                onClick={inspect("key")}
              />
            )}
            {[0, 1].map((i) => (
              <Hit
                key={i}
                label={i ? "右の引き手を調べる" : "引き出しを調べる"}
                x={g.drawerOpen ? (i ? 72 : 19.5) : i ? 69.5 : 23.5}
                y={g.drawerOpen ? 90.7 : 80.8}
                w={g.drawerOpen ? 7 : 6.2}
                h={g.drawerOpen ? 7 : 6}
                shape="50,0 78,12 100,70 100,100 0,100 0,70 22,12"
                onClick={inspect("drawer")}
              />
            ))}
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
              x={23.3}
              y={10}
              w={30.5}
              h={36}
              onClick={inspect("shore")}
            />
            <Hit
              label="桟橋へ戻る"
              x={62.5}
              y={7.5}
              w={19}
              h={75}
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
              x={23.5}
              y={46.5}
              w={28.8}
              h={19}
              shape="14,0 100,0 98,96 0,100 0,37"
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
            {g.items.patch === "rack" && (
              <Hit
                label="補修板の棚を調べる"
                x={19}
                y={44}
                w={13}
                h={15}
                onClick={inspect("rack")}
              />
            )}
            <Hit
              label="配管の続きを見る"
              x={44.4}
              y={16}
              w={19}
              h={29}
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
              x={14.2}
              y={23}
              w={35}
              h={44.5}
              onClick={inspect("pipes")}
            />
            <Hit
              label="駆動部を調べる"
              x={52.3}
              y={53.5}
              w={25}
              h={25}
              onClick={inspect("belt")}
            />
            <Hit
              label="吸込み口を調べる"
              x={89}
              y={54}
              w={9}
              h={28}
              onClick={inspect("strainer")}
            />
          </>
        ) : (
          <>
            <Hit
              label="水位窓を調べる"
              x={24.3}
              y={21}
              w={8.3}
              h={43}
              onClick={inspect("window")}
            />
            <Hit
              label="桟橋へ戻る"
              x={70}
              y={20}
              w={19}
              h={63}
              onClick={go("concourse")}
            />
          </>
        ))}
      {g.room === "service" &&
        (g.face === 0 ? (
          <>
            <Hit
              label="浮体の固定具を調べる"
              x={20}
              y={22}
              w={31}
              h={54}
              onClick={inspect("supports")}
            />
            <Hit
              label="浮体の割れ目を調べる"
              x={68}
              y={24.5}
              w={24}
              h={41}
              onClick={inspect("patch")}
            />
          </>
        ) : (
          <>
            <Hit
              label="船具ケースを調べる"
              x={10.8}
              y={g.caseOpen ? 29 : 50}
              w={32}
              h={g.caseOpen ? 54 : 32}
              onClick={inspect("rings")}
            />
            <Hit
              label="水路の奥を見る"
              x={52}
              y={33}
              w={23}
              h={38}
              shape="0,100 0,38 8,16 27,4 50,0 72,4 91,16 100,38 100,100"
              onClick={inspect("shore")}
            />
            <Hit
              label="待合室へ上がる"
              x={82}
              y={27}
              w={16}
              h={63}
              onClick={go("waiting")}
            />
          </>
        ))}
      {g.room === "lookout" &&
        (g.face === 0 ? (
          <>
            <MapMiniature game={g} />
            <Hit
              label="測量図を調べる"
              x={18}
              y={55}
              w={47}
              h={22}
              shape="0,25 68,0 100,49 0,100"
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
              x={87.5}
              y={22}
              w={12.5}
              h={63}
              onClick={go("waiting")}
            />
          </>
        ) : (
          <>
            <Hit
              label="見通し標を調べる"
              x={13}
              y={8}
              w={76}
              h={49}
              onClick={inspect("survey")}
            />
          </>
        ))}
      {g.room === "dock" && (
        <>
          <Hit
            label="船を調べる"
            x={8}
            y={g.water === 2 && !boatReady(g) ? 40 : 33}
            w={61}
            h={g.water === 2 && !boatReady(g) ? 17 : 27}
            shape="0,0 18,16 67,21 100,15 95,83 53,100 9,78"
            onClick={inspect("boat")}
          />
          <Hit
            label="船台のくぼみを調べる"
            x={22}
            y={68}
            w={39}
            h={31}
            shape="7,0 12,3 20,30 36,48 55,58 73,55 86,40 94,20 98,20 100,96 0,82"
            onClick={inspect("trace")}
          />
          <Hit
            label="岸壁の水位目盛を調べる"
            x={87.7}
            y={26}
            w={1.8}
            h={27}
            onClick={inspect("depth")}
          />
          <Hit
            label="水門の閂を調べる"
            x={57.8}
            y={13}
            w={17.6}
            h={23.4}
            shape="0,19 15,7 50,0 85,7 100,19 100,100 0,100"
            onClick={inspect("gate")}
          />
          <Hit
            label="船灯を調べる"
            x={64}
            y={37 + (g.water === 2 && !boatReady(g) ? 6 : 0)}
            w={4}
            h={7}
            shape="25,0 70,0 100,29 86,77 66,85 66,100 20,100 20,77 0,53 0,23"
            onClick={inspect("lantern")}
          />
          <SceneAction
            className="passage-link dock"
            onClick={() => send({ type: "board" })}
          >
            船に乗る
          </SceneAction>
        </>
      )}
    </>
  );
}
