import { type VFCommand } from '../../types'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const toggleLayer: VFCommand = function (context, extension) {
  return (layerId) => {
    console.info('[command] toggleLayer', extension, layerId)

    // const { state: { layers } } = extension;
    // const layerIndex = layers.findIndex((layer) => layer.id === layerId);
    // if (layerIndex < 0) return;

    extension.dispatch({
      type: 'toggleLayer',
      payload: layerId
    })
  }
}

export default toggleLayer
