import * as React from "react";
import { createRoot } from "react-dom/client";
import { Provider as StoreProvider } from "react-redux";

import { autoBind, type ComEventData } from "../utils/com";
import store, {
  webviewStateToAppState,
  messageHandlers,
  type WebviewAppState,
} from "./store";
import vscode from "./vscode";

import { Provider as ComProvider } from "./ComContext";

import StoreControl from "./components/StoreControl";
import ControlDisplay from "./components/ControlDisplay";
import DisplaysList from "./components/DisplaysList";
import AppInfo from "./components/AppInfo";
import LayersList from "./components/LayersList";
import Audio from "./components/Audio";

const { post, listener } = autoBind(
  {
    postMessage: (data: ComEventData) => {
      vscode.postMessage(data);
    },
  },
  "webview",
  messageHandlers
);

const messageListener = (event: MessageEvent<ComEventData>) => {
  // const { data } = event;
  // console.info('[webview] message event', data);
  listener(event);
};

const WebviewComponent = () => {
  React.useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      // console.info('[webview] store event');
      vscode.setState(
        webviewStateToAppState(store.getState() as WebviewAppState)
      );
    });
    return unsubscribe;
  });

  React.useEffect(() => {
    window.addEventListener("message", messageListener);
    return () => {
      window.removeEventListener("message", messageListener);
    };
  });

  return (
    <ComProvider post={post}>
      <StoreProvider store={store}>
        <>
          <ControlDisplay />
          <div id="controls">
            <AppInfo />
            <Audio />
            <LayersList />
            <DisplaysList />
            <StoreControl />
          </div>
        </>
      </StoreProvider>
    </ComProvider>
  );
};

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(document.getElementById("app")!);
root.render(<WebviewComponent />);
