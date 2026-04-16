import React from "react";
import ReactDOM from "react-dom/client";
import App from "./ControlsApp";

console.log("[main.tsx] Starting React app initialization");

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

console.log("[main.tsx] React app mounted to DOM");
