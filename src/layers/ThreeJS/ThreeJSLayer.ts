import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import Layer, { LayerOptions } from '../Layer';
import * as mathTools from '../../utils/mathTools';
import miscTools from '../../utils/miscTools';

export interface ThreeJSLayerOptions extends LayerOptions { }

export default class ThreeJSLayer extends Layer {
  constructor(options: ThreeJSLayerOptions) {
    super(options);

    const { canvas, canvas: { width, height } } = this;

    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      canvas,
    });
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(20, width / height, 1, 1000);

    const { renderer, camera, scene } = this;

    renderer.setClearColor(0x000000, 0);

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
    };
  }

  renderer: THREE.WebGLRenderer;

  camera: THREE.PerspectiveCamera;

  scene: THREE.Scene;

  #update = () => {
    if (!this.camera) return;
    const aspect = this.width / this.height;
    console.info('[ThreeJS] wanted camera aspect', aspect);
    try {
      this.camera.aspect = this.width / this.height;
    } catch (e) {
      console.info('[ThreeJS] cannot set aspect', e.message);
    }
  };

  get width() {
    return this.canvas.width;
  }

  get height() {
    return this.canvas.height;
  }

  set width(width: number) {
    this.canvas.width = width;
    this.renderer.setSize(width, this.canvas.height, false);
    this.#update();
  }

  set height(height: number) {
    this.canvas.height = height;
    this.renderer.setSize(this.canvas.width, height, false);
    this.#update();
  }
}
