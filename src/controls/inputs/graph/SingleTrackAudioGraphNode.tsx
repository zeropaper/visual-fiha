import { Handle, type Node, type NodeProps, Position } from "@xyflow/react";

type SingleTrackAudioNodeProps = Node<
  {
    label?: string;
  },
  "single-track-audio"
>;

export default function SingleTrackAudioGraphNode(
  props: NodeProps<SingleTrackAudioNodeProps>,
) {
  console.info("single-track-audio props", props);
  return (
    <div className="react-flow__node-default input-node">
      <div>{props.data.label || "No track selected"}</div>
      <div>Time</div>
      <div>
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
