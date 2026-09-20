import {
  paperComplete,
  freePontoon,
  raised,
  soundPontoon,
  type Detail,
  type Game,
} from "../game/model";
export interface Hint {
  id: string;
  title: string;
  steps: string[];
}
const hints: Partial<Record<Detail, Omit<Hint, "id">>> = {
  shutter: {
    title: "待合室の戸",
    steps: [
      "外の渡り板へ出たい。",
      "戸枠に、留め金が残っている。",
      "三本とも、枠から外す。",
      "留め金を右へずらしてから、戸の右側を押す。",
    ],
  },
  tray: {
    title: "工具の受け台",
    steps: [
      "細口の工具を取り出したい。",
      "箱の右側に、受け台が通る切れ目がある。",
      "真鍮の取っ手がある段を空けるには、縦の収納材を上下へ逃がす。",
      "真鍮の受け台の右側を塞ぐ縦材を、その上下の空きを作って逃がす。受け台が右端に届いたら、箱の右を引く。",
    ],
  },
  diagram: {
    title: "紙片",
    steps: [
      "紙片の線が、どこへ続くか見たい。",
      "紙の端だけでなく、柱や水面の線もつながる。",
      "二枚を選ぶと位置を入れ替えられる。各紙片の↻で向きを変えられる。",
      "見出しを上、支持具の図を下へ。縦の案内柱が上段を貫く配置にする。",
    ],
  },
  pipes: {
    title: "水の行き先",
    steps: [
      "低い通路を調べるには、船溜まりから水を抜く。",
      "配管図の左は吸込み、右は海への排水。中央は海からの注水につながる。",
      "吸込みと排水を開き、注水を閉じる。水が途中で止まるなら、吸込み口も見る。",
      "左と右の白い印を横向き、中央を上向きに。留め位置をⅠにして押釦を押す。",
    ],
  },
  patch: {
    title: "浮体の水",
    steps: [
      "固定具を外しても、浮体の中に水が残っている。",
      "割れ目の周りの穴と、工房の補修板を比べる。",
      "板の長い向きを割れ目に合わせ、穴がそろってから固定する。",
      "補修板を選び、割れ目に当ててから縦向きに回し、取り付ける。ペンチで四本のボルトを締め、右下の排水コックを開く。",
    ],
  },
  rings: {
    title: "船具ケース",
    steps: [
      "蓋を引いても、留め爪が動かない。",
      "三つの環それぞれに、切れ目がある。",
      "留め爪が通る一本の道を作る。",
      "三つの切れ目を上にそろえ、上側の留め爪を引く。開いたら中の補修具を取る。",
    ],
  },
  survey: {
    title: "見通し標",
    steps: [
      "岸の目印が、地図上のどこにあるか確かめたい。",
      "窓の位置を変えると、近くの標と遠くの標のずれ方が違う。",
      "二本杭と三角の標、輪の標と石の門。それぞれが重なる位置を探す。",
      "窓の中央で二組がそろう。図の二本杭→三角、輪→石の門を順に選ぶと、二本の線が左上の船着き場で交わる。そこが出発地点。",
    ],
  },
  trace: {
    title: "木型のくぼみ",
    steps: [
      "船の下側の形を、持ち歩いて比べたい。",
      "船台のくぼみは、船底に沿って作られている。",
      "白墨で輪郭を写し取れる。",
      "岸に置かれた予備の船台で白墨を使う。写しを浮かんだ船に重ね、水線と船底の間を棒に移す。",
    ],
  },
};
// Hints follow the next unfinished task, never the currently enlarged photograph.
// Each id describes a progress state so disclosure restarts when the task changes.
const stage = (id: string, title: string, ...steps: string[]): Hint => ({
  id,
  title,
  steps,
});
const puzzle = (detail: Detail): Hint => ({ ...hints[detail]!, id: detail });

export function hintFor(g: Game): Hint {
  if (g.ended)
    return stage(
      "ended",
      "沖の灯へ",
      "船は沖の灯まで辿り着いた。",
      "今回の脱出は完了している。",
    );
  if (g.atSea)
    return stage(
      "voyage-return",
      "航路を見直す",
      g.voyageFailure === "beam"
        ? "岬と松の小島の間に梁があった。"
        : "船底が浅瀬に触れた。",
      "船着き場へ戻ると、引いた航路は残っている。",
      "出発位置と、船底より深い水路を測量図で確かめ直す。",
    );
  if (g.boarded)
    return stage(
      "voyage-plan",
      "船上の測量図",
      "二本杭と輪の標が、船首の先に見える。",
      "見通し線で船着き場を確かめ、水深の断面を拡大して比べる。",
      "割れた岬と松の小島の間には梁がある。沖の灯まで一本の航路を引いて出港する。",
    );
  if (!g.shutterOpen) {
    if (g.shutter.every(Boolean))
      return stage(
        "shutter-open",
        "留め金を外した戸",
        "三本の留め金は外れている。",
        "戸の右側を押すと、渡り板へ出られる。",
      );
    return puzzle("shutter");
  }
  if (g.items.pliers === "tray" || g.items.keyJig === "tray") {
    if (!g.trayOpen) {
      if (g.tray[0] === 4)
        return stage(
          "tray-open",
          "右端に届いた受け台",
          "受け台は取り出し口まで届いている。",
          "工具箱の右側を引き、受け台を開く。",
        );
      return puzzle("tray");
    }
    const remaining = [
      g.items.pliers === "tray" ? "細口のペンチ" : "",
      g.items.keyJig === "tray" ? "小さな保持具" : "",
    ]
      .filter(Boolean)
      .join("と");
    return stage(
      "tray-take-" + remaining,
      "開いた工具箱",
      "受け台はもう引き出せている。",
      `整備工房の工具箱に、${remaining}が残っている。`,
      "箱を拡大して、残った道具を手に取る。",
    );
  }
  if (!g.keyTurn) {
    if (!g.keyExtracted)
      return stage(
        "key-extract",
        "錠に残った先端",
        "事務室の引き出しの錠を調べたい。",
        "折れた鍵の先端が、鍵穴に残っている。",
        "細口のペンチを選んで、鍵穴から先端を抜く。",
      );
    if (g.items.key === "inventory")
      return stage(
        "key-use",
        "支えた鍵を使う",
        "鍵は回せる形に戻っている。",
        "事務室の机の鍵穴を拡大する。",
        "保持具で支えた鍵を選び、錠に使う。",
      );
    if (g.items.keyBow === "desk")
      return stage(
        "key-bow",
        "鍵のもう半分",
        "抜いた先端だけでは、錠を回せない。",
        "事務室の机の上に、折れた鍵の柄がある。",
        "柄を手に取り、持ち物で先端と組み合わせる。保持具が軸を支える。",
      );
    return stage(
      "key-combine",
      "鍵の軸を支える",
      "鍵の柄と先端、保持具が揃っている。",
      "持ち物で折れた鍵の柄と先端を組み合わせる。",
      "できた鍵を、事務室の机の錠に使う。",
    );
  }
  if (g.items.crank === "drawer" || g.items.hookTip === "drawer") {
    const remaining = [
      g.items.crank === "drawer" ? "クランク" : "",
      g.items.hookTip === "drawer" ? "鉤の先端" : "",
    ]
      .filter(Boolean)
      .join("と");
    return stage(
      "drawer-" + g.drawerOpen + remaining,
      "引き出しの道具",
      g.drawerOpen
        ? "引き出しは開いている。"
        : "錠は外れている。引き出しを開けられる。",
      `中に残っている${remaining}を手に取る。`,
      "引き出しを拡大すると、道具を一つずつ選べる。",
    );
  }
  if (!g.beltTested) {
    if (g.items.belt === "bench")
      return stage(
        "belt-take",
        "外れた駆動ベルト",
        "ポンプに回転を伝える部品が足りない。",
        "整備工房の作業台に輪状のベルトがある。",
        "ベルトを取り、ポンプ室の駆動部を調べる。",
      );
    if (g.beltRoute.length === 5)
      return stage(
        "belt-test",
        "掛けたベルトを確かめる",
        "ベルトは一周掛けられている。",
        "駆動軸を回して、引っ掛からずに回るか確かめる。",
        "擦れたりたるんだりするなら掛け直す。左下→左上→右上→右下→左下と外周を一周する。",
      );
    return stage(
      "belt-route",
      "駆動部",
      "ポンプの四つの滑車に回転を伝えたい。",
      "ベルトを選び、滑車の外側を交差しない輪にする。",
      "途中の掛け方が違う場合は掛け直す。左下→左上→右上→右下→左下の順に掛け、駆動軸を回して確かめる。",
    );
  }
  if (!g.strainerClear) {
    if (g.items.hook === "inventory")
      return stage(
        "strainer-use",
        "吸込み口の詰まり",
        "奥へ届く長柄の鉤はできている。",
        "ポンプ室の吸込み口を拡大する。",
        "鉤を選び、格子の奥に絡まった布を引き抜く。",
      );
    if (g.items.rod === "bench")
      return stage(
        "rod-take",
        "奥へ届く道具",
        "鉤の先端だけでは、吸込み口の奥に届かない。",
        "整備工房の作業台の右に、長い棒がある。",
        "棒を取り、持ち物で鉤の先端と組み合わせる。",
      );
    return stage(
      "hook-combine",
      "長い柄を付ける",
      "棒と鉤の先端が揃っている。",
      "持ち物で二つを組み合わせる。",
      "長柄の鉤をポンプ室の吸込み口に使う。",
    );
  }
  const lowWork =
    !freePontoon(g) ||
    !soundPontoon(g) ||
    !g.caseOpen ||
    g.items.boatKit === "case" ||
    !g.boatInside ||
    !g.boatOutside ||
    !g.records["fallen-beam"];
  if (lowWork && g.water !== 0) {
    if (g.gateOpen)
      return stage(
        "gate-close",
        "排水の前に",
        "低い待合室の床下に、まだ調べるものがある。",
        "海とつながったままでは、水を抜けない。",
        "船溜まりの水門を閉じてから、ポンプ室へ戻る。",
      );
    return puzzle("pipes");
  }
  if (!freePontoon(g)) {
    const i = g.pins.findIndex(Boolean);
    if (i < 0)
      return stage(
        "supports-lower",
        "荷重を支えるねじ",
        "固定ピンは両方とも抜けている。",
        "支持ねじが上がっていると、浮体はまだ自由に動けない。",
        "待合室の床下でクランクを使い、上がった支持ねじを両側とも戻す。",
      );
    const side = i === 0 ? "左" : "右";
    return stage(
      "supports-" + i + "-" + g.support[i],
      `${side}の固定具`,
      `${side}の固定ピンが残っている。`,
      g.support[i] === 2
        ? "ねじで荷重を受けているので、ピンを抜ける。"
        : "ピンを引く前に、横にある支持ねじで荷重を受ける。",
      g.support[i] === 2
        ? `${side}の水平なピンを引き、クランクで支持ねじを戻す。`
        : `クランクを選び、${side}の四角い軸穴を回してからピンを引く。`,
    );
  }
  if (!soundPontoon(g)) {
    if (!g.patchMounted) {
      if (g.items.patch === "rack")
        return stage(
          "patch-take",
          "割れ目に合う板",
          "浮体の割れ目を塞ぐものが必要だ。",
          "整備工房で入口側を向くと、棚に補修板がある。",
          "棚を拡大して板を取り、低水位の待合室の床下へ持っていく。",
        );
      return puzzle("patch");
    }
    if (!g.patchBolts.every(Boolean))
      return stage(
        "patch-bolts",
        "補修板の固定",
        "補修板は取り付けられている。",
        "まだ緩いボルトが残っている。",
        "ペンチを選び、締まっていないボルトだけを締める。",
      );
    return stage(
      "tank-drain",
      "浮体に残った水",
      "補修板の四本のボルトは締まっている。",
      "割れ目を塞いでも、中の水は残っている。",
      "補修部の右下にある排水コックを開く。",
    );
  }
  if (!g.caseOpen) return puzzle("rings");
  if (g.items.boatKit === "case")
    return stage(
      "case-take",
      "開いた船具ケース",
      "ケースの留め爪は外れている。",
      "中に船の補修具が残っている。",
      "待合室の床下のケースを拡大し、補修具を手に取る。",
    );
  if (!g.boatInside || !g.boatOutside) {
    const side = g.boatInside
      ? "外側"
      : g.boatOutside
        ? "内側"
        : "内側と外側の両方";
    return stage(
      "boat-repair-" + g.boatInside + g.boatOutside,
      "船底の傷",
      `船底は、${side}の補修が残っている。`,
      "低水位の船溜まりで船を調べる。",
      `船の補修具を選び、${side}の傷に当てる。`,
    );
  }
  if (!g.boatDry)
    return stage(
      "boat-bail",
      "船内に残った水",
      "船底の内側と外側は塞がっている。",
      "修理前に入った水を、船内から出したい。",
      "船を調べて、水を汲み出す。",
    );
  if (!g.records["fallen-beam"])
    return stage(
      "beam-observe",
      "低い通路の先",
      "水を戻す前に、低い通路から見える水路を確かめたい。",
      "待合室の床下の奥にある格子の外を見る。",
      "水路を塞ぐ梁の位置は、自動で記録帳に残る。",
    );
  if (!paperComplete(g) && !g.records.diagram) return puzzle("diagram");
  if (!g.tracing) {
    if (g.items.chalk === "desk")
      return stage(
        "chalk-take",
        "輪郭を写す道具",
        "船台に残る船底の形を持ち歩きたい。",
        "事務室の机に白墨がある。",
        "白墨を取り、船溜まりの予備の船台へ向かう。",
      );
    return puzzle("trace");
  }
  if (!raised(g))
    return stage(
      "fill",
      "待合室を浮かべる",
      "固定具と浮体の補修は済んでいる。",
      "部屋を持ち上げる力は、水から得られる。",
      "ポンプ室で中央の注水弁を開き、留め位置をⅢにして押釦を押す。待合室へ戻り、上の通路へ進む。",
    );
  if (!g.lampMounted) {
    if (g.items.lens === "shelf")
      return stage(
        "lens-take",
        "観測室にあるガラス",
        "待合室から上の観測室へ渡れる高さになっている。",
        "観測室の棚にあるガラスを調べる。",
        "ガラスを取り、船溜まりの船灯に取り付ける。",
      );
    return stage(
      "lens-mount",
      "船灯の前面",
      "船灯に合うガラスを持っている。",
      "船溜まりで船灯を調べる。",
      "ガラスを選び、欠けている前面に取り付ける。",
    );
  }
  if (!g.lensClean)
    return stage(
      "lens-clean",
      "曇った船灯",
      "ガラスは取り付けられているが、曇っている。",
      "船灯を拡大して、前面のガラスを選ぶ。",
      "曇りを拭いてから、つまみを回す。",
    );
  if (!g.lampLit)
    return stage(
      "lamp-light",
      "船灯を点ける",
      "船灯のガラスはきれいになっている。",
      "船灯のつまみを回して点灯する。",
    );
  if (g.records.bearings?.view !== 2) return puzzle("survey");
  const marks = g.records.chart?.chartMarks ?? g.chartMarks;
  const lines = [
    marks.slice(0, 2).sort().join(""),
    marks.slice(2, 4).sort().join(""),
  ]
    .sort()
    .join(",");
  if (lines !== "AE,BD")
    return stage(
      "chart-lines",
      "出発地点を確かめる",
      "観測窓で重なる二組の標を、測量図に移したい。",
      "観測室の図で、同じ見通し線の二つの標を順に選ぶ。",
      "二本杭と三角、輪と石の門の二組を結ぶ。線の交点が今いる船着き場になる。",
    );
  if (g.rodMark !== 0 || g.waterMark !== 50 || !g.records.waterline) {
    if (g.items.hook === "inventory")
      return stage(
        "hook-separate",
        "測るための棒",
        "船底から水面までの距離を測りたい。",
        "長柄の鉤は、持ち物で分離すると棒に戻る。",
        "棒に戻して、浮いた船を調べる。",
      );
    return stage(
      "draft",
      "船底の深さ",
      "船台で写した形を、浮かんだ船に重ねる。",
      "船を調べて写しを重ね、棒を選んで船べりに添える。",
      "白い印を船底、青い印を水線へ合わせる。船底は0、水線は50目盛。50cmより深い水路を選ぶ。",
    );
  }
  if (!g.gateOpen)
    return stage(
      "gate-open",
      "水門の閂",
      "内外の水位は揃っている。",
      "船溜まりの水門を調べる。",
      "閂を引けば、海へ出る口が開く。",
    );
  return stage(
    "depart",
    "出航の準備ができた",
    "船の補修、船灯、水門の準備は済んでいる。",
    "記録帳の測量図で、深さと梁の位置を確かめる。",
    "船に乗り、景色と測量図を照合して沖の灯まで航路を引く。",
  );
}
