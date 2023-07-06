import * as React from "react";
import { Provider as StoreProvider } from "react-redux";

import { autoBind, type ComEventData } from "../../utils/com";
import store, {
  webviewStateToAppState,
  messageHandlers,
  type WebviewAppState,
} from "../store";
import vscode from "../vscode";

import { Provider as ComProvider } from "../ComContext";

const Providers = ({
  children,
  name,
}: React.PropsWithChildren<{ name: string }>) => {
  const { post, listener } = React.useMemo(
    () =>
      autoBind(
        {
          postMessage: (data: ComEventData) => {
            vscode.postMessage(data);
          },
        },
        name,
        messageHandlers
      ),
    []
  );

  React.useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      vscode.setState(
        webviewStateToAppState(store.getState() as WebviewAppState)
      );
    });
    return unsubscribe;
  });

  React.useEffect(() => {
    window.addEventListener("message", listener);
    return () => {
      window.removeEventListener("message", listener);
    };
  });

  return (
    <ComProvider post={post}>
      <StoreProvider store={store}>{children}</StoreProvider>
    </ComProvider>
  );
};

export default Providers;
