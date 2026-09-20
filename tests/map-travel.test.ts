import { describe, expect, it } from "vitest";
import { act, parseSave } from "../src/game/engine";
import { mapTravelBlock, newGame, type Room } from "../src/game/model";

describe("マップから訪問済みの場所へ移動する", () => {
  it("離れた部屋へ移動し、接写と向きを戻して進行を保持する", () => {
    const g = newGame();
    g.started = g.shutterOpen = true;
    g.room = "office";
    g.detail = "drawer";
    g.face = 1;
    g.visited = ["waiting", "office", "workshop", "pump"];
    g.keyTurn = 1;
    g.items.crank = "inventory";
    const moved = act(g, { type: "mapTravel", room: "pump" }).game;
    expect([moved.room, moved.face, moved.detail]).toEqual(["pump", 0, null]);
    expect(moved.items).toEqual(g.items);
    expect(moved.keyTurn).toBe(1);
    expect(moved.water).toBe(g.water);
    expect(parseSave(JSON.stringify(moved))?.room).toBe("pump");
  });
  it("未訪問の場所は解放しない", () => {
    const g = newGame();
    g.shutterOpen = true;
    for (const room of ["office", "pump", "lookout", "service"] as Room[]) {
      expect(mapTravelBlock(g, room)).not.toBeNull();
      expect(act(g, { type: "mapTravel", room }).game.room).toBe("waiting");
    }
  });
  it("訪問済みでも水没中の通路へ移動できず、排水後に再び使える", () => {
    const g = newGame();
    g.shutterOpen = true;
    g.visited.push("service");
    for (const water of [1, 2] as const) {
      g.water = water;
      expect(act(g, { type: "mapTravel", room: "service" }).game.room).toBe(
        "waiting",
      );
    }
    g.water = 0;
    expect(act(g, { type: "mapTravel", room: "service" }).game.room).toBe(
      "service",
    );
  });
  it("観測室は浮体の補修・固定解除・高水位が揃った時だけ移動できる", () => {
    const g = newGame();
    g.shutterOpen = true;
    g.visited.push("lookout");
    g.water = 2;
    expect(mapTravelBlock(g, "lookout")).not.toBeNull();
    g.pins = [false, false];
    g.support = [0, 0];
    g.patchMounted = true;
    g.patchBolts = [true, true, true, true];
    g.tankDry = true;
    expect(act(g, { type: "mapTravel", room: "lookout" }).game.room).toBe(
      "lookout",
    );
    g.water = 0;
    expect(mapTravelBlock(g, "lookout")).not.toBeNull();
  });
  it("航行中や終了後はマップで水路を飛ばせない", () => {
    const g = newGame();
    g.shutterOpen = true;
    g.visited.push("dock");
    g.atSea = true;
    g.seaNode = "C";
    const result = act(g, { type: "mapTravel", room: "dock" });
    expect(result.game.atSea).toBe(true);
    expect(result.game.seaNode).toBe("C");
    expect(mapTravelBlock(g, "dock")).not.toBeNull();
    g.atSea = false;
    g.ended = true;
    expect(mapTravelBlock(g, "dock")).not.toBeNull();
  });
});

describe("解錠済みの錠", () => {
  it("道具なしの再操作でも鍵を要求せず、解錠状態を保つ", () => {
    const g = newGame();
    g.keyTurn = 1;
    g.keyExtracted = true;
    g.drawerOpen = true;
    for (const type of ["turnKey", "extractKey"] as const) {
      const result = act(g, { type });
      expect(result.message).toBe("錠はすでに外れている。");
      expect(result.game.keyTurn).toBe(1);
      expect(result.game.drawerOpen).toBe(true);
    }
  });
});
