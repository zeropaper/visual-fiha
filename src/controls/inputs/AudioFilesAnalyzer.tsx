import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useContextWorkerPost } from "../ControlsContext";
import styles from "./AudioFilesAnalyzer.module.css";
import { useAudioSetup } from "./AudioSetupContext";
import { Frequency, TimeDomain, drawInfo } from "./CanvasVisualizer";

const audioConfig = {
  minDecibels: -120,
  maxDecibels: 80,
  smoothingTimeConstant: 0.85,
  fftSize: 1024,
};

function AudioFileAnalyzer({
  audioUrl,
  fileName,
  track,
  writeInputValues,
  forwardedAudioRef,
  onAudioDurationChange,
}: {
  audioUrl: string;
  fileName: string;
  track: string;
  writeInputValues: (path: string, value: any) => void;
  forwardedAudioRef?: (el: HTMLAudioElement | null) => void;
  onAudioDurationChange: (duration: number) => void;
}) {
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const audioElemRef = useRef<HTMLAudioElement | null>(null);

  // Clean up audio context and nodes
  function cleanupAudio() {
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    // Clean up when component unmounts or audioUrl changes
    return () => {
      cleanupAudio();
      // Do NOT revokeObjectURL here; it's handled in handleFileChange
    };
  }, [audioUrl]);

  // Setup audio context and analyser only after audio is loaded
  function handleLoadedMetadata() {
    cleanupAudio();
    if (!audioElemRef.current) return;
    try {
      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaElementSource(audioElemRef.current);
      const analyser = audioCtx.createAnalyser();
      analyser.minDecibels = audioConfig.minDecibels;
      analyser.maxDecibels = audioConfig.maxDecibels;
      analyser.smoothingTimeConstant = audioConfig.smoothingTimeConstant;
      analyser.fftSize = audioConfig.fftSize;
      source.connect(analyser);
      analyser.connect(audioCtx.destination);
      analyserRef.current = analyser;
      sourceRef.current = source;
    } catch (error) {
      console.error("Error creating MediaElementSourceNode:", error);
    }
  }

  function makeDrawExtras(type: "frequency" | "timeDomain") {
    return function drawExtras(
      canvasCtx: CanvasRenderingContext2D,
      dataArray: number[],
    ) {
      const sorted = [...dataArray].sort((a, b) => a - b);
      const info = {
        average: dataArray.reduce((a, b) => a + b, 0) / dataArray.length,
        median: sorted[Math.floor(sorted.length / 2)],
        min: Math.min(...dataArray),
        max: Math.max(...dataArray),
      };

      drawInfo(canvasCtx, info);

      writeInputValues(`audio.${track}.0.${type}.average`, info.average);
      writeInputValues(`audio.${track}.0.${type}.median`, info.median);
      writeInputValues(`audio.${track}.0.${type}.min`, info.min);
      writeInputValues(`audio.${track}.0.${type}.max`, info.max);
      writeInputValues(`audio.${track}.0.${type}.data`, dataArray);
    };
  }

  // Notify parent of audio duration changes
  useEffect(() => {
    if (audioElemRef.current) {
      const handleDurationChange = () => {
        onAudioDurationChange(audioElemRef.current?.duration || 0);
      };

      const currentEl = audioElemRef.current;
      currentEl.addEventListener("loadedmetadata", handleDurationChange);

      return () => {
        currentEl.removeEventListener("loadedmetadata", handleDurationChange);
      };
    }
  }, [onAudioDurationChange]);

  return (
    <details open className={styles.track}>
      <summary>{`${track} - ${fileName}`}</summary>
      <audio
        key={audioUrl}
        ref={(el) => {
          audioElemRef.current = el;
          if (forwardedAudioRef) forwardedAudioRef(el);
        }}
        src={audioUrl}
        controls
        style={{ display: "none" }}
        onError={() => {
          console.error("Error loading audio file:", audioUrl);
        }}
        onLoadedMetadata={handleLoadedMetadata}
      >
        <track kind="captions" label="No captions" />
      </audio>

      <div className={styles.visualizers}>
        <Frequency
          analyser={analyserRef.current}
          drawExtras={makeDrawExtras("frequency")}
        />

        <TimeDomain
          analyser={analyserRef.current}
          drawExtras={makeDrawExtras("timeDomain")}
        />
      </div>
    </details>
  );
}

export default function AudioFilesAnalyzer({
  writeInputValues,
}: {
  writeInputValues: (path: string, value: any) => void;
}) {
  const { files: audioFiles, setFiles: setAudioFiles } = useAudioSetup();
  const post = useContextWorkerPost();

  // Keep track of previous blob URLs to revoke them on change/unmount
  const prevBlobUrlsRef = useRef<string[]>([]);
  // Store refs to all audio elements
  const audioElemsRef = useRef<(HTMLAudioElement | null)[]>([]);
  // Track durations of all audio files
  const audioDurationsRef = useRef<number[]>([]);

  const setTimeDuration = useCallback(
    (duration: number) => {
      post?.("timeDuration", duration);
    },
    [post],
  );

  // Check if all audio files have the same duration
  const checkDurationMatch = useCallback(() => {
    const durations = audioDurationsRef.current.filter(
      (d) => !Number.isNaN(d) && d > 0,
    );
    if (durations.length === audioFiles.length && durations.length > 0) {
      // Check if all durations are the same (with small tolerance for floating point differences)
      const firstDuration = durations[0];
      const tolerance = 0.01; // 10ms tolerance
      const allSame = durations.every(
        (d) => Math.abs(d - firstDuration) <= tolerance,
      );

      if (allSame) {
        setTimeDuration(firstDuration * 1000);
      }
    }
  }, [audioFiles.length, setTimeDuration]);

  // Callback for individual audio files to report their duration
  const onAudioDurationChange = useCallback(
    (index: number, duration: number) => {
      audioDurationsRef.current[index] = duration;
      checkDurationMatch();
    },
    [checkDurationMatch],
  );

  // Clean up blob URLs on unmount
  useEffect(() => {
    return () => {
      prevBlobUrlsRef.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });
      prevBlobUrlsRef.current = [];
    };
  }, []);

  const { seekAll, setAllVolume } = useAudioSetup();

  // Update currentTime and duration from the first audio element
  useEffect(() => {
    const first = audioElemsRef.current[0];
    if (!first) return;
    function update() {
      if (first) {
        seekAll(first.currentTime);
        setAllVolume(first.volume);
      }
    }
    first.addEventListener("timeupdate", update);
    first.addEventListener("durationchange", update);
    return () => {
      if (first) {
        first.removeEventListener("timeupdate", update);
        first.removeEventListener("durationchange", update);
      }
    };
  }, [seekAll, setAllVolume]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAudioFiles = Array.from(files)
      .sort(({ name: a }, { name: b }) => {
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
      })
      .map((file) => ({
        url: URL.createObjectURL(file),
        name: file.name,
      }));
    setAudioFiles(newAudioFiles);
  }

  return (
    <div>
      <input
        type="file"
        accept="audio/*"
        multiple
        onChange={handleFileChange}
      />
      {audioFiles.map((audioFile, idx) => (
        <AudioFileAnalyzer
          key={audioFile.url}
          writeInputValues={writeInputValues}
          track={String(idx)}
          audioUrl={audioFile.url}
          fileName={audioFile.name}
          forwardedAudioRef={(el: HTMLAudioElement | null) => {
            audioElemsRef.current[idx] = el;
          }}
          onAudioDurationChange={(duration: number) =>
            onAudioDurationChange(idx, duration)
          }
        />
      ))}
    </div>
  );
}
