import * as React from 'react';
import { ChannelPost } from '../utils/com';

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
  <ComContext.Provider value={{ post }}>
    {children}
  </ComContext.Provider>
);

export const useComContext = () => React.useContext(ComContext);

export const useComPost = () => {
  const { post } = useComContext();
  return post;
};

export const useVSCOpen = () => {
  const { post } = useComContext();
  return (relativePath: string) => post('open', relativePath);
};
