import type React from "react";
import { useEffect, useRef, useState } from "react";
import styles from "./AudioFilesAnalyzer.module.css";
import { Frequency, TimeDomain, drawInfo } from "./CanvasVisualizer";

const audioConfig = {
  minDecibels: -120,
  maxDecibels: 80,
  smoothingTimeConstant: 0.85,
  fftSize: 1024,
};

function AudioFileAnalyzer({
  audioUrl,
  track,
  writeInputValues,
  setAudioState,
}: {
  audioUrl: string;
  track: string;
  writeInputValues: (path: string, value: any) => void;
  setAudioState: (state: string) => void;
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
      console.log("Cleaning up audio with URL:", audioUrl);
      cleanupAudio();
      // Do NOT revokeObjectURL here; it's handled in handleFileChange
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setAudioState("ready");
      console.log("Audio context and analyser set up for:", audioUrl);
    } catch (error) {
      console.error("Error creating MediaElementSourceNode:", error);
      setAudioState("error");
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

  return (
    <div>
      <audio
        key={audioUrl}
        ref={audioElemRef}
        src={audioUrl}
        controls
        style={{ width: "100%" }}
        onError={() => {
          console.error("Error loading audio file:", audioUrl);
          setAudioState("error");
        }}
        onLoadedMetadata={handleLoadedMetadata}
      >
        <track kind="captions" label="No captions" />
      </audio>

      <div className={styles.visualizers}>
        <div>
          <strong>Frequency</strong>
          <Frequency
            analyser={analyserRef.current}
            drawExtras={makeDrawExtras("frequency")}
          />
        </div>

        <div>
          <strong>Time Domain</strong>
          <TimeDomain
            analyser={analyserRef.current}
            drawExtras={makeDrawExtras("timeDomain")}
          />
        </div>
      </div>
    </div>
  );
}

export default function AudioFilesAnalyzer({
  writeInputValues,
}: {
  writeInputValues: (path: string, value: any) => void;
}) {
  const [audioState, setAudioState] = useState<string>("no file");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setAudioState("loading");

    // Generate a new blob URL for the selected file
    const newBlobUrl = URL.createObjectURL(file);
    setAudioUrl((prev) => {
      if (prev) {
        console.log("Revoking previous blob URL:", prev);
        URL.revokeObjectURL(prev); // Revoke the previous blob URL
      }
      return newBlobUrl;
    });
  }

  return (
    <div>
      <input type="file" accept="audio/*" onChange={handleFileChange} />
      <div>{audioState}</div>

      {audioUrl && (
        <AudioFileAnalyzer
          writeInputValues={writeInputValues}
          track="0"
          audioUrl={audioUrl}
          setAudioState={setAudioState}
        />
      )}
    </div>
  );
}
