import * as React from "react";
import { createRoot } from "react-dom/client";
import Audio from "./components/Audio";
import Providers from "./components/Providers";

const root = createRoot(document.getElementById("audio-view")!);
root.render(
  <Providers withData name="audioView">
    <Audio />
  </Providers>,
);
