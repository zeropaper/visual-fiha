import * as React from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '../../types';

const ControlDisplay = () => {
  const info = useSelector((state: AppState) => ({ ...state.server, ...state.stage }));
  return (
    <iframe
      style={{ aspectRatio: `${info.width / info.height}` }}
      title="control"
      src={`http://${info.host}:${info.port}/display/#control`}
      className="control-display"
    />
  );
};

export default ControlDisplay;
