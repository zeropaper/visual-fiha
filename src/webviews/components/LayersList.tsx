/* eslint-disable jsx-a11y/control-has-associated-label */
import * as React from 'react';
import { useSelector } from 'react-redux';
import { AppState, Layer } from '../../types';
import { useToggleLayer, useVSCOpen } from '../ComContext';

const LayerScriptLink = ({
  layer,
  scriptRole,
}: { layer: Layer, scriptRole: 'setup' | 'animation' }) => {
  const open = useVSCOpen();
  // eslint-disable-next-line react/destructuring-assignment
  const contentLength = layer[scriptRole]?.length || 0;
  return (
    <a
      href="#vscode-action"
      onClick={() => open(`/layers/${layer.type}/${layer.id}-${scriptRole}.js`)}
      className={[
        scriptRole,
        !contentLength && 'empty-script',
      ].filter(Boolean).join(' ').trim()}
    >
      {`open ${scriptRole}`}
    </a>
  );
};

const LayersList = () => {
  const { layers } = useSelector((state: AppState) => ({ layers: state.layers }));
  const toggleLayer = useToggleLayer();
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
              <span>{layer.active}</span>
              {' '}
              <span>{layer.id}</span>
              {' '}
              <span>{layer.type}</span>

              <div>
                <LayerScriptLink layer={layer} scriptRole="setup" />
                {' '}
                <LayerScriptLink layer={layer} scriptRole="animation" />
                {' '}
                <button type="button" onClick={() => toggleLayer(layer.id)}>{layer.active ? 'on' : 'off'}</button>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </section>
  );
};

export default LayersList;
