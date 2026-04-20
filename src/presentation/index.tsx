import React from "react";
import ReactDOM from "react-dom/client";
import { Presentation as App } from "./presentation";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
