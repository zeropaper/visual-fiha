import type { Edge, EdgeTypes } from "@xyflow/react";

export const initialEdges = [
  {
    id: "b-left->c",
    source: "b",
    target: "c",
    animated: true,
    sourceHandle: "left",
  },
  {
    id: "b-right->c",
    source: "b",
    target: "c",
    animated: true,
    sourceHandle: "right",
  },
  { id: "b->d", source: "b", target: "d" },
  { id: "c->d", source: "c", target: "d", animated: true },
] satisfies Edge[];

export const edgeTypes = {
  // Add your custom edge types here!
} satisfies EdgeTypes;
