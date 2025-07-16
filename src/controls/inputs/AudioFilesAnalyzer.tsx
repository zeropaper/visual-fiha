import type React from "react";
import { useCallback, useEffect, useRef } from "react";
import { useContextWorkerPost } from "../ControlsContext";
import { Button } from "../base/Button";
import { AudioAnalyzer } from "./AudioAnalyzer";
import styles from "./AudioFilesAnalyzer.module.css";
import { useAudioSetup } from "./AudioSetupContext";

export default function AudioFilesAnalyzer({
  writeInputValues,
  defaultAudioFiles = [],
}: {
  writeInputValues: (path: string, value: any) => void;
  defaultAudioFiles?: string[];
}) {
  const {
    files: audioFiles,
    setFiles: setAudioFiles,
    getAudioElements,
  } = useAudioSetup();
  const post = useContextWorkerPost();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Keep track of previous blob URLs to revoke them on change/unmount
  const prevBlobUrlsRef = useRef<string[]>([]);

  const setTimeDuration = useCallback(
    (duration: number) => {
      post?.("timeDuration", duration);
    },
    [post],
  );

  // Check if all audio files have the same duration
  const checkDurationMatch = useCallback(() => {
    const managedElements = getAudioElements();
    if (managedElements.length === 0) return;

    const durations = managedElements.map(({ element }) => element.duration);
    const validDurations = durations.filter((d) => !Number.isNaN(d) && d > 0);

    if (
      validDurations.length === audioFiles.length &&
      validDurations.length > 0
    ) {
      // Check if all durations are the same (with small tolerance for floating point differences)
      const firstDuration = validDurations[0];
      const tolerance = 0.01; // 10ms tolerance
      const allSame = validDurations.every(
        (d) => Math.abs(d - firstDuration) <= tolerance,
      );

      if (allSame) {
        setTimeDuration(firstDuration * 1000);
      }
    }
  }, [audioFiles.length, setTimeDuration, getAudioElements]);

  // Check duration match when elements change
  useEffect(() => {
    const managedElements = getAudioElements();
    if (managedElements.length === 0) return;

    const handleLoadedMetadata = () => checkDurationMatch();

    managedElements.forEach(({ element }) => {
      element.addEventListener("loadedmetadata", handleLoadedMetadata);
    });

    return () => {
      managedElements.forEach(({ element }) => {
        element.removeEventListener("loadedmetadata", handleLoadedMetadata);
      });
    };
  }, [checkDurationMatch, getAudioElements]);

  // Clean up blob URLs on unmount
  useEffect(() => {
    return () => {
      prevBlobUrlsRef.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });
      prevBlobUrlsRef.current = [];
    };
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;

    // Revoke previous blob URLs
    prevBlobUrlsRef.current.forEach((url) => {
      URL.revokeObjectURL(url);
    });

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

    // Store new blob URLs for cleanup
    prevBlobUrlsRef.current = newAudioFiles.map((file) => file.url);
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
        />
      ))}
    </div>
  );
}
