import * as React from "react";
import { createRoot } from "react-dom/client";

import { io } from "socket.io-client";

import { type ComEventData, autoBind } from "../utils/com";
import audioCapture from "./audio";
import midiCapture from "./midi";

const socket = io();

const { post, listener } = autoBind(
  {
    postMessage: (message: ComEventData) => {
      socket.emit("message", message);
    },
  },
  "capture-socket",
  {},
);

socket.on("message", (message: ComEventData) => {
  listener({ data: message });
});

socket.emit("registercapture");

audioCapture(post, socket);
void midiCapture(post, socket);

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(document.getElementById("capture-view")!);
root.render(<div>Tada</div>);
