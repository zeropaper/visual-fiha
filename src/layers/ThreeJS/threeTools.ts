import type {
  AxesHelper,
  GridHelper,
  PerspectiveCamera,
  Scene,
  SpotLightHelper,
  WebGLRenderer,
} from "three";
import type * as OG from "three";

declare global {
  const scene: Scene;
  const camera: PerspectiveCamera;
  const renderer: WebGLRenderer;

  // // @ts-expect-error
  // const THREE: {
  //   GridHelper: typeof OG.GridHelper;
  //   SpotLightHelper: typeof OG.SpotLightHelper;
  //   AxesHelper: typeof OG.AxesHelper;
  // }
}
