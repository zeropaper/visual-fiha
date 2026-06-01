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
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";
import type { WebGPURenderer } from "three/webgpu";
import mathTools from "../../utils/mathTools";
import miscTools from "../../utils/miscTools";
import Layer, { type LayerOptions } from "../Layer";
import { PostProcessingBridge } from "./PostProcessingBridge";

export interface ThreeJSLayerOptions extends LayerOptions {
  forceWebGL?: boolean;
}

export default class ThreeJSLayer extends Layer {
  readonly type = "threejs";

  #rendererReady = false;
  #forceWebGL: boolean;
  #postProcessing: PostProcessingBridge | null = null;

  constructor(options: ThreeJSLayerOptions) {
    super(options);

    this.#forceWebGL = options.forceWebGL ?? false;

    const {
      canvas,
      canvas: { width, height },
    } = this;

    // Start with WebGL renderer; will be upgraded to WebGPU if available
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      canvas,
    });
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(20, width / height, 1, 1000);

    const { renderer, camera, scene } = this;

    renderer.setClearColor(0x000000, 0);
    renderer.setAnimationLoop(() => {
      // Only execute animation if renderer is initialized
      if (this.#rendererReady) {
        this.execAnimation();
      }
    });

    camera.position.z = 400;
    camera.position.x = 400;
    camera.position.y = 100;
    camera.lookAt(0, 0, 0);

    // Initialize the API with tools and renderer references
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
      ...BufferGeometryUtils,
      clear: this.#clearScene,
      postProcessing: null as any, // Will be set after renderer initialization
    };

    // Initialize renderer asynchronously
    this.#initializeRenderer()
      .then(() => this.#setupPostProcessing())
      .catch((error) => {
        console.warn(
          "[ThreeJS] Failed to initialize WebGPU renderer, continuing with WebGL:",
          error,
        );
        this.#rendererReady = true;
        this.#setupPostProcessing();
      });
  }

  /**
   * Tries to upgrade to WebGPURenderer if available, otherwise keeps WebGL fallback
   */
  async #initializeRenderer(): Promise<void> {
    if (this.#forceWebGL) {
      this.#rendererReady = true;
      return;
    }

    try {
      // Attempt to load WebGPURenderer
      const { WebGPURenderer: WGPURenderer } = await import("three/webgpu");

      const {
        canvas,
        canvas: { width, height },
      } = this;

      // Create new WebGPU renderer with same canvas
      const newRenderer = new WGPURenderer({
        alpha: true,
        canvas,
      });

      // Initialize WebGPU asynchronously
      await newRenderer.init();

      // Replace the WebGL renderer with WebGPU renderer
      this.renderer = newRenderer;
      this.renderer.setClearColor(0x000000, 0);
      this.renderer.setAnimationLoop(() => {
        if (this.#rendererReady) {
          this.execAnimation();
        }
      });
      this.renderer.setSize(width, height, false);

      console.info("[ThreeJS] WebGPU renderer initialized successfully");
    } catch (error) {
      console.info(
        "[ThreeJS] WebGPU not available, using WebGL 2 fallback:",
        error,
      );
    }

    this.#rendererReady = true;
  }

  /**
   * Setup post-processing bridge after renderer is ready
   */
  #setupPostProcessing(): void {
    this.#postProcessing = new PostProcessingBridge(
      this.renderer,
      this.scene,
      this.camera,
    );

    // Update the API with post-processing instance
    if (this.api) {
      this.api.postProcessing = this.#postProcessing;
    }

    console.info(
      `[ThreeJS] Post-processing bridge initialized (${this.#postProcessing.getRendererType()})`,
    );
  }

  /**
   * Renderer instance - can be either WebGPURenderer or WebGLRenderer
   * WebGPURenderer is used if available, otherwise falls back to WebGLRenderer
   */
  renderer:
    | (THREE.WebGLRenderer & {
        init?: () => Promise<void>;
      })
    | WebGPURenderer;

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
