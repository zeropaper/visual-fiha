import * as React from "react";
import { createRoot } from "react-dom/client";
import ControlDisplay from "./components/ControlDisplay";
import Providers from "./components/Providers";

const root = createRoot(document.getElementById("control-view")!);
root.render(
  <Providers name="controlView">
    <ControlDisplay />
  </Providers>,
);
