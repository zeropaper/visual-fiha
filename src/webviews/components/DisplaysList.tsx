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
  // const handleDisplayClick: React.MouseEventHandler = (evt) => {
  //   evt.preventDefault()
  //   window.open(`${displayURL}#${Math.round(Math.random() * 1000)}`, '_blank')
  // }

  return (
    <section id="displays">
      <header>
        <h1>Displays</h1>
      </header>

      <main className="displays-wrapper">
        {items.map((item) => (
          // eslint-disable-next-line react/jsx-props-no-spreading
          <Display key={item.id} {...item} />
        ))}
        <div>
          {/* <a href="#" onClick={handleDisplayClick}>{displayURL}</a> */}
          <a href={`${displayURL}#${Math.round(Math.random() * 1000)}`}>
            {displayURL}
          </a>
        </div>
      </main>
    </section>
  );
};

export default DisplaysList;
