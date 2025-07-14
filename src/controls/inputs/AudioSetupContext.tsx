// React context that handles audio setup

import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { AudioInputMode } from "../../types";

interface AudioFileInfo {
  url: string;
  name: string;
}

interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  seeking: boolean;
}

interface AudioSetupContextValue {
  mode: AudioInputMode;
  setMode: (mode: AudioInputMode) => void;
  files: Array<AudioFileInfo>;
  setFiles: (files: Array<AudioFileInfo>) => void;
  playbackState: PlaybackState;
  setPlaybackState: (state: Partial<PlaybackState>) => void;
  playAll: () => void;
  pauseAll: () => void;
  stopAll: () => void;
  seekAll: (time: number) => void;
  setAllVolume: (volume: number) => void;
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
  playbackState: {
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    seeking: false,
  },
  setPlaybackState: () => {
    throw new Error("setPlaybackState is not implemented");
  },
  playAll: () => {
    throw new Error("playAll is not implemented");
  },
  pauseAll: () => {
    throw new Error("pauseAll is not implemented");
  },
  stopAll: () => {
    throw new Error("stopAll is not implemented");
  },
  seekAll: () => {
    throw new Error("seekAll is not implemented");
  },
  setAllVolume: () => {
    throw new Error("setAllVolume is not implemented");
  },
});

export function AudioSetupProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<AudioFileInfo[]>([]);
  const [mode, setMode] = useState<AudioInputMode>("files");
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    seeking: false,
  });

  const playAll = useCallback(() => {
    const audioElements = document.querySelectorAll("audio");
    audioElements.forEach((audio) => {
      audio.currentTime = playbackState.currentTime;
      audio.volume = playbackState.volume;
      audio.play();
    });
    setPlaybackState((prev) => ({ ...prev, isPlaying: true }));
  }, [playbackState.currentTime, playbackState.volume]);

  const pauseAll = useCallback(() => {
    const audioElements = document.querySelectorAll("audio");
    audioElements.forEach((audio) => {
      audio.pause();
    });
    setPlaybackState((prev) => ({ ...prev, isPlaying: false }));
  }, []);

  const stopAll = useCallback(() => {
    const audioElements = document.querySelectorAll("audio");
    audioElements.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
    setPlaybackState((prev) => ({ ...prev, isPlaying: false, currentTime: 0 }));
  }, []);

  const seekAll = useCallback((time: number) => {
    setPlaybackState((prev) => ({ ...prev, currentTime: time }));
  }, []);

  const setAllVolume = useCallback((volume: number) => {
    setPlaybackState((prev) => ({ ...prev, volume }));
  }, []);

  const value = useMemo<AudioSetupContextValue>(
    () => ({
      files,
      setFiles,
      mode,
      setMode,
      playbackState,
      setPlaybackState: (state: Partial<PlaybackState>) => {
        setPlaybackState((prev) => ({ ...prev, ...state }));
      },
      playAll,
      pauseAll,
      stopAll,
      seekAll,
      setAllVolume,
    }),
    [
      files,
      mode,
      playbackState,
      playAll,
      pauseAll,
      stopAll,
      seekAll,
      setAllVolume,
    ],
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
