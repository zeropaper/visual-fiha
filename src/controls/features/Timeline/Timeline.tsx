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

  // Track click times for BPM tap tempo calculation
  const [, setBpmClickTimes] = useState<number[]>([]);

  // measures the intervals between clicks to set BPM with averaging for better precision
  const handleBpmClick = useCallback(() => {
    const now = Date.now();

    setBpmClickTimes((prevTimes) => {
      // Filter out clicks older than 2 seconds to keep only recent taps
      const recentTimes = prevTimes.filter((time) => now - time <= 2000);

      // Add the current click time
      const newTimes = [...recentTimes, now];

      // If we have at least 2 clicks (current + at least 1 previous), calculate BPM
      if (newTimes.length >= 2) {
        // Calculate intervals between consecutive clicks
        const intervals: number[] = [];
        for (let i = 1; i < newTimes.length; i++) {
          intervals.push(newTimes[i] - newTimes[i - 1]);
        }

        // Calculate average interval
        const averageInterval =
          intervals.reduce((sum, interval) => sum + interval, 0) /
          intervals.length;

        // Convert average interval to BPM (60000ms = 1 minute)
        const bpmValue = Math.round(60000 / averageInterval);

        // Only set BPM if it's within reasonable range (30-300 BPM)
        if (bpmValue >= 30 && bpmValue <= 300) {
          post?.("setBpm", bpmValue);
        }
      } else {
        // First click or clicks too far apart - signal start of BPM tapping
        post?.("setBpmStart");
      }

      // Keep a maximum of 8 recent clicks to prevent memory issues and maintain responsiveness
      return newTimes.slice(-8);
    });
  }, [post]);

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
