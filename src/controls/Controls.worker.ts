/// <reference lib="webworker" />

// NOTE: path aliases like `@utils/tsTranspile.worker.ts` are not supported in workers.

import { autoBind } from "../utils/com";
import { tsTranspile } from "../utils/tsTranspile";
import { makeControlsLogic } from "./Controls.logic";

const broadcastChannel = new BroadcastChannel("core");

const { handlers, broadcastHandlers, getState, tick } = makeControlsLogic({
  broadcast: (type, payload) => broadcastChannel.postMessage({ type, payload }),
  post: (type, payload) => mainPost(type, payload),
  tsTranspile,
});

const { listener: mainListener, post: mainPost } = autoBind(
  {
    postMessage: (msg) => self.postMessage(msg),
  },
  "controls-worker",
  handlers,
);

const { listener: bcListener } = autoBind(
  broadcastChannel,
  "controls-worker-bc",
  broadcastHandlers,
);

self.addEventListener("message", mainListener);
broadcastChannel.addEventListener("message", bcListener);

setInterval(() => {
  tick();
  broadcastChannel.postMessage({
    type: "runtimedata",
    payload: getState().runtimeData,
  });
}, 16);
