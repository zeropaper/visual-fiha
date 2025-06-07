import { Handle, type NodeProps, Position } from "@xyflow/react";

import type { SystemInputNode as SystemInputNodeType } from "./types";

// @ts-expect-error
export const SystemInputNode: SystemInputNodeType = (
  props: NodeProps<SystemInputNodeType>,
) => {
  // console.info("SystemInputNode", props);
  return (
    // We add this class to use the same styles as React Flow's default nodes.
    <div className="react-flow__node-default input-node">
      {props.data.label && <div>{props.data.label} </div>}

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};
