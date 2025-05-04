import type { VFCommand } from "../../types";

const toggleLayer: VFCommand =
  (context, extension) => (layerId: string | { id: string }) => {
    console.info("[command] toggleLayer", layerId);

    // const { state: { layers } } = extension;
    // const layerIndex = layers.findIndex((layer) => layer.id === layerId);
    // if (layerIndex < 0) return;

    extension.dispatch({
      type: "toggleLayer",
      payload: typeof layerId === "string" ? layerId : layerId.id,
    });
  };

export default toggleLayer;
