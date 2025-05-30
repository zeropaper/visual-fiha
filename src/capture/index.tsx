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

const root = createRoot(document.getElementById("capture-view")!);
