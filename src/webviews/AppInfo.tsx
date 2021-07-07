import * as React from 'react';
import { useSelector } from 'react-redux';
import { WebviewAppState } from './store';

const AppInfo = () => {
  const {
    id, stage, bpm, displayServer,
  } = useSelector((state: WebviewAppState) => state);
  const displayServerURL = `http://${displayServer.host}:${displayServer.port}/`;
  return (
    <section>
      <header>
        <div>
          #
          <span>{id}</span>
          {' '}
          <a href="#vscode-action">edit</a>
        </div>

        <div>
          {`${bpm} BPM `}
          <a href="#vscode-action">edit</a>
        </div>

        <div>
          {`${stage.width} x ${stage.height}`}
        </div>

        <div>
          <a href={displayServerURL}>{displayServerURL}</a>
        </div>
      </header>
    </section>
  );
};

export default AppInfo;
