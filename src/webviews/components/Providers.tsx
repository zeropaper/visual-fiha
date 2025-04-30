import * as React from "react";
import { Provider as StoreProvider } from "react-redux";

import { type ComEventData, autoBind } from "../../utils/com";
import store, { webviewStateToAppState, storeMessageHandlers } from "../store";
import vscode from "../vscode";

import { Provider as ComProvider } from "../contexts/ComContext";
import { Provider as DataProvider } from "../contexts/DataContext";

const Providers = ({
  children,
  name,
  withData = false,
}: React.PropsWithChildren<{ name: string; withData?: boolean }>) => {
  const dataRef = React.useRef<object>({});
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const { post, listener } = React.useMemo(
    () =>
      autoBind(
        {
          postMessage: (data: ComEventData) => {
            vscode.postMessage(data);
          },
        },
        name,
        {
          ...storeMessageHandlers,
          updatedata: (data) => {
            if (!withData) {
              return;
            }
            dataRef.current = data;
          },
        },
      ),
    [],
  );

  React.useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      vscode.setState(webviewStateToAppState(store.getState()));
    });
    return unsubscribe;
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  React.useEffect(() => {
    window.addEventListener("message", listener);
    return () => {
      window.removeEventListener("message", listener);
    };
  }, []);

  return (
    <ComProvider post={post}>
      <StoreProvider store={store}>
        {withData ? (
          <DataProvider dataRef={dataRef}>{children}</DataProvider>
        ) : (
          children
        )}
      </StoreProvider>
    </ComProvider>
  );
};

export default Providers;
