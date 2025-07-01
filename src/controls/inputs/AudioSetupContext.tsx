// React context that handles audio setup

import {
  type ReactNode,
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";
import type { AudioInputMode } from "../../types";

interface AudioFileInfo {
  url: string;
  name: string;
}

interface AudioSetupContextValue {
  mode: AudioInputMode;
  setMode: (mode: AudioInputMode) => void;
  files: Array<AudioFileInfo>;
  setFiles: (files: Array<AudioFileInfo>) => void;
}

const AudioSetupContext = createContext<AudioSetupContextValue>({
  mode: "mic",
  setMode: () => {
    throw new Error("setMode is not implemented");
  },
  files: [],
  setFiles: () => {
    throw new Error("setFiles is not implemented");
  },
});

export function AudioSetupProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<AudioFileInfo[]>([]);
  const [mode, setMode] = useState<AudioInputMode>("mic");
  const value = useMemo<AudioSetupContextValue>(
    () => ({
      files,
      setFiles,
      mode,
      setMode,
    }),
    [files, mode],
  );
  return (
    <AudioSetupContext.Provider value={value}>
      {children}
    </AudioSetupContext.Provider>
  );
}

export function useAudioSetup() {
  const context = useContext(AudioSetupContext);
  if (!context) {
    throw new Error("useAudioSetup must be used within an AudioSetupProvider");
  }
  return context;
}

export default AudioSetupContext;
