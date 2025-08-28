import type { TimeInputValue } from "../../../types";
import styles from "./Timeline.module.css";
import {
  TimelineControls,
  type TimelineControlsProps,
} from "./TimelineControls";
import { TimelineFinite } from "./TimelineFinite";
import { TimelineInfinite } from "./TimelineInfinite";

export interface PureTimelineProps {
  className?: string;
  getTimeData: () => TimeInputValue | null;
  bpm: number;
  isRunning: boolean;
  hoveredTime: number | null;
  onCanvasClick: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  onCanvasMouseMove: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  onCanvasMouseLeave: () => void;
  controls: Omit<TimelineControlsProps, "isRunning" | "bpm">;
}

/**
 * Pure Timeline component that renders a visual timeline with time ticks and a playhead.
 * This component is purely presentational and does not rely on any contexts.
 */
export function PureTimeline({
  className,
  getTimeData,
  bpm,
  isRunning,
  hoveredTime,
  onCanvasClick,
  onCanvasMouseMove,
  onCanvasMouseLeave,
  controls,
}: PureTimelineProps) {
  const timeData = getTimeData();
  const hasDuration = timeData?.duration && timeData.duration > 0;

  return (
    <div
      className={["timeline", styles.timeline, className]
        .filter(Boolean)
        .join(" ")}
    >
      <TimelineControls {...controls} isRunning={isRunning} bpm={bpm} />

      {hasDuration ? (
        <TimelineFinite
          getTimeData={getTimeData}
          bpm={bpm}
          hoveredTime={hoveredTime}
          onCanvasClick={onCanvasClick}
          onCanvasMouseMove={onCanvasMouseMove}
          onCanvasMouseLeave={onCanvasMouseLeave}
        />
      ) : (
        <TimelineInfinite
          getTimeData={getTimeData}
          bpm={bpm}
          hoveredTime={hoveredTime}
          onCanvasClick={onCanvasClick}
          onCanvasMouseMove={onCanvasMouseMove}
          onCanvasMouseLeave={onCanvasMouseLeave}
        />
      )}
    </div>
  );
}
