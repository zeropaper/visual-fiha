// borrowed from https://raw.githubusercontent.com/jherr/fast-react-context/refs/heads/main/fast-context-generic-extended/src/app/createFastContext.tsx

import { autoBind, type ChannelPost } from "@utils/com";
import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useSyncExternalStore,
} from "react";
import type { AppState, DisplayRegistrationPayload } from "src/types";
import ControlsWorker from "../Controls.worker?worker";

declare global {
  interface Window {
    _controlsWorker?: Worker;
  }
}

export default function createFastContext<FastContext extends AppState>(
  initialState: FastContext,
  onUpdate: (value: FastContext) => void = () => {},
) {
  function useFastContextData(): {
    get: () => FastContext;
    set: (value: Partial<FastContext>) => void;
    subscribe: (callback: () => void) => () => void;
    post: ChannelPost | null;
  } {
    const store = useRef(initialState);
    const workerRef = useRef<Worker | null>(null);
    const postRef = useRef<ChannelPost | null>(null);

    const get = useCallback(() => store.current, []);

    const subscribers = useRef(new Set<() => void>());

    // biome-ignore lint/correctness/useExhaustiveDependencies: ignore
    const set = useCallback((value: Partial<FastContext>) => {
      postRef.current?.("updateconfig", value);
      store.current = { ...store.current, ...value };
      subscribers.current.forEach((callback) => {
        callback();
      });
      onUpdate(store.current);
    }, []);

    const subscribe = useCallback((callback: () => void) => {
      subscribers.current.add(callback);
      return () => subscribers.current.delete(callback);
    }, []);

    const post = useCallback<ChannelPost>(
      (type, payload, options) =>
        postRef.current
          ? postRef.current(type, payload, options)
          : Promise.resolve(),
      [],
    );

    // biome-ignore lint/correctness/useExhaustiveDependencies: ignore
    useEffect(() => {
      workerRef.current = workerRef.current || new ControlsWorker();
      const worker = workerRef.current;

      const { listener, post: _post } = autoBind(worker, "controls-app", {
        updateerrors: (payload: any) => {
          if (payload?.length) console.info("[controls] updateerrors", payload);
          store.current.errors = payload;
          subscribers.current.forEach((callback) => {
            callback();
          });
          onUpdate(store.current);
        },
        registerdisplay: (payload: DisplayRegistrationPayload) => {
          console.info("[controls] registerdisplay", payload);
        },
        initialized: (payload: FastContext) => {
          console.log("[controls] initialized");
          store.current = payload;
          subscribers.current.forEach((callback) => {
            callback();
          });
          onUpdate(store.current);
        },
      });
      postRef.current = _post;
      worker.addEventListener("message", listener);
      _post("init", store.current);

      return () => {
        worker.removeEventListener("message", listener);
        worker.terminate();
        workerRef.current = null;
        postRef.current = null;
        subscribers.current.clear();
        store.current = initialState;
        console.info("[controls] worker terminated");
      };
    }, []);

    return {
      get,
      set,
      subscribe,
      post,
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
    const fastContext = useContext(FastContext);
    if (!fastContext) {
      throw new Error("Store not found");
    }

    // Get the whole state and set function once at the top level
    const [state, setPartialContext] = useFastContext((store) => store);

    const result = {} as {
      [P in K]: {
        get: FastContext[P];
        set: (value: FastContext[P]) => void;
        getCurrent: () => FastContext[P];
      };
    };

    fieldNames.forEach((fieldName) => {
      result[fieldName] = {
        get: state[fieldName],
        getCurrent: () => fastContext.get()[fieldName],
        set: (newValue: FastContext[typeof fieldName]) => {
          const partialUpdate: Partial<FastContext> = {};
          partialUpdate[fieldName] = newValue;
          setPartialContext(partialUpdate);
        },
      };
    });

    return result;
  }

  function useContextWorkerPost(): ChannelPost | null {
    const fastContext = useContext(FastContext);
    if (!fastContext) {
      throw new Error("Store not found");
    }
    return fastContext.post;
  }

  return {
    FastContextProvider,
    useFastContextFields,
    useContextWorkerPost,
  };
}
