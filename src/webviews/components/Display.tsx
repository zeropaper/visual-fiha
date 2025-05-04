import * as React from "react";
import type { DisplayBase } from "../../types";

export interface DisplayProps extends DisplayBase {}

const Display = ({ id, width = 1, height = 1 }: DisplayProps) => (
  <div
    className="display"
    style={{ aspectRatio: (width / height).toFixed(2), maxWidth: "10%" }}
  >
    {id}
    <div>{`${width} x ${height}`}</div>
  </div>
);

export default Display;
