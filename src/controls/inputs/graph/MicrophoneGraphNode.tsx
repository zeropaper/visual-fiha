import { Handle, type Node, type NodeProps, Position } from "@xyflow/react";

type MicrophoneNodeProps = Node<
  {
    label?: string;
  },
  "microphone"
>;

export default function MicrophoneGraphNode(
  props: NodeProps<MicrophoneNodeProps>,
) {
  return (
    <div className="react-flow__node-default input-node">
      <div>{props.data.label || "Microphone"}</div>
      <div className="input-node__audio-channels">
        <span>Left</span>
        <span>Mono</span>
        <span>Right</span>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="left"
        style={{ left: "10%" }}
      />
      <Handle type="source" position={Position.Bottom} id="mono" />
      <Handle
        type="source"
        position={Position.Bottom}
        id="right"
        style={{ left: "90%" }}
      />
    </div>
  );
}
