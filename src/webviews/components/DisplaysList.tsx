import * as React from "react";
import { useSelector } from "react-redux";
import { type WebviewAppState } from "../store";

import Display from "./Display";

const DisplaysList = () => {
  const {
    displays: items,
    host,
    port,
  } = useSelector(({ displays, server }: WebviewAppState) => ({
    displays,
    ...server,
  }));

  const displayURL = `http://${host}:${port}/display/`;

  return (
    <>
      <div className="displays-wrapper">
        {items.map((item) => (
          <Display key={item.id} {...item} />
        ))}
      </div>
      <div className="button-wrapper">
        <a
          className="new-display monaco-text-button button"
          href={`${displayURL}`}
        >
          {displayURL}
        </a>
      </div>
    </>
  );
};

export default DisplaysList;
