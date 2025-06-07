import {
  Background,
  Controls,
  MiniMap,
  type OnConnect,
  ReactFlow,
  addEdge,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";

import styles from "./Graph.module.css";

import { useCallback } from "react";
import { useAppFastContextFields } from "../ControlsContext";
import { edgeTypes, initialEdges } from "./edges";
import { initialNodes, nodeTypes } from "./nodes";

export default function Graph({ className }: { className?: string }) {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((edges) => addEdge(connection, edges)),
    [setEdges],
  );
  // const {
  //   inputs: { get: inputs, set: setInputs } = { get: [], set: () => {} },
  //   signals: { get: signals, set: setSignals } = { get: [], set: () => {} },
  // } = useAppFastContextFields(["inputs", "signals"]);
  // console.info({
  //   inputs,
  //   signals,
  //   nodes,
  //   edges,
  // });

  return (
    <ReactFlow
      className={[className, styles.graph].filter(Boolean).join(" ")}
      nodes={nodes}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      edges={edges}
      edgeTypes={edgeTypes}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      fitView
    >
      <Background />
      <MiniMap />
      <Controls />
    </ReactFlow>
  );
}
