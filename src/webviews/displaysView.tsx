import * as React from "react";
import { createRoot } from "react-dom/client";
import Displays from "./components/DisplaysList";
import Providers from "./components/Providers";

const root = createRoot(document.getElementById("displays-view")!);
root.render(
  <Providers name="displaysView">
    <Displays />
  </Providers>,
);
