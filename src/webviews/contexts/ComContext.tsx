import * as React from "react";
import type { ChannelPost } from "../../utils/com";

// A context that can be used to send messages to the VSCode extension.
// See https://code.visualstudio.com/docs/extensionAPI/api-comm-messages
export interface ComContextInterface {
  post: ChannelPost;
}

const ComContext = React.createContext({} as ComContextInterface);

export const { Consumer } = ComContext;

export interface ProviderProps {
  children: React.ReactNode;
  post: ChannelPost;
}

export const Provider = ({ children, post }: ProviderProps) => (
  <ComContext.Provider value={{ post }}>{children}</ComContext.Provider>
);

export const useComContext = () => React.useContext(ComContext);

export const useComPost = () => {
  const { post } = useComContext();
  return post;
};

export const useVSCOpen = () => {
  const { post } = useComContext();
  return async (relativePath: string) => await post("openEditor", relativePath);
};

export const useSetBPM = () => {
  const { post } = useComContext();
  return async (bpm: number) => await post("setBPM", bpm);
};

export const useSetStageSize = () => {
  const { post } = useComContext();
  return async (size: { width: number; height: number }) =>
    await post("setStageSize", size);
};

export const useToggleLayer = () => {
  const { post } = useComContext();
  return async (id: string) => await post("toggleLayer", id);
};

export const useCreateLayer = () => {
  const { post } = useComContext();
  return async (id: string, type: string) =>
    await post("createLayer", { id, type });
};

export const useRemoveLayer = () => {
  const { post } = useComContext();
  return async (id: string) => await post("removeLayer", id);
};
