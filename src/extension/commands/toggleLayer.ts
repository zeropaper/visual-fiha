import { type VFCommand } from "../../types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const toggleLayer: VFCommand = function (context, extension) {
  return (layerId: string | { id: string }) => {
    console.info("[command] toggleLayer", layerId);

    // const { state: { layers } } = extension;
    // const layerIndex = layers.findIndex((layer) => layer.id === layerId);
    // if (layerIndex < 0) return;

    extension.dispatch({
      type: "toggleLayer",
      payload: typeof layerId === "string" ? layerId : layerId.id,
    });
  };
};

export default toggleLayer;
