export interface TranspilePayload {
  id: string;
  type: "worker" | "layer";
  role: "setup" | "animation";
  code: string;
  original: string;
}
