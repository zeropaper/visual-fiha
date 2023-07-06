import * as React from "react";
import { createRoot } from "react-dom/client";
import Providers from "./components/Providers";
import Audio from "./components/Audio";

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(document.getElementById("audio-view")!);
root.render(
  <Providers name="audioView">
    <Audio />
  </Providers>
);
