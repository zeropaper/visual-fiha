/**
 * @file threeTools.ts
 * This file is aimed at being used in the Monaco editor for the typescript extraLibs
 */
import type * as THREE from "three";

declare global {
  // make the THREE namespace available globally
  // const THREE: typeof import("three");
  const scene: THREE.Scene;
  const camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  const renderer: THREE.WebGLRenderer;
}
