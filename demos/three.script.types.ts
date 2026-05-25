import * as OriginalTHREE from "three";

declare global {
  export import THREE = OriginalTHREE;
}

globalThis.THREE = OriginalTHREE;
