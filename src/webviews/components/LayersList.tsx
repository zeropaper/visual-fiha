import * as React from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '../../types';

const LayersList = () => {
  const { layers } = useSelector((state: AppState) => ({ layers: state.layers }));
  return (
    <div>
      <h1>Layers List</h1>
      <ul>
        {layers.map((layer) => (
          <li key={layer.id}>
            <h2>{layer.id}</h2>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LayersList;
