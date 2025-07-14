import type React from "react";
import { useCallback, useEffect, useRef } from "react";
import { useContextWorkerPost } from "../ControlsContext";
import { Button } from "../base/Button";
import { AudioAnalyzer } from "./AudioAnalyzer";
import styles from "./AudioFilesAnalyzer.module.css";
import { useAudioSetup } from "./AudioSetupContext";

const audioConfig = {
  minDecibels: -120,
  maxDecibels: 80,
  smoothingTimeConstant: 0.85,
  fftSize: 1024,
};

export default function AudioFilesAnalyzer({
  writeInputValues,
  defaultAudioFiles = [],
}: {
  writeInputValues: (path: string, value: any) => void;
  defaultAudioFiles?: string[];
}) {
  const { files: audioFiles, setFiles: setAudioFiles } = useAudioSetup();
  const post = useContextWorkerPost();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
    if (!files?.length) return;
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (!defaultAudioFiles?.length) return;
    setAudioFiles(
      defaultAudioFiles.map((url) => ({
        url,
        name: url.split("/").pop() || "unknown",
      })),
    );
  }, []);

  return (
    <div>
      <div className={styles.fileInput}>
        <input
          type="file"
          accept="audio/*"
          multiple
          onChange={handleFileChange}
          ref={fileInputRef}
        />
        <Button
          type="button"
          onClick={() => {
            fileInputRef.current?.click();
          }}
        >
          Select Audio Files
        </Button>
      </div>
      <div className={styles.labels}>
        <strong>Time Domain</strong>
        <strong>Frequency</strong>
      </div>
      {audioFiles.map((audioFile, idx) => (
        <AudioAnalyzer
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
