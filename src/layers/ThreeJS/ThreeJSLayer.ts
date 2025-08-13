import * as THREE from "three";
import { ColladaLoader } from "three/addons/loaders/ColladaLoader.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";
import { AfterimagePass } from "three/addons/postprocessing/AfterimagePass.js";
import { BloomPass } from "three/addons/postprocessing/BloomPass.js";
import { BokehPass } from "three/addons/postprocessing/BokehPass.js";
import { ClearPass } from "three/addons/postprocessing/ClearPass.js";
import { CubeTexturePass } from "three/addons/postprocessing/CubeTexturePass.js";
import { DotScreenPass } from "three/addons/postprocessing/DotScreenPass.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { FilmPass } from "three/addons/postprocessing/FilmPass.js";
import { GlitchPass } from "three/addons/postprocessing/GlitchPass.js";
import { HalftonePass } from "three/addons/postprocessing/HalftonePass.js";
import { LUTPass } from "three/addons/postprocessing/LUTPass.js";
import { ClearMaskPass } from "three/addons/postprocessing/MaskPass.js";
import { OutlinePass } from "three/addons/postprocessing/OutlinePass.js";
// @ts-expect-error
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { Pass } from "three/addons/postprocessing/Pass.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { RenderPixelatedPass } from "three/addons/postprocessing/RenderPixelatedPass.js";
import { SAOPass } from "three/addons/postprocessing/SAOPass.js";
import { SavePass } from "three/addons/postprocessing/SavePass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { SMAAPass } from "three/addons/postprocessing/SMAAPass.js";
import { SSAARenderPass } from "three/addons/postprocessing/SSAARenderPass.js";
import { SSAOPass } from "three/addons/postprocessing/SSAOPass.js";
import { SSRPass } from "three/addons/postprocessing/SSRPass.js";
import { TAARenderPass } from "three/addons/postprocessing/TAARenderPass.js";
import { TexturePass } from "three/addons/postprocessing/TexturePass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

import * as mathTools from "../../utils/mathTools";
import miscTools from "../../utils/miscTools";
import Layer, { type LayerOptions } from "../Layer";

export interface ThreeJSLayerOptions extends LayerOptions {}

export default class ThreeJSLayer extends Layer {
  readonly type = "threejs";

  constructor(options: ThreeJSLayerOptions) {
    super(options);

    const {
      canvas,
      canvas: { width, height },
    } = this;

    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      canvas,
    });
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(20, width / height, 1, 1000);

    const { renderer, camera, scene } = this;

    renderer.setClearColor(0x000000, 0);
    renderer.setAnimationLoop(() => this.execAnimation());

    camera.position.z = 400;
    camera.position.x = 400;
    camera.position.y = 100;
    camera.lookAt(0, 0, 0);

    this.api = {
      ...mathTools,
      ...miscTools,
      ...super.api,
      THREE,
      camera,
      scene,
      renderer,
      GLTFLoader,
      ColladaLoader,
      SVGLoader,
      FontLoader,
      OBJLoader,
      AfterimagePass,
      BloomPass,
      BokehPass,
      ClearPass,
      CubeTexturePass,
      DotScreenPass,
      EffectComposer,
      FilmPass,
      GlitchPass,
      HalftonePass,
      LUTPass,
      ClearMaskPass,
      OutlinePass,
      OutputPass,
      Pass,
      RenderPass,
      RenderPixelatedPass,
      SAOPass,
      SavePass,
      ShaderPass,
      SMAAPass,
      SSAARenderPass,
      SSAOPass,
      SSRPass,
      TAARenderPass,
      TexturePass,
      UnrealBloomPass,
      clear: this.#clearScene,
    };
  }

  renderer: THREE.WebGLRenderer;

  camera: THREE.PerspectiveCamera;

  scene: THREE.Scene;

  #clearScene = (): void => {
    this.scene.children.forEach((child) => {
      console.info("[ThreeJS] clear scene child", child.name || "no name");
      this.scene.remove(child);
    });
  };

  #update = (): void => {
    // if (!this.camera) return
    try {
      this.camera.aspect = this.width / this.height;
    } catch (e) {
      console.info("[ThreeJS] cannot set aspect", (e as Error).message);
    }
  };

  get width(): number {
    return this.canvas.width;
  }

  set width(width: number) {
    this.canvas.width = width;
    this.renderer.setSize(width, this.canvas.height, false);
    this.#update();
  }

  get height(): number {
    return this.canvas.height;
  }

  set height(height: number) {
    this.canvas.height = height;
    this.renderer.setSize(this.canvas.width, height, false);
    this.#update();
  }
}
