import type { DisplayState } from "./types";

export function isDisplayState(data: any): data is DisplayState {
  return (
    data &&
    typeof data === "object" &&
    "layers" in data &&
    Array.isArray(data.layers) &&
    "stage" in data &&
    typeof data.stage === "object" &&
    "width" in data.stage &&
    "height" in data.stage
  );
}
