import { useAudioSetup } from "@contexts/AudioSetupContext";
import { useContextWorkerPost } from "@contexts/ControlsContext";
import type React from "react";
import { type MouseEventHandler, useCallback, useState } from "react";
import { useRuntimeMonitor } from "../../hooks/useRuntimeMonitor";
import { PureTimeline } from "./PureTimeline";

interface TimelineProps {
  className?: string;
  bpm?: number;
}

const minTimelineDuration = 30000; // Minimum duration for absolute time display (30 seconds)

/**
 * Timeline component that renders a visual timeline with time ticks and a playhead
 * that shows the current position in time. Supports clicking to seek to a specific time.
 */
export function Timeline({ className }: TimelineProps) {
  const post = useContextWorkerPost();
  const { isRunning, bpm, getTimeData } = useRuntimeMonitor();
  const [hoveredTime, setHoveredTime] = useState<number | null>(null);

  const { playAll, pauseAll, seekAll, stopAll } = useAudioSetup();

  const getTimelineTime = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>): number => {
      const timeData = getTimeData();
      const canvas = event.currentTarget;
      if (!canvas) return 0;

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const mousePercent = x / canvas.width;

      // For relative time, calculate based on duration
      if (timeData?.duration) {
        return mousePercent * timeData.duration;
      }

      const clickedTime =
        mousePercent * Math.max(timeData?.elapsed || 0, minTimelineDuration);
      return clickedTime;
    },
    [getTimeData],
  );

  const handleCanvasClick = useCallback<MouseEventHandler<HTMLCanvasElement>>(
    (event) => {
      const timeValue = getTimelineTime(event);
      seekAll(timeValue);
    },
    [getTimelineTime, seekAll],
  );

  const handleCanvasMouseMove = useCallback<
    MouseEventHandler<HTMLCanvasElement>
  >(
    (event) => {
      setHoveredTime(getTimelineTime(event));
    },
    [getTimelineTime],
  );

  const handleCanvasMouseLeave = useCallback(() => {
    setHoveredTime(null);
  }, []);

  const handlePlayPause = useCallback(() => {
    if (isRunning) {
      pauseAll();
    } else {
      playAll();
    }
  }, [isRunning, playAll, pauseAll]);

  const [lastBpmClick, setLastBpmClick] = useState<number | null>(null);
  // measures the interval between clicks to set Bpm
  const handleBpmClick = useCallback(() => {
    const now = Date.now();
    // If last click was within 1 second, calculate BPM
    if (lastBpmClick && now - lastBpmClick < 1000) {
      // Calculate BPM based on time difference
      const bpmValue = Math.round(60000 / (now - lastBpmClick));
      post?.("setBpm", bpmValue);
    } else {
      post?.("setBpmStart");
    }
    setLastBpmClick(now);
  }, [lastBpmClick, post]);

  const handleBpmChange = useCallback(
    (newBpm: number) => {
      post?.("setBpm", newBpm);
    },
    [post],
  );

  return (
    <PureTimeline
      className={className}
      getTimeData={getTimeData}
      bpm={bpm}
      isRunning={isRunning}
      hoveredTime={hoveredTime}
      onCanvasClick={handleCanvasClick}
      onCanvasMouseMove={handleCanvasMouseMove}
      onCanvasMouseLeave={handleCanvasMouseLeave}
      controls={{
        onPlayPause: handlePlayPause,
        onReset: stopAll,
        onBpmChange: handleBpmChange,
        onBpmTap: handleBpmClick,
        canReset: isRunning, // && !!timeData?.elapsed,
      }}
    />
  );
}
