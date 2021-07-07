import * as React from 'react';
import { useSelector } from 'react-redux';
import { WebviewAppState } from '../store';

import Display from './Display';

const DisplaysList = () => {
  const items = useSelector(({ displays }: WebviewAppState) => displays);

  return (
    <section>
      <header>Displays</header>

      <main>
        {items.map(({ id }) => (
          <Display key={id} id={id} />
        ))}
      </main>
    </section>
  );
};

export default DisplaysList;
