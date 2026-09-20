import { useCallback, useEffect, useRef, useState } from "react";
import { act, parseSave } from "../game/engine";
import {
  newGame,
  raised,
  roomNames,
  itemNames,
  SAVE_KEY as BASE_SAVE_KEY,
  type Action,
  type Game,
  type Item,
} from "../game/model";
import { Soundscape } from "../game/audio";
import { itemImage, scene } from "../content/assets";
import { Icon, Photo, ItemArt } from "./Primitives";
import { Scene } from "./Scene";
import { Details } from "./Details";
import { Notebook } from "./Notebook";
import { AreaMap } from "./AreaMap";
import { HintPanel } from "./HintPanel";

const SAVE_KEY =
  import.meta.env.DEV &&
  new URLSearchParams(location.search).get("lab") === "rise"
    ? `${BASE_SAVE_KEY}.lab`
    : BASE_SAVE_KEY;
const overview = (g: Game) =>
  g.water === 0
    ? "concourse-low"
    : raised(g)
      ? "concourse-high"
      : g.water === 2
        ? "concourse-high-held"
        : "concourse-mid";

function initialGame() {
  if (
    import.meta.env.DEV &&
    new URLSearchParams(location.search).get("lab") === "rise"
  ) {
    const g = newGame();
    g.started = true;
    g.shutterOpen = true;
    g.room = "pump";
    g.beltTested = true;
    g.strainerClear = true;
    g.items.crank = "inventory";
    g.patchMounted = true;
    g.patchBolts = [true, true, true, true];
    g.tankDry = true;
    return g;
  }
  try {
    return parseSave(localStorage.getItem(SAVE_KEY)) ?? newGame();
  } catch {
    return newGame();
  }
}
export function App() {
  const [g, setGame] = useState(initialGame),
    [selected, setSelected] = useState<Item>(),
    [panel, setPanel] = useState<
      "menu" | "book" | "map" | "item" | "hint" | null
    >(null);
  const [inspected, setInspected] = useState<Item>(),
    [outlines, setOutlines] = useState(false),
    [sound, setSound] = useState(false),
    [toast, setToast] = useState(""),
    [transition, setTransition] = useState<{
      kind: string;
      from: string;
      to: string;
    }>();
  const [home, setHome] = useState(true),
    [confirmReset, setConfirmReset] = useState(false),
    [saveError, setSaveError] = useState(false);
  const [importError, setImportError] = useState("");
  const state = useRef(g),
    audio = useRef<Soundscape | null>(null),
    toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined),
    transitionTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
      undefined,
    );
  const isLab =
    import.meta.env.DEV &&
    new URLSearchParams(location.search).get("lab") === "rise";
  useEffect(() => {
    if (!panel) return;
    const previous =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
    const focusable = () =>
      Array.from(
        dialog?.querySelectorAll<HTMLElement>(
          'button:not(:disabled),input:not(:disabled),select:not(:disabled),[tabindex="0"]',
        ) ?? [],
      ).filter((el) => el.getClientRects().length > 0);
    focusable()[0]?.focus();
    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const entries = focusable(),
        first = entries[0],
        last = entries.at(-1);
      if (!first) {
        e.preventDefault();
        return;
      }
      if (
        e.shiftKey &&
        (document.activeElement === first ||
          !dialog?.contains(document.activeElement))
      ) {
        e.preventDefault();
        last?.focus();
      } else if (
        !e.shiftKey &&
        (document.activeElement === last ||
          !dialog?.contains(document.activeElement))
      ) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", trap);
    return () => {
      document.removeEventListener("keydown", trap);
      previous?.focus();
    };
  }, [panel]);
  const send = useCallback((a: Action) => {
    const previous = state.current;
    const r = act(previous, a);
    state.current = r.game;
    if (a.type !== "tick") setGame(r.game);
    if (["visit", "face", "back"].includes(a.type)) setSelected(undefined);
    if (r.message) {
      setToast(r.message);
      clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToast(""), 3800);
    } else if (a.type !== "tick" && r.game !== previous) {
      clearTimeout(toastTimer.current);
      setToast("");
    }
    if (r.sound) audio.current?.play(r.sound);
    if (r.transition) {
      setTransition({
        kind: r.transition,
        from: overview(previous),
        to: overview(r.game),
      });
      clearTimeout(transitionTimer.current);
      transitionTimer.current = setTimeout(
        () => setTransition(undefined),
        3200,
      );
    }
    if (a.type !== "tick") {
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(r.game));
        setSaveError(false);
      } catch {
        setSaveError(true);
      }
    }
  }, []);
  useEffect(() => {
    audio.current = new Soundscape();
    return () => {
      audio.current?.setEnabled(false);
      clearTimeout(toastTimer.current);
      clearTimeout(transitionTimer.current);
    };
  }, []);
  useEffect(() => {
    audio.current?.setEnabled(sound && !home);
  }, [sound, home]);
  useEffect(() => {
    if (selected && g.items[selected] !== "inventory") setSelected(undefined);
    if (panel === "item" && inspected && g.items[inspected] !== "inventory")
      setPanel(null);
  }, [g.items, selected, panel, inspected]);
  useEffect(() => {
    if (home) return;
    const timer = setInterval(() => {
      if (!document.hidden) send({ type: "tick", seconds: 1 });
    }, 1000);
    return () => clearInterval(timer);
  }, [home, send]);
  useEffect(() => {
    const save = () => {
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(state.current));
      } catch {}
    };
    window.addEventListener("pagehide", save);
    return () => window.removeEventListener("pagehide", save);
  }, []);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (
        e.key !== "Escape" &&
        (e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLSelectElement)
      )
        return;
      if (e.key === "Escape") {
        setSelected(undefined);
        if (panel) setPanel(null);
        else if (g.detail) send({ type: "back" });
        else setPanel("menu");
      }
      if (
        !home &&
        !panel &&
        !g.detail &&
        !g.atSea &&
        (e.key === "ArrowLeft" || e.key === "ArrowRight")
      )
        send({ type: "face" });
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [home, panel, g.detail, g.atSea, send]);
  const begin = () => {
    send({ type: "start" });
    setHome(false);
  };
  const restart = () => {
    const next = newGame();
    next.started = true;
    state.current = next;
    setGame(next);
    setSelected(undefined);
    setConfirmReset(false);
    setPanel(null);
    setHome(false);
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(next));
    } catch {
      setSaveError(true);
    }
  };
  const exportSave = () => {
    const blob = new Blob([JSON.stringify(state.current, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "shiomachi-save.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  const inventory = (Object.keys(g.items) as Item[]).filter(
    (i) => g.items[i] === "inventory",
  );
  return (
    <main className={`app ${outlines ? "show-targets" : ""}`}>
      {home ? (
        <section className="title-screen">
          <Photo src={scene("concourse-mid")} />
          <div className="title-shade" />
          <div className="title-copy">
            <span className="eyebrow">A QUIET ESCAPE</span>
            <h1>潮待ち</h1>
            <span className="roman-title">S H I O M A C H I</span>
            <p>波の音だけが、先に帰っていった。</p>
            <button className="begin" onClick={begin}>
              {g.started ? "つづきから" : "はじめる"}
              <Icon name="right" />
            </button>
            {g.started && (
              <button
                className="text-button muted"
                onClick={() => {
                  setPanel("menu");
                  setConfirmReset(true);
                }}
              >
                はじめから
              </button>
            )}
          </div>
          <span className="title-note">手に取る。見つめる。つなげる。</span>
        </section>
      ) : (
        <>
          <section className="stage" aria-label={roomNames[g.room]}>
            {g.detail ? (
              <Details game={g} send={send} selected={selected} />
            ) : (
              <Scene game={g} send={send} selected={selected} />
            )}
            <header className="hud">
              <div className="hud-actions">
                <button
                  className="icon-button"
                  aria-label="メニュー"
                  onClick={() => setPanel("menu")}
                >
                  <Icon name="menu" />
                </button>
                <button
                  className="icon-button targets-toggle"
                  aria-label="操作する場所を表示"
                  aria-pressed={outlines}
                  title={
                    outlines
                      ? "操作する場所を非表示にする"
                      : "操作する場所を表示"
                  }
                  onClick={() => setOutlines((value) => !value)}
                >
                  <Icon name="eye" />
                </button>
              </div>
              <span className="room-name">{roomNames[g.room]}</span>
              <div className="hud-actions">
                <button
                  className="icon-button"
                  aria-label="マップ"
                  title="マップ"
                  onClick={() => setPanel("map")}
                >
                  <Icon name="map" />
                </button>
                <button
                  className="icon-button"
                  aria-label="記録帳"
                  onClick={() => setPanel("book")}
                >
                  <Icon name="book" />
                </button>
              </div>
            </header>
            {!g.detail && !g.atSea && (
              <>
                <button
                  className="nav left"
                  aria-label="左を見る"
                  onClick={() => send({ type: "face" })}
                >
                  <Icon name="left" />
                </button>
                <button
                  className="nav right"
                  aria-label="右を見る"
                  onClick={() => send({ type: "face" })}
                >
                  <Icon name="right" />
                </button>
              </>
            )}
            {g.detail && (
              <button
                className="nav back"
                aria-label="部屋へ戻る"
                onClick={() => send({ type: "back" })}
              >
                <Icon name="back" />
              </button>
            )}
            {toast && (
              <p role="status" className="toast">
                {toast}
              </p>
            )}
            {transition && (
              <div className={`scene-transition ${transition.kind}`}>
                <Photo src={scene(transition.from)} />
                <Photo src={scene(transition.to)} className="after" />
                <button
                  className="transition-skip"
                  aria-label="場面の変化を閉じる"
                  onClick={() => setTransition(undefined)}
                >
                  ›
                </button>
              </div>
            )}
            {isLab && (
              <nav className="lab">
                <span>検証用</span>
                <button onClick={() => send({ type: "visit", room: "pump" })}>
                  ポンプ
                </button>
                <button
                  onClick={() => send({ type: "visit", room: "concourse" })}
                >
                  桟橋
                </button>
                <button
                  onClick={() => {
                    send({ type: "visit", room: "service" });
                    send({ type: "inspect", detail: "supports" });
                  }}
                >
                  支持具
                </button>
              </nav>
            )}
          </section>
          <footer className="inventory" aria-label="持ち物">
            <span className="inventory-line" />
            {inventory.length === 0 && (
              <span className="empty-hand">持ち物</span>
            )}
            <div className="inventory-items">
              {inventory.map((item) => (
                <div className="inventory-slot" key={item}>
                  <button
                    className={`item-button ${selected === item ? "selected" : ""}`}
                    title={itemNames[item]}
                    aria-label={`${itemNames[item]}を選ぶ`}
                    aria-pressed={selected === item}
                    onClick={() =>
                      setSelected(selected === item ? undefined : item)
                    }
                    onDoubleClick={() => {
                      setInspected(item);
                      setPanel("item");
                    }}
                  >
                    <ItemArt item={item} game={g} />
                  </button>
                  <button
                    className="inspect-item"
                    aria-label={`${itemNames[item]}を詳しく見る`}
                    onClick={() => {
                      setInspected(item);
                      setPanel("item");
                    }}
                  >
                    ＋
                  </button>
                </div>
              ))}
            </div>
            {selected && (
              <button
                className="selected-label"
                onClick={() => setSelected(undefined)}
              >
                {itemNames[selected]}
                <span>×</span>
              </button>
            )}
          </footer>
        </>
      )}
      {panel && (
        <div className="scrim" onClick={() => setPanel(null)}>
          <section
            className={`dialog ${panel === "book" ? "book-dialog" : panel === "map" ? "map-dialog" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-label={
              panel === "menu"
                ? "メニュー"
                : panel === "map"
                  ? "マップ"
                  : panel === "book"
                    ? "記録帳"
                    : panel === "item"
                      ? "持ち物を調べる"
                      : "手がかり"
            }
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="icon-button dialog-close"
              aria-label="閉じる"
              onClick={() => setPanel(null)}
            >
              <Icon name="close" />
            </button>
            {panel === "menu" && (
              <>
                <span className="eyebrow">SHIOMACHI</span>
                <h2>潮待ち</h2>
                <label className="setting">
                  音
                  <input
                    type="checkbox"
                    checked={sound}
                    onChange={(e) => setSound(e.target.checked)}
                  />
                </label>
                <button className="menu-row" onClick={() => setPanel("hint")}>
                  手がかり
                </button>
                <button className="menu-row" onClick={exportSave}>
                  記録を書き出す
                </button>
                <label className="menu-row import-label">
                  記録を読み込む
                  <input
                    type="file"
                    accept="application/json,.json"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      e.target.value = "";
                      setImportError("");
                      if (f.size > 2 * 1024 * 1024) {
                        setImportError("記録ファイルが大きすぎます。");
                        return;
                      }
                      let loaded: Game | null;
                      try {
                        loaded = parseSave(await f.text());
                      } catch {
                        setImportError("ファイルを読み込めませんでした。");
                        return;
                      }
                      if (loaded) {
                        state.current = loaded;
                        setGame(loaded);
                        setPanel(null);
                        setHome(false);
                        setSelected(undefined);
                        try {
                          localStorage.setItem(
                            SAVE_KEY,
                            JSON.stringify(loaded),
                          );
                        } catch {
                          setSaveError(true);
                        }
                      } else
                        setImportError(
                          "このファイルから記録を読み込めませんでした。",
                        );
                    }}
                  />
                </label>
                {importError && <p role="alert">{importError}</p>}
                <button
                  className="menu-row"
                  onClick={() => setConfirmReset(!confirmReset)}
                >
                  はじめから
                </button>
                {confirmReset && (
                  <div className="reset-confirm">
                    <p>現在の記録を消して、はじめから遊びます。</p>
                    <button onClick={restart}>記録を消してはじめる</button>
                    <button onClick={() => setConfirmReset(false)}>戻る</button>
                  </div>
                )}
                <p className="fine-print">
                  進行は、このブラウザに自動で記録されます。
                </p>
                {saveError && (
                  <p role="alert">
                    保存できませんでした。記録を書き出してください。
                  </p>
                )}
              </>
            )}
            {panel === "book" && <Notebook game={g} />}
            {panel === "map" && <AreaMap game={g} />}
            {panel === "item" && inspected && (
              <>
                <h2>{itemNames[inspected]}</h2>
                <ItemArt className="item-large" item={inspected} game={g} />
                {inspected === "hook" && (
                  <button
                    className="menu-row"
                    onClick={() => {
                      send({ type: "separate", item: "hook" });
                      setPanel(null);
                    }}
                  >
                    鉤を外す
                  </button>
                )}
                {inspected === "lens" && !g.lensClean && (
                  <button
                    className="menu-row"
                    onClick={() => send({ type: "cleanLens" })}
                  >
                    ガラスを拭く
                  </button>
                )}
                <div className="combine-items">
                  {inventory
                    .filter((i) => i !== inspected)
                    .map((i) => (
                      <button
                        title={`${itemNames[i]}と合わせる`}
                        aria-label={`${itemNames[i]}と合わせる`}
                        key={i}
                        onClick={() =>
                          send({ type: "combine", a: inspected, b: i })
                        }
                      >
                        <ItemArt item={i} game={g} />
                      </button>
                    ))}
                </div>
              </>
            )}
            {panel === "hint" && <HintPanel game={g} />}
          </section>
        </div>
      )}
    </main>
  );
}
