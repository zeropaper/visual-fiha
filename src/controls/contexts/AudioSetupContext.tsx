/**
 * AudioSetupContext is a React context that manages audio input modes,
 * playback state, and audio analyzers for visualizations.
 * It provides methods to play, pause, stop, and seek audio tracks,
 * as well as to manage microphone input.
 *
 */

import {
  useContextWorkerPost,
  useWriteInputValues,
} from "@contexts/ControlsContext";
import { useAnimationFrame } from "@controls/hooks/useAnimationFrame";
import { useRuntimeMonitor } from "@hooks/useRuntimeMonitor";
import { loadTrack } from "@utils/syncAudio";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { AudioInputMode } from "src/types";

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
  stream: MediaStream;
  source: MediaStreamAudioSourceNode;
}

interface AudioSetupContextValue {
  mode: AudioInputMode;
  setMode: (mode: AudioInputMode) => void;
  files: Array<AudioFileInfo>;
  setFiles: (files: Array<AudioFileInfo>) => void;
  playbackState: PlaybackState;
  getCurrentTime: () => number;
  playAll: () => void;
  pauseAll: () => void;
  stopAll: () => void;
  seekAll: (time: number) => void;
  setAllVolume: (volume: number) => void;
  getAudioAnalyzers: () => ManagedAudioElement[];
  getMicrophoneState: () => AudioContextState;
  audioContext: AudioContext | null;
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
  getCurrentTime: () => 0,
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
  getMicrophoneState: () => {
    throw new Error("getMicrophoneState is not implemented");
  },
  audioContext: null,
});

export function AudioSetupProvider({
  children,
  defaultAudioFiles = [],
}: {
  children: ReactNode;
  defaultAudioFiles?: string[];
}) {
  const post = useContextWorkerPost();
  const { isRunning, getTimeData } = useRuntimeMonitor();
  const [files, setFiles] = useState<AudioFileInfo[]>(
    defaultAudioFiles.map((url) => ({
      url,
      name: url.split("/").pop() || "unknown",
    })),
  );
  const [mode, setModeState] = useState<AudioInputMode>(
    (localStorage.getItem("audioMode") as AudioInputMode) || "files",
  );
  const writeInputValues = useWriteInputValues();

  // Memoize stable playback properties that don't change frequently
  const stablePlaybackState = useMemo(
    () => ({
      isPlaying: isRunning,
      duration: getTimeData()?.duration || 0,
      volume: 1,
      seeking: false,
    }),
    [isRunning, getTimeData],
  );

  // Create playbackState with a getCurrentTime function instead of direct currentTime property
  const playbackState = useMemo<PlaybackState>(
    () => ({
      ...stablePlaybackState,
      currentTime: 0, // Default value, consumers should use getCurrentTime instead
    }),
    [stablePlaybackState],
  );

  const sourcesRef = useRef<AudioBufferSourceNode[]>([]);

  // Central audio management state
  const audioContextRef = useRef<AudioContext | null>(null);
  const managedAnalyzersRef = useRef<
    { analyser: AnalyserNode; index: number }[]
  >([]);
  const microphoneAudioRef = useRef<MicrophoneAudio | null>(null);
  const [microphoneState, setMicrophoneState] =
    useState<AudioContextState>("closed");

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

    sourcesRef.current.forEach((source) => {
      try {
        if (source.buffer) {
          source.stop();
        }
      } catch (err) {
        console.warn("Error stopping audio source:", err);
      }
    });
    sourcesRef.current = [];
  }, []);

  // Setup microphone audio
  const setupMicrophone = useCallback(async () => {
    try {
      cleanupAudio();

      // Cleanup microphone audio
      if (microphoneAudioRef.current) {
        try {
          microphoneAudioRef.current.source.disconnect();
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
      managedAnalyzersRef.current.push({ analyser, index: 0 });

      microphoneAudioRef.current = {
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
      post?.("timeDuration", 0);
    } catch (error) {
      console.error("Error setting up microphone:", error);
      setMicrophoneState("closed");
    }
  }, [getOrCreateAudioContext, cleanupAudio, post]);

  // Setup audio files
  const setupAudioFiles = useCallback(
    async (audioFiles: AudioFileInfo[]) => {
      cleanupAudio();

      if (!audioFiles.length) return;

      const audioCtx = getOrCreateAudioContext();
      // Load all tracks and setup analyzers
      const sources = await Promise.all(
        audioFiles.map(async (fileInfo, index) => {
          const source = await loadTrack(fileInfo.url, audioCtx);

          // Setup audio analysis
          const analyser = audioCtx.createAnalyser();
          analyser.minDecibels = audioConfig.minDecibels;
          analyser.maxDecibels = audioConfig.maxDecibels;
          analyser.smoothingTimeConstant = audioConfig.smoothingTimeConstant;
          analyser.fftSize = audioConfig.fftSize;

          source.connect(analyser);
          analyser.connect(audioCtx.destination);

          managedAnalyzersRef.current.push({ analyser, index });

          return source;
        }),
      );

      sourcesRef.current = sources;

      // Determine maximal duration among loaded audio buffers
      const maxDuration = Math.max(
        ...sources.map((source) => source.buffer?.duration ?? 0),
      );
      post?.("timeDuration", maxDuration * 1000); // Convert to milliseconds
    },
    [getOrCreateAudioContext, cleanupAudio, post],
  );

  // Wrap createAndWireSource in useCallback to stabilize it
  const createAndWireSource = useCallback(
    (
      oldSource: AudioBufferSourceNode,
      analyser: AnalyserNode,
      audioCtx: AudioContext,
      bufferOffset = 0,
      shouldStart = true,
    ) => {
      const newSource = audioCtx.createBufferSource();
      newSource.buffer = oldSource.buffer;
      newSource.connect(analyser);
      analyser.connect(audioCtx.destination);

      if (shouldStart) {
        try {
          // Start immediately at the current time, but from the specified offset in the buffer
          newSource.start(audioCtx.currentTime, bufferOffset);
        } catch (err) {
          console.warn(err instanceof Error ? err.message : "");
        }
      }

      return newSource;
    },
    [],
  );

  // Update playAll to recreate AudioBufferSourceNode for playback while re-wiring analyzers
  const playAll = useCallback(() => {
    console.log("Playing all audio sources");
    const audioCtx = getOrCreateAudioContext();

    post?.("resume");
    // Convert current time from milliseconds to seconds for Web Audio API
    const currentTimeInSeconds = (getTimeData()?.elapsed || 0) / 1000;

    sourcesRef.current = sourcesRef.current.map((oldSource, index) => {
      const analyser = managedAnalyzersRef.current[index]?.analyser;
      if (!analyser) {
        console.warn("No analyser found for source at index", index);
        return oldSource;
      }
      return createAndWireSource(
        oldSource,
        analyser,
        audioCtx,
        currentTimeInSeconds,
      );
    });
  }, [post, getOrCreateAudioContext, createAndWireSource, getTimeData]);

  const pauseAll = useCallback(() => {
    console.log("Pausing all audio sources");
    post?.("pause");
    sourcesRef.current.forEach((source) => {
      if (source.buffer) {
        try {
          source.stop();
        } catch (err) {
          console.warn(err instanceof Error ? err.message : "");
        }
      } else {
        console.warn("Source has no buffer to pause");
      }
    });
  }, [post]);

  const stopAll = useCallback(() => {
    console.log("Stopping all audio sources", sourcesRef.current.length);
    post?.("pause");
    post?.("reset");
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
  }, [post]);

  // Re-wire analyzers when seekAll is called
  const seekAll = useCallback(
    (time: number) => {
      console.log("Seeking all audio sources to time:", time);
      const audioCtx = getOrCreateAudioContext();
      const wasPlaying = stablePlaybackState.isPlaying;

      // Convert time from milliseconds to seconds for Web Audio API
      const timeInSeconds = time / 1000;

      // Stop all current sources first
      sourcesRef.current.forEach((source) => {
        if (source.buffer) {
          try {
            source.stop();
          } catch (err) {
            console.warn(err instanceof Error ? err.message : "");
          }
        }
      });

      // Create new sources at the seek position
      sourcesRef.current = sourcesRef.current.map((oldSource, index) => {
        const analyser = managedAnalyzersRef.current[index].analyser;
        return createAndWireSource(
          oldSource,
          analyser,
          audioCtx,
          timeInSeconds,
          wasPlaying, // Only start if audio was playing before seek
        );
      });

      post?.("setTime", time);
    },
    [
      post,
      getOrCreateAudioContext,
      createAndWireSource,
      stablePlaybackState.isPlaying,
    ],
  );

  const setAllVolume = useCallback(() => {
    throw new Error("setAllVolume is not implemented");
  }, []);

  // New methods for providing audio resources to components
  const getAudioAnalyzers = useCallback(() => {
    return [...managedAnalyzersRef.current];
  }, []);

  const getMicrophoneState = useCallback(() => {
    return microphoneState;
  }, [microphoneState]);

  // Stable function to get current time without causing context re-renders
  const getCurrentTime = useCallback(() => {
    return getTimeData()?.elapsed || 0;
  }, [getTimeData]);

  // Ensure setupMicrophone and setupAudioFiles are invoked based on mode
  useEffect(() => {
    localStorage.setItem("audioMode", mode);
    if (mode === "mic") {
      setupMicrophone();
    } else {
      setupAudioFiles(files);
    }
  }, [mode, files, setupMicrophone, setupAudioFiles]);

  const setMode = useCallback(
    (newMode: AudioInputMode) => {
      console.log("Setting audio input mode to:", newMode);
      post?.("reset");
      stopAll();
      cleanupAudio();
      setModeState(newMode);
    },
    [post, cleanupAudio, stopAll],
  );

  const counterRef = useRef<number>(0);
  useAnimationFrame(() => {
    counterRef.current += 1;

    managedAnalyzersRef.current.forEach(({ analyser }, index) => {
      ["frequency", "timeDomain"].forEach((type) => {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        if (type === "frequency") {
          analyser.getByteFrequencyData(dataArray);
        } else {
          analyser.getByteTimeDomainData(dataArray);
        }

        const sorted = [...dataArray].sort((a, b) => a - b);
        const info = {
          average: dataArray.reduce((a, b) => a + b, 0) / dataArray.length,
          median: sorted[Math.floor(sorted.length / 2)],
          min: Math.min(...dataArray),
          max: Math.max(...dataArray),
        };

        writeInputValues(`audio.${index}.0.${type}.average`, info.average);
        writeInputValues(`audio.${index}.0.${type}.median`, info.median);
        writeInputValues(`audio.${index}.0.${type}.min`, info.min);
        writeInputValues(`audio.${index}.0.${type}.max`, info.max);
        writeInputValues(`audio.${index}.0.${type}.data`, dataArray);
      });
    });
    if (counterRef.current % 60 === 0) {
      // Do something every 60 frames (1 second at 60fps)
      console.log(
        "1 second passed in animation frame",
        managedAnalyzersRef.current,
      );
    }
  });

  const value = useMemo<AudioSetupContextValue>(
    () => ({
      files,
      setFiles,
      mode,
      setMode,
      playbackState,
      getCurrentTime,
      playAll,
      pauseAll,
      stopAll,
      seekAll,
      setAllVolume,
      getAudioAnalyzers,
      getMicrophoneState,
      audioContext: audioContextRef.current,
    }),
    [
      files,
      mode,
      setMode,
      playbackState,
      getCurrentTime,
      playAll,
      pauseAll,
      stopAll,
      seekAll,
      setAllVolume,
      getAudioAnalyzers,
      getMicrophoneState,
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
