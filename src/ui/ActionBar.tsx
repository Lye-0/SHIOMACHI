import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

const ActionHost = createContext<HTMLElement | null>(null);
export const StageWidth = createContext(1280);

/** Keep navigation discoverable, outside the photograph and its hit targets. */
export function ActionBar({ children }: { children: ReactNode }) {
  const frame = useRef<HTMLDivElement>(null);
  const [host, setHost] = useState<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(1280);
  useEffect(() => {
    const stage = frame.current?.querySelector(".stage");
    if (!stage) return;
    const observer = new ResizeObserver((entries) =>
      setWidth(entries[0].contentRect.width),
    );
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);
  return (
    <StageWidth.Provider value={width}>
      <ActionHost.Provider value={host}>
        <div className="scene-frame" ref={frame}>
          {children}
        </div>
        <nav className="action-bar" aria-label="場面の操作">
          <span className="action-bar-label">移動・操作</span>
          <div className="action-bar-buttons" ref={setHost} />
        </nav>
      </ActionHost.Provider>
    </StageWidth.Provider>
  );
}

export function SceneAction({
  className: _className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  const host = useContext(ActionHost);
  return host
    ? createPortal(<button {...props} className="scene-action" />, host)
    : null;
}

export function HideSceneActions({ children }: { children: ReactNode }) {
  return <ActionHost.Provider value={null}>{children}</ActionHost.Provider>;
}
