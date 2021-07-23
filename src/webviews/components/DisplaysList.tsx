import * as React from 'react';
import { useSelector } from 'react-redux';
import { WebviewAppState } from '../store';

import Display from './Display';

const DisplaysList = () => {
  const items = useSelector(({ displays }: WebviewAppState) => displays);

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
      </main>
    </section>
  );
};

export default DisplaysList;
