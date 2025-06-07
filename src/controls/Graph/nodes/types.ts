import type { Node } from "@xyflow/react";

export type PositionLoggerNode = Node<
  {
    label?: string;
  },
  "position-logger"
>;

export type SystemInputNode = Node<
  {
    label?: string;
  },
  "microphone" | "midi" | "time" | "bpm"
>;

export type SingleTrackAudioNode = Node<
  {
    label?: string;
  },
  "single-track-audio"
>;
