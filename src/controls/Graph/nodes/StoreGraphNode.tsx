import { Handle, type Node, type NodeProps, Position } from "@xyflow/react";

type StoreNodeProps = Node<
  {
    label?: string;
    valueNames?: string[];
  },
  "store"
>;

export default function StoreGraphNode(props: NodeProps<StoreNodeProps>) {
  console.info("store props", props);
  return (
    <div className="react-flow__node-default output-node">
      <Handle type="target" position={Position.Top} />
      <div>{props.data.label || "Store"}</div>
    </div>
  );
}
