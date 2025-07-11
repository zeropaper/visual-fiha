import type { PerspectiveCamera, Scene, WebGLRenderer } from "three";

declare class Loader {
  load(
    url: string,
    onLoad: (gltf: any) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (error: Error) => void,
  ): void;
}

declare global {
  const scene: Scene;
  const camera: PerspectiveCamera;
  const renderer: WebGLRenderer;
  const GLTFLoader: typeof Loader;
}
