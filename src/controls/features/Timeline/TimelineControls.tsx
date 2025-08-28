import { Button, buttonStyles } from "@ui/Button";
import { Input, inputStyles } from "@ui/Input";
import { ChevronFirstIcon, PauseIcon, PlayIcon } from "lucide-react";
import { useCallback } from "react";
import styles from "./Timeline.module.css";

export interface TimelineControlsProps {
  isRunning: boolean;
  bpm: number;
  onPlayPause: () => void;
  onReset: () => void;
  onBpmChange: (bpm: number) => void;
  onBpmTap: () => void;
  canReset: boolean;
}

/**
 * Timeline controls component for playback and BPM controls.
 * This is a pure component that doesn't rely on any contexts.
 */
export function TimelineControls({
  isRunning,
  bpm,
  onPlayPause,
  onReset,
  onBpmChange,
  onBpmTap,
  canReset,
}: TimelineControlsProps) {
  const handleBpmChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newBpm = Number.parseInt(event.target.value, 10);
      if (!Number.isNaN(newBpm) && newBpm > 0) {
        onBpmChange(newBpm);
      }
    },
    [onBpmChange],
  );

  return (
    <div className={styles.controls}>
      <Button
        name="play_pause"
        onClick={onPlayPause}
        className={[
          "play-pause-button",
          buttonStyles.button,
          buttonStyles.icon,
        ].join(" ")}
      >
        {isRunning ? <PauseIcon /> : <PlayIcon />}
      </Button>

      <Button
        name="reset"
        onClick={onReset}
        disabled={!canReset}
        className={[
          "reset-button",
          buttonStyles.button,
          buttonStyles.icon,
        ].join(" ")}
      >
        <ChevronFirstIcon />
      </Button>

      <Input
        type="number"
        value={bpm}
        onChange={handleBpmChange}
        style={{ width: "4ch" }}
        className={["bpm-input", inputStyles.input].join(" ")}
      />

      <Button
        title="Click several times to set the Bpm"
        onClick={onBpmTap}
        className={["bpm-button", buttonStyles.button].join(" ")}
      >
        {`${String(bpm).padStart(3, "0")} bpm`}
      </Button>
    </div>
  );
}
