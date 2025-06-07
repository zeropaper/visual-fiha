// borrowed from https://raw.githubusercontent.com/jherr/fast-react-context/refs/heads/main/fast-context-generic-extended/src/app/createFastContext.tsx

import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useSyncExternalStore,
} from "react";

export default function createFastContext<FastContext>(
  initialState: FastContext,
) {
  function useFastContextData(): {
    get: () => FastContext;
    set: (value: Partial<FastContext>) => void;
    subscribe: (callback: () => void) => () => void;
  } {
    const store = useRef(initialState);

    const get = useCallback(() => store.current, []);

    const subscribers = useRef(new Set<() => void>());

    const set = useCallback((value: Partial<FastContext>) => {
      store.current = { ...store.current, ...value };
      subscribers.current.forEach((callback) => callback());
    }, []);

    const subscribe = useCallback((callback: () => void) => {
      subscribers.current.add(callback);
      return () => subscribers.current.delete(callback);
    }, []);

    return {
      get,
      set,
      subscribe,
    };
  }

  type UseFastContextDataReturnType = ReturnType<typeof useFastContextData>;

  const FastContext = createContext<UseFastContextDataReturnType | null>(null);

  function FastContextProvider({
    children,
  }: Readonly<{ children: React.ReactNode }>) {
    return (
      <FastContext.Provider value={useFastContextData()}>
        {children}
      </FastContext.Provider>
    );
  }

  function useFastContext<SelectorOutput>(
    selector: (store: FastContext) => SelectorOutput,
  ): [SelectorOutput, (value: Partial<FastContext>) => void] {
    const fastContext = useContext(FastContext);
    if (!fastContext) {
      throw new Error("Store not found");
    }

    const state = useSyncExternalStore(
      fastContext.subscribe,
      () => selector(fastContext.get()),
      () => selector(initialState),
    );

    return [state, fastContext.set];
  }

  function useFastContextFields<K extends keyof FastContext>(fieldNames: K[]) {
    const result = {} as {
      [P in K]: {
        get: FastContext[P];
        set: (value: FastContext[P]) => void;
      };
    };

    fieldNames.forEach((fieldName) => {
      const [getValue, setPartialContext] = useFastContext(
        (store) => store[fieldName],
      );

      result[fieldName] = {
        get: getValue,
        set: (newValue: FastContext[typeof fieldName]) => {
          const partialUpdate: Partial<FastContext> = {};
          partialUpdate[fieldName] = newValue;
          setPartialContext(partialUpdate);
        },
      };
    });

    return result;
  }

  return {
    FastContextProvider,
    useFastContextFields,
  };
}
