import * as React from "react";
import { useSelector } from "react-redux";
import { type AppState } from "../../types";

const ControlDisplay = () => {
  const info = useSelector((state: AppState) => ({
    ...state.server,
    ...state.stage,
  }));
  const src = `http://${info.host}:${info.port}/display/#control`;
  return (
    <iframe
      style={{ aspectRatio: `${info.width / info.height}` }}
      title="control"
      src={src}
      className="control-display"
    />
  );
};

export default ControlDisplay;
