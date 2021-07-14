import Layer, { LayerOptions } from '../Layer';
import mathTools from '../../utils/mathTools';
import miscTools from '../../utils/miscTools';

export interface ThreeJSLayerOptions extends LayerOptions { }

export default class ThreeJSLayer extends Layer {
  constructor(options: ThreeJSLayerOptions) {
    super(options);
    if (!options.id) throw new Error('Missing id option');
    this.api = {
      ...mathTools,
      ...miscTools,
      ...super.api,
    };
    this.execSetup();
  }
}
