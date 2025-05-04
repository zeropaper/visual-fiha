import * as React from "react";
import { useSelector } from "react-redux";

import type { AppState } from "../../types";

const StoreControl = () => {
  const { layers, worker, displays, server, ...result } = useSelector(
    (appState: AppState) => appState,
  );

  return (
    <>
      <pre>
        <code>{JSON.stringify(result, null, 2)}</code>
      </pre>
    </>
  );
};

export default StoreControl;
