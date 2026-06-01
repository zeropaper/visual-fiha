/**
 * PostProcessingBridge - Unified post-processing API for WebGL and WebGPU
 *
 * Abstracts the differences between EffectComposer (WebGL) and
 * WebGPU post-processing node stack, providing a single consistent API.
 *
 * User scripts use:
 *   postProcessing.render()
 *
 * Framework handles:
 *   - Renderer detection
 *   - Implementation switching
 *   - Pass/effect management
 */

import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

/**
 * Detects if renderer is WebGPURenderer
 */
function isWebGPURenderer(renderer: THREE.WebGLRenderer | any): boolean {
  return (
    renderer.backend?.name === "webgpu" || renderer.isWebGPURenderer === true
  );
}

/**
 * Effect configuration passed by user scripts
 */
export interface EffectConfig {
  [key: string]: any;
}

/**
 * PostProcessingBridge - Unified post-processing for WebGL and WebGPU
 *
 * Usage (same on both renderers):
 *   const postProcessing = new PostProcessingBridge(renderer, scene, camera);
 *   postProcessing.addEffect('bloom', { strength: 1.5, radius: 0.4 });
 *   postProcessing.render();
 */
export class PostProcessingBridge {
  private renderer: THREE.WebGLRenderer | any;
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private isWebGPU: boolean;

  // WebGL path: EffectComposer
  private composer: EffectComposer | null = null;

  // WebGPU path: Effect chain (to be implemented)
  private webgpuEffects: Map<string, any> = new Map();

  constructor(
    renderer: THREE.WebGLRenderer | any,
    scene: THREE.Scene,
    camera: THREE.Camera,
  ) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.isWebGPU = isWebGPURenderer(renderer);

    // Initialize based on renderer type
    if (!this.isWebGPU) {
      this.initializeWebGL();
    } else {
      this.initializeWebGPU();
    }
  }

  /**
   * Initialize EffectComposer for WebGL path
   */
  private initializeWebGL(): void {
    this.composer = new EffectComposer(this.renderer);

    // Add base render pass
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    console.info("[PostProcessing] Initialized WebGL (EffectComposer)");
  }

  /**
   * Initialize WebGPU post-processing
   *
   * Note: WebGPU post-processing uses a different architecture.
   * Currently stores effects in a map; full implementation depends on
   * WebGPU rendering approach chosen (node-based, custom passes, etc.)
   */
  private initializeWebGPU(): void {
    this.webgpuEffects.clear();
    console.info("[PostProcessing] Initialized WebGPU post-processing");
  }

  /**
   * Add an effect to the post-processing chain
   *
   * @param name - Effect name (e.g., 'bloom', 'tone-mapping')
   * @param config - Effect-specific configuration
   */
  public addEffect(name: string, config: EffectConfig = {}): void {
    if (this.isWebGPU) {
      this.addWebGPUEffect(name, config);
    } else {
      this.addWebGLEffect(name, config);
    }
  }

  /**
   * Add effect to WebGL composer chain
   */
  private addWebGLEffect(name: string, config: EffectConfig): void {
    if (!this.composer) return;

    switch (name.toLowerCase()) {
      case "bloom":
      case "unrealbloom":
        this.addBloomPass(config);
        break;

      case "tone-mapping":
      case "tonemapping":
        // Tone mapping handled differently - note for later
        console.warn(
          "[PostProcessing] Tone mapping should be set on renderer.toneMapping",
        );
        break;

      case "output":
        this.addOutputPass();
        break;

      default:
        console.warn(`[PostProcessing] Unknown effect for WebGL: ${name}`);
    }
  }

  /**
   * Add effect to WebGPU post-processing
   */
  private addWebGPUEffect(name: string, config: EffectConfig): void {
    // Store effect config; actual rendering handled in render()
    this.webgpuEffects.set(name.toLowerCase(), config);
    console.info(`[PostProcessing] Added WebGPU effect: ${name}`, config);
  }

  /**
   * Add UnrealBloomPass to WebGL chain
   */
  private addBloomPass(config: EffectConfig): void {
    if (!this.composer) return;

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(
        this.renderer.domElement.clientWidth,
        this.renderer.domElement.clientHeight,
      ),
      config.strength ?? 1.5,
      config.radius ?? 0.4,
      config.threshold ?? 0.85,
    );

    this.composer.addPass(bloomPass);
    this.composer.addPass(new OutputPass());

    console.info("[PostProcessing] Added UnrealBloomPass");
  }

  /**
   * Add OutputPass to WebGL chain
   */
  private addOutputPass(): void {
    if (!this.composer) return;

    this.composer.addPass(new OutputPass());

    console.info("[PostProcessing] Added OutputPass");
  }

  /**
   * Render the post-processing chain
   *
   * Call this instead of renderer.render(scene, camera)
   */
  public render(): void {
    if (this.isWebGPU) {
      this.renderWebGPU();
    } else {
      this.renderWebGL();
    }
  }

  /**
   * Render WebGL with EffectComposer
   */
  private renderWebGL(): void {
    if (!this.composer) {
      // Fallback: direct render if composer not initialized
      this.renderer.render(this.scene, this.camera);
      return;
    }

    this.composer.render();
  }

  /**
   * Render WebGPU post-processing
   *
   * For now: render scene directly, then apply effects
   * (Full implementation depends on WebGPU architecture choices)
   */
  private renderWebGPU(): void {
    // Base render
    this.renderer.render(this.scene, this.camera);

    // TODO: Apply stored effects from this.webgpuEffects
    // This depends on:
    // - WebGPU RenderTarget API
    // - Post-processing node architecture choice
    // - How to chain effects (node composition vs sequential rendering)

    if (this.webgpuEffects.size > 0) {
      console.debug(
        "[PostProcessing] WebGPU effects queued (not yet rendered):",
        Array.from(this.webgpuEffects.keys()),
      );
    }
  }

  /**
   * Get number of effects in chain
   */
  public getEffectCount(): number {
    if (this.isWebGPU) {
      return this.webgpuEffects.size;
    }
    return this.composer?.passes.length ?? 0;
  }

  /**
   * Clear all effects (except render pass)
   */
  public clear(): void {
    if (this.isWebGPU) {
      this.webgpuEffects.clear();
    } else if (this.composer) {
      // Keep only the render pass (index 0)
      while (this.composer.passes.length > 1) {
        this.composer.passes.pop();
      }
    }
    console.info("[PostProcessing] Cleared effects");
  }

  /**
   * Get renderer type (for debugging/monitoring)
   */
  public getRendererType(): "webgl" | "webgpu" {
    return this.isWebGPU ? "webgpu" : "webgl";
  }
}

/**
 * Factory function to create appropriate post-processing bridge
 *
 * Usage in ThreeJSLayer:
 *   const postProcessing = createPostProcessingBridge(renderer, scene, camera);
 */
export function createPostProcessingBridge(
  renderer: THREE.WebGLRenderer | any,
  scene: THREE.Scene,
  camera: THREE.Camera,
): PostProcessingBridge {
  return new PostProcessingBridge(renderer, scene, camera);
}
