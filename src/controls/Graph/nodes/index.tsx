import {
  type BuiltInNode,
  Handle,
  type NodeTypes,
  Position,
} from "@xyflow/react";
import type { Prettify } from "../../../types";
import MicrophoneGraphNode from "../../inputs/graph/MicrophoneGraphNode";
import SingleTrackAudioGraphNode from "../../inputs/graph/SingleTrackAudioGraphNode";
import { PositionLoggerNode } from "./PositionLoggerNode";
import StoreGraphNode from "./StoreGraphNode";
import { SystemInputNode } from "./SystemInputNode";
import type {
  PositionLoggerNode as PositionLoggerNodeType,
  SingleTrackAudioNode as SingleTrackAudioNodeType,
  SystemInputNode as SystemInputNodeType,
} from "./types";

export type AppNode = Prettify<
  | BuiltInNode
  | PositionLoggerNodeType
  | SystemInputNodeType
  | SingleTrackAudioNodeType
>;

export const initialNodes: AppNode[] = [
  { id: "a", type: "midi", position: { x: 0, y: 0 }, data: { label: "MIDI" } },
  {
    id: "b",
    type: "microphone",
    position: { x: -100, y: 100 },
    data: {},
  },
  { id: "c", position: { x: 100, y: 100 }, data: { label: "your ideas" } },
  {
    id: "d",
    type: "output",
    position: { x: 0, y: 200 },
    data: { label: "with React Flow" },
  },
];

export const nodeTypes: NodeTypes = {
  // @ts-expect-error
  "position-logger": PositionLoggerNode,
  // @ts-expect-error
  midi: SystemInputNode,
  // @ts-expect-error
  time: SystemInputNode,
  // @ts-expect-error
  bpm: SystemInputNode,

  "single-track-audio": SingleTrackAudioGraphNode,
  microphone: MicrophoneGraphNode,
  signal: (props) => {
    console.info("signal props", props);
    return <>TODO: Signal</>;
  },
  store: StoreGraphNode,
};
