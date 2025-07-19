// React context that handles audio setup

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
  element: HTMLAudioElement;
  analyser: AnalyserNode;
  source: MediaElementAudioSourceNode;
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
  getAudioElements: () => ManagedAudioElement[];
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
  getAudioElements: () => {
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

  // Central audio management state
  const audioContextRef = useRef<AudioContext | null>(null);
  const managedAudioElementsRef = useRef<ManagedAudioElement[]>([]);
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
    managedAudioElementsRef.current.forEach(({ element, analyser, source }) => {
      try {
        source.disconnect();
        analyser.disconnect();
        element.pause();
        element.remove();
      } catch (err) {
        console.warn("Error cleaning up audio element:", err);
      }
    });
    managedAudioElementsRef.current = [];

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
    (audioFiles: AudioFileInfo[]) => {
      // Clean up existing audio elements
      managedAudioElementsRef.current.forEach(
        ({ element, analyser, source }) => {
          try {
            source.disconnect();
            analyser.disconnect();
            element.pause();
            element.remove();
          } catch (err) {
            console.warn("Error cleaning up audio element:", err);
          }
        },
      );
      managedAudioElementsRef.current = [];

      if (audioFiles.length === 0) return;

      const audioCtx = getOrCreateAudioContext();

      audioFiles.forEach((fileInfo, index) => {
        const element = document.createElement("audio");
        element.src = fileInfo.url;
        element.crossOrigin = "anonymous";
        element.style.display = "none";
        document.body.appendChild(element);

        // Setup audio analysis
        const analyser = audioCtx.createAnalyser();
        analyser.minDecibels = audioConfig.minDecibels;
        analyser.maxDecibels = audioConfig.maxDecibels;
        analyser.smoothingTimeConstant = audioConfig.smoothingTimeConstant;
        analyser.fftSize = audioConfig.fftSize;

        const source = audioCtx.createMediaElementSource(element);
        source.connect(analyser);
        analyser.connect(audioCtx.destination);

        managedAudioElementsRef.current.push({
          element,
          analyser,
          source,
          index,
        });

        // Setup event listeners for playback state
        const updatePlaybackState = () => {
          if (index === 0) {
            // Use first element as reference
            setPlaybackState((prev) => ({
              ...prev,
              currentTime: element.currentTime * 1000, // Convert to ms
              duration: element.duration * 1000, // Convert to ms
              volume: element.volume,
            }));
          }
        };

        element.addEventListener("timeupdate", updatePlaybackState);
        element.addEventListener("durationchange", updatePlaybackState);
        element.addEventListener("volumechange", updatePlaybackState);

        // Add duration checking for time.duration sync
        element.addEventListener("loadedmetadata", () => {
          checkAudioFilesDuration();
        });
      });
    },
    [getOrCreateAudioContext],
  );

  // Check if all audio files have the same duration and notify callback
  const checkAudioFilesDuration = useCallback(() => {
    const elements = managedAudioElementsRef.current;
    if (!elements.length) return;

    const durations = elements.map(({ element }) => element.duration);
    const validDurations = durations.filter((d) => !Number.isNaN(d) && d > 0);

    const maxDuration = Math.max(...validDurations);
    timeDurationCallbackRef.current?.(maxDuration * 1000);
    setPlaybackState((prev) => ({
      ...prev,
      duration: maxDuration * 1000, // Convert to ms
    }));
  }, []);

  // Update audio files when files change
  useEffect(() => {
    if (mode === "files" || mode === "file") {
      setupAudioFiles(files);
    }
  }, [files, mode, setupAudioFiles]);

  // Setup microphone when mode changes to mic
  useEffect(() => {
    if (mode === "mic") {
      setupMicrophone();
    }
  }, [mode, setupMicrophone]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanupAudio;
  }, [cleanupAudio]);

  const playAll = useCallback(() => {
    managedAudioElementsRef.current.forEach(({ element }) => {
      element.currentTime = playbackState.currentTime / 1000; // Convert from ms
      element.volume = playbackState.volume;
      element.play().catch((err) => console.warn("Error playing audio:", err));
    });
    setPlaybackState((prev) => ({ ...prev, isPlaying: true }));
  }, [playbackState.currentTime, playbackState.volume]);

  const pauseAll = useCallback(() => {
    managedAudioElementsRef.current.forEach(({ element }) => {
      element.pause();
    });
    setPlaybackState((prev) => ({ ...prev, isPlaying: false }));
  }, []);

  const stopAll = useCallback(() => {
    managedAudioElementsRef.current.forEach(({ element }) => {
      element.pause();
      element.currentTime = 0;
    });
    setPlaybackState((prev) => ({ ...prev, isPlaying: false, currentTime: 0 }));
  }, []);

  const seekAll = useCallback((time: number) => {
    const timeInSeconds = time * 0.001;
    setPlaybackState((prev) => ({
      ...prev,
      currentTime: time,
      seeking: true,
    }));

    managedAudioElementsRef.current.forEach(({ element }) => {
      element.currentTime = timeInSeconds;
    });

    // Wait for seeking to complete
    const waitForSeek = () =>
      Promise.all(
        managedAudioElementsRef.current.map(
          ({ element }) =>
            new Promise<void>((resolve) => {
              const check = () => {
                if (!element.seeking) {
                  resolve();
                } else {
                  setTimeout(check, 10);
                }
              };
              check();
            }),
        ),
      );

    waitForSeek().then(() => {
      setPlaybackState((prev) => ({
        ...prev,
        currentTime: time,
        seeking: false,
      }));
    });
  }, []);

  const setAllVolume = useCallback((volume: number) => {
    managedAudioElementsRef.current.forEach(({ element }) => {
      element.volume = volume;
    });
    setPlaybackState((prev) => ({ ...prev, volume }));
  }, []);

  // New methods for providing audio resources to components
  const getAudioElements = useCallback(() => {
    return [...managedAudioElementsRef.current];
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
      getAudioElements,
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
      getAudioElements,
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
