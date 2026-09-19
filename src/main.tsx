import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./ui/App";
import "./ui/style.css";
import "./ui/puzzles.css";
const root = createRoot(document.getElementById("root")!);
if (
  import.meta.env.DEV &&
  new URLSearchParams(location.search).get("qa") === "visual"
) {
  import("./ui/VisualLab").then(({ VisualLab }) => root.render(<VisualLab />));
} else
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
