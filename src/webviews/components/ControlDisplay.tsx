import * as React from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '../../types';

const ControlDisplay = () => {
  const server = useSelector((state: AppState) => state.server);
  return (
    <iframe
      title="control"
      src={`http://${server.host}:${server.port}/display/#control`}
      className="control-display"
    />
  );
};

export default ControlDisplay;
