import * as React from "react";
import { useSelector } from "react-redux";
import { type AppState, type Layer } from "../../types";
import { useToggleLayer, useVSCOpen } from "../ComContext";

const LayerScriptLink = ({
  layer,
  scriptRole,
}: {
  layer: Layer;
  scriptRole: "setup" | "animation";
}) => {
  const open = useVSCOpen();
  // eslint-disable-next-line react/destructuring-assignment
  const contentLength = layer[scriptRole]?.length || 0;
  return (
    <a
      href="#vscode-action"
      onClick={async () =>
        await open(`/layers/${layer.type}/${layer.id}-${scriptRole}.js`)
      }
      className={[scriptRole, !contentLength && "empty-script"]
        .filter(Boolean)
        .join(" ")
        .trim()}
    >
      {`open ${scriptRole}`}
    </a>
  );
};

const LayersList = () => {
  const layers = useSelector((state: AppState) => state.layers);
  const toggleLayer = useToggleLayer();
  const toggleLayerId = (id: string) => async () => await toggleLayer(id);
  return (
    <section id="layers">
      <header>
        <h1>Layers</h1>
      </header>
      <main>
        <ul>
          {layers.map((layer) => (
            <li key={layer.id}>
              {/* <pre>{JSON.stringify(layer, null, 2)}</pre> */}
              <span>{layer.active}</span> <span>{layer.id}</span>{" "}
              <span>{layer.type}</span>
              <div>
                <LayerScriptLink layer={layer} scriptRole="setup" />{" "}
                <LayerScriptLink layer={layer} scriptRole="animation" />{" "}
                <button type="button" onClick={toggleLayerId(layer.id)}>
                  {layer.active ? "on" : "off"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </section>
  );
};

export default LayersList;
