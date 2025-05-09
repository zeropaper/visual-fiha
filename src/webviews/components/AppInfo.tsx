import * as React from "react";
import { useSelector } from "react-redux";
import { useVSCOpen } from "../contexts/ComContext";
import type { WebviewAppState } from "../store";

const AppInfo = () => {
  const {
    id,
    stage,
    // bpm: { count: bpm },
    // server,
  } = useSelector((state: WebviewAppState) => state);
  const open = useVSCOpen();

  // const serverURL = `http://${server.host}:${server.port}`;

  const handleRCOpen = () => {
    console.info("open fiha.json", open);
    open("fiha.json");
  };

  return (
    <section id="app-info">
      <header>
        <h1>{`# ${id}`}</h1>
        {/* biome-ignore lint/a11y/useValidAnchor: <explanation> */}
        <a onClick={handleRCOpen} href="#vscode-action">
          {"open "}
          <code>fiha.json</code>
        </a>
      </header>
      <main>
        <dl>
          {/* <dt>BPM:</dt>
          <dd>{bpm}</dd> */}

          <dt>Stage:</dt>
          <dd>{`${stage.width}x${stage.height}`}</dd>

          {/* <dt>Display:</dt>
          <dd><a href={`${serverURL}/display/`}>{`${serverURL}/display/`}</a></dd> */}

          {/* <dt>Capture:</dt>
          <dd><a href={`${serverURL}/capture/`}>{`${serverURL}/capture/`}</a></dd> */}
        </dl>
      </main>
    </section>
  );
};

export default AppInfo;
