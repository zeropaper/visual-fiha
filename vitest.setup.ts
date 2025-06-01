// Patch jsdom's HTMLCanvasElement to use node-canvas for getContext in tests
import { Canvas } from 'canvas';

if (typeof window !== 'undefined' && window.HTMLCanvasElement) {
  window.HTMLCanvasElement.prototype.getContext = function getContext(type) {
    // @ts-expect-error: patching for test environment
    if (!this.__node_canvas_instance) {
      // @ts-expect-error: patching for test environment
      this.__node_canvas_instance = new Canvas(this.width, this.height);
    }
    // @ts-expect-error: patching for test environment
    return this.__node_canvas_instance.getContext(type);
  };
  window.HTMLCanvasElement.prototype.toDataURL = function toDataURL() {
    // @ts-expect-error: patching for test environment
    if (!this.__node_canvas_instance) {
      // @ts-expect-error: patching for test environment
      this.__node_canvas_instance = new Canvas(this.width, this.height);
    }
    // @ts-expect-error: patching for test environment
    return this.__node_canvas_instance.toDataURL();
  };
}
