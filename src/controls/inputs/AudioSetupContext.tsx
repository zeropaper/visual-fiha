/**
 * AudioSetupContext is a React context that manages audio input modes,
 * playback state, and audio analyzers for visualizations.
 * It provides methods to play, pause, stop, and seek audio tracks,
 * as well as to manage microphone input.
 *
 */

import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { AudioInputMode } from "../../types";
import { useContextWorkerPost } from "../ControlsContext";
import { loadTrack } from "./syncAudio";

const audioConfig = {
  minDecibels: -120,
  maxDecibels: 80,
  smoothingTimeConstant: 0.85,
  fftSize: 1024,
};

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

interface ManagedAudioElement {
  analyser: AnalyserNode;
  index: number;
}

interface MicrophoneAudio {
  analyser: AnalyserNode;
  stream: MediaStream;
  source: MediaStreamAudioSourceNode;
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
  // New audio management methods
  getAudioAnalyzers: () => ManagedAudioElement[];
  getMicrophoneAnalyser: () => AnalyserNode | null;
  getMicrophoneState: () => AudioContextState;
  audioContext: AudioContext | null;
  // Duration management
  setTimeDurationCallback: (callback: (duration: number) => void) => void;
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
  getAudioAnalyzers: () => {
    throw new Error("getAudioElements is not implemented");
  },
  getMicrophoneAnalyser: () => {
    throw new Error("getMicrophoneAnalyser is not implemented");
  },
  getMicrophoneState: () => {
    throw new Error("getMicrophoneState is not implemented");
  },
  audioContext: null,
  setTimeDurationCallback: () => {
    throw new Error("setTimeDurationCallback is not implemented");
  },
});

export function AudioSetupProvider({
  children,
  defaultAudioFiles = [],
}: {
  children: ReactNode;
  defaultAudioFiles?: string[];
}) {
  const [files, setFiles] = useState<AudioFileInfo[]>(
    defaultAudioFiles.map((url) => ({
      url,
      name: url.split("/").pop() || "unknown",
    })),
  );
  const [mode, setMode] = useState<AudioInputMode>("files");
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    seeking: false,
  });
  const sourcesRef = useRef<AudioBufferSourceNode[]>([]);

  // Central audio management state
  const audioContextRef = useRef<AudioContext | null>(null);
  const managedAnalyzersRef = useRef<
    { analyser: AnalyserNode; index: number }[]
  >([]);
  const microphoneAudioRef = useRef<MicrophoneAudio | null>(null);
  const [microphoneState, setMicrophoneState] =
    useState<AudioContextState>("closed");

  // Duration callback management
  const timeDurationCallbackRef = useRef<((duration: number) => void) | null>(
    null,
  );

  // Initialize audio context when needed
  const getOrCreateAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  }, []);

  // Cleanup audio context and managed elements
  const cleanupAudio = useCallback(() => {
    // Cleanup managed audio elements
    managedAnalyzersRef.current.forEach(({ analyser }) => {
      try {
        analyser.disconnect();
      } catch (err) {
        console.warn("Error cleaning up analyzer:", err);
      }
    });
    managedAnalyzersRef.current = [];

    // Cleanup microphone audio
    if (microphoneAudioRef.current) {
      try {
        microphoneAudioRef.current.source.disconnect();
        microphoneAudioRef.current.analyser.disconnect();
        microphoneAudioRef.current.stream
          .getTracks()
          .forEach((track) => track.stop());
      } catch (err) {
        console.warn("Error cleaning up microphone audio:", err);
      }
      microphoneAudioRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current
        .close()
        .catch((err) => console.warn("Error closing audio context:", err));
      audioContextRef.current = null;
    }

    setMicrophoneState("closed");
  }, []);

  // Setup microphone audio
  const setupMicrophone = useCallback(async () => {
    try {
      cleanupAudio();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true,
      });

      const audioCtx = getOrCreateAudioContext();
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);

      // Configure analyser
      analyser.minDecibels = audioConfig.minDecibels;
      analyser.maxDecibels = audioConfig.maxDecibels;
      analyser.smoothingTimeConstant = audioConfig.smoothingTimeConstant;
      analyser.fftSize = audioConfig.fftSize;

      source.connect(analyser);

      microphoneAudioRef.current = {
        analyser,
        stream,
        source,
      };

      audioCtx.onstatechange = () => {
        setMicrophoneState(audioCtx.state);
        if (audioCtx.state === "closed") {
          audioContextRef.current = null;
          microphoneAudioRef.current = null;
        }
      };

      setMicrophoneState(audioCtx.state);

      // Set duration to 0 for microphone mode (infinite duration)
      timeDurationCallbackRef.current?.(0);
    } catch (error) {
      console.error("Error setting up microphone:", error);
      setMicrophoneState("closed");
    }
  }, [getOrCreateAudioContext, cleanupAudio]);

  // Setup audio files
  const setupAudioFiles = useCallback(
    async (audioFiles: AudioFileInfo[]) => {
      // Clean up existing analyzers
      managedAnalyzersRef.current.forEach(({ analyser }) => {
        try {
          analyser.disconnect();
        } catch (err) {
          console.warn("Error cleaning up analyzer:", err);
        }
      });
      managedAnalyzersRef.current = [];

      if (audioFiles.length === 0) return;

      const audioCtx = getOrCreateAudioContext();

      sourcesRef.current = await Promise.all(
        audioFiles.map(async (fileInfo) => {
          const source = await loadTrack(fileInfo.url, audioCtx);

          // Setup audio analysis
          const analyser = audioCtx.createAnalyser();
          analyser.minDecibels = audioConfig.minDecibels;
          analyser.maxDecibels = audioConfig.maxDecibels;
          analyser.smoothingTimeConstant = audioConfig.smoothingTimeConstant;
          analyser.fftSize = audioConfig.fftSize;

          source.connect(analyser);
          analyser.connect(audioCtx.destination);

          // Ensure 'index' is included when pushing to managedAnalyzersRef
          managedAnalyzersRef.current.push({ analyser, index: 0 });

          return source;
        }),
      );

      // // Start playback with a slight delay for synchronization
      // const startAt = audioCtx.currentTime + 0.15; // 150 ms safety
      // sourcesRef.current.forEach((source) => source.start(startAt));
    },
    [getOrCreateAudioContext],
  );

  // Wrap createAndWireSource in useCallback to stabilize it
  const createAndWireSource = useCallback(
    (
      oldSource: AudioBufferSourceNode,
      analyser: AnalyserNode,
      audioCtx: AudioContext,
      startTime: number,
    ) => {
      const newSource = audioCtx.createBufferSource();
      newSource.buffer = oldSource.buffer;
      newSource.connect(analyser);
      analyser.connect(audioCtx.destination);

      try {
        newSource.start(audioCtx.currentTime + startTime);
      } catch (err) {
        console.warn(err instanceof Error ? err.message : "");
      }

      return newSource;
    },
    [],
  );

  // Update playAll to recreate AudioBufferSourceNode for playback while re-wiring analyzers
  const playAll = useCallback(() => {
    console.log("Playing all audio sources");
    setPlaybackState((prev) => {
      const audioCtx = getOrCreateAudioContext();

      sourcesRef.current = sourcesRef.current.map((oldSource, index) => {
        const analyser = managedAnalyzersRef.current[index].analyser;
        return createAndWireSource(
          oldSource,
          analyser,
          audioCtx,
          prev.currentTime || 0,
        );
      });

      return { ...prev, isPlaying: true };
    });
  }, [getOrCreateAudioContext, createAndWireSource]);

  const pauseAll = useCallback(() => {
    console.log("Pausing all audio sources");
    setPlaybackState((prev) => {
      sourcesRef.current.forEach((source) => {
        if (source.buffer) {
          try {
            source.stop(prev.currentTime);
          } catch (err) {
            console.warn(err instanceof Error ? err.message : "");
          }
        } else {
          console.warn("Source has no buffer to pause");
        }
      });
      return { ...prev, isPlaying: false };
    });
  }, []);

  const stopAll = useCallback(() => {
    console.log("Stopping all audio sources");
    setPlaybackState((prev) => {
      sourcesRef.current.forEach((source) => {
        if (source.buffer) {
          try {
            source.stop();
          } catch (err) {
            console.warn(err instanceof Error ? err.message : "");
          }
        } else {
          console.warn("Source has no buffer to stop");
        }
      });
      return { ...prev, isPlaying: false, currentTime: 0, seeking: false };
    });
  }, []);

  // Re-wire analyzers when seekAll is called
  const seekAll = useCallback(
    (time: number) => {
      console.log("Seeking all audio sources");
      setPlaybackState((prev) => {
        const audioCtx = getOrCreateAudioContext();

        sourcesRef.current = sourcesRef.current.map((oldSource, index) => {
          const analyser = managedAnalyzersRef.current[index].analyser;
          return createAndWireSource(oldSource, analyser, audioCtx, time);
        });

        return {
          ...prev,
          currentTime: time,
          seeking: false,
        };
      });
    },
    [getOrCreateAudioContext, createAndWireSource],
  );

  const setAllVolume = useCallback((volume: number) => {
    setPlaybackState((prev) => ({ ...prev, volume }));
  }, []);

  // New methods for providing audio resources to components
  const getAudioAnalyzers = useCallback(() => {
    return [...managedAnalyzersRef.current];
  }, []);

  const getMicrophoneAnalyser = useCallback(() => {
    return microphoneAudioRef.current?.analyser || null;
  }, []);

  const getMicrophoneState = useCallback(() => {
    return microphoneState;
  }, [microphoneState]);

  const setTimeDurationCallback = useCallback(
    (callback: (duration: number) => void) => {
      timeDurationCallbackRef.current = callback;
    },
    [],
  );

  // Ensure setupMicrophone and setupAudioFiles are invoked based on mode
  useEffect(() => {
    if (mode === "mic") {
      setupMicrophone();
    } else if (mode === "files" || mode === "file") {
      setupAudioFiles(files);
    }
  }, [mode, files, setupMicrophone, setupAudioFiles]);

  // Ensure setupMicrophone and setupAudioFiles are invoked based on mode
  useEffect(() => {
    if (mode === "mic") {
      setupMicrophone();
    } else if (mode === "files" || mode === "file") {
      setupAudioFiles(files);
    }
  }, [mode, files, setupMicrophone, setupAudioFiles]);

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
      getAudioAnalyzers,
      getMicrophoneAnalyser,
      getMicrophoneState,
      audioContext: audioContextRef.current,
      setTimeDurationCallback,
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
      getAudioAnalyzers,
      getMicrophoneAnalyser,
      getMicrophoneState,
      setTimeDurationCallback,
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
