import type { PerspectiveCamera, Scene, WebGLRenderer } from "three";
// @ts-ignore
import type { Pass } from "three/addons/postprocessing/Pass";

// import { Loader } from "three/addons/loaders/Loader.js";
declare class Loader {
  load(
    url: string,
    onLoad: (model: any) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (error: Error) => void,
  ): void;
}

declare global {
  const scene: Scene;
  const camera: PerspectiveCamera;
  const renderer: WebGLRenderer;

  const GLTFLoader: typeof Loader;
  const ColladaLoader: typeof Loader;
  const SVGLoader: typeof Loader;
  const FontLoader: typeof Loader;
  const OBJLoader: typeof Loader;

  const AfterimagePass: typeof Pass;
  const BloomPass: typeof Pass;
  const BokehPass: typeof Pass;
  const ClearPass: typeof Pass;
  const CubeTexturePass: typeof Pass;
  const DotScreenPass: typeof Pass;
  const EffectComposer: typeof Pass;
  const FilmPass: typeof Pass;
  const GlitchPass: typeof Pass;
  const HalftonePass: typeof Pass;
  const LUTPass: typeof Pass;
  const ClearMaskPass: typeof Pass;
  const OutlinePass: typeof Pass;
  const OutputPass: typeof Pass;
  const RenderPass: typeof Pass;
  const RenderPixelatedPass: typeof Pass;
  const SAOPass: typeof Pass;
  const SavePass: typeof Pass;
  const ShaderPass: typeof Pass;
  const SMAAPass: typeof Pass;
  const SSAARenderPass: typeof Pass;
  const SSAOPass: typeof Pass;
  const SSRPass: typeof Pass;
  const TAARenderPass: typeof Pass;
  const TexturePass: typeof Pass;
  const UnrealBloomPass: typeof Pass;
}
