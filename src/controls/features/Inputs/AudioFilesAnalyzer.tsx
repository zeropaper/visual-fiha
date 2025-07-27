import { useAudioSetup } from "@contexts/AudioSetupContext";
import { Button } from "@ui/Button";
import type React from "react";
import { useEffect, useRef } from "react";
import { AudioAnalyzer } from "./AudioAnalyzer";
import styles from "./AudioFilesAnalyzer.module.css";

export default function AudioFilesAnalyzer() {
  const { files: audioFiles, setFiles: setAudioFiles } = useAudioSetup();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Keep track of previous blob URLs to revoke them on change/unmount
  const prevBlobUrlsRef = useRef<string[]>([]);

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
    <div className="audio-files-analyzer">
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
        <strong>Frequency</strong>
        <strong>Time Domain</strong>
      </div>
      {audioFiles.map((audioFile, idx) => (
        <AudioAnalyzer
          key={audioFile.url}
          track={String(idx)}
          audioUrl={audioFile.url}
          fileName={audioFile.name}
        />
      ))}
    </div>
  );
}
