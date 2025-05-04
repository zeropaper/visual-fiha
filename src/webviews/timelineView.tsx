import * as React from "react";
import { createRoot } from "react-dom/client";
import Providers from "./components/Providers";

const root = createRoot(document.getElementById("timeline-view")!);
root.render(
  <Providers name="timelineView">
    <div>Timeline</div>
  </Providers>,
);
