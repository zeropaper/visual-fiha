import type React from "react";
import { useCallback, useEffect, useRef } from "react";
import { useContextWorkerPost } from "../ControlsContext";
import { Button } from "../base/Button";
import { AudioAnalyzer } from "./AudioAnalyzer";
import styles from "./AudioFilesAnalyzer.module.css";
import { useAudioSetup } from "./AudioSetupContext";

export default function AudioFilesAnalyzer({
  writeInputValues,
}: {
  writeInputValues: (path: string, value: any) => void;
}) {
  const {
    files: audioFiles,
    setFiles: setAudioFiles,
    setTimeDurationCallback,
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

  // Set up the duration callback when component mounts
  useEffect(() => {
    setTimeDurationCallback(setTimeDuration);
  }, [setTimeDurationCallback, setTimeDuration]);

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
