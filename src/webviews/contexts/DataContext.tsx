import * as React from "react";
import type { ReadFunction } from "../../types";

type DataRef = React.MutableRefObject<Record<string, any>>;

export interface DataContextData {
  ref?: DataRef;
}

const DataContext = React.createContext<DataContextData>({});

export const { Consumer } = DataContext;

export function useRead() {
  const ctx = React.useContext(DataContext);
  const read: ReadFunction = (key, defaultValue) => {
    if (ctx.ref?.current?.[key] === undefined) {
      return defaultValue;
    }
    return ctx.ref?.current?.[key];
  };
  return read;
}

export const Provider = ({
  children,
  dataRef,
}: React.PropsWithChildren<{
  dataRef: DataRef;
}>) => {
  const value = React.useMemo<DataContextData>(
    () => ({ ref: dataRef }),
    [dataRef],
  );
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
