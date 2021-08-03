import * as React from 'react';
import { useSelector } from 'react-redux';
import { WebviewAppState } from '../store';

import Display from './Display';

const DisplaysList = () => {
  const {
    displays: items,
    host,
    port,
  } = useSelector(({
    displays,
    server,
  }: WebviewAppState) => ({ displays, ...server }));

  const displayURL = `http://${host}:${port}/display/`;

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
          <a href={displayURL}>{displayURL}</a>
        </div>
      </main>
    </section>
  );
};

export default DisplaysList;
