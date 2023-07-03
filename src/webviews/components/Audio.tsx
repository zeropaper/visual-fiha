import * as React from "react";
import { useSelector } from "react-redux";
import { useSetBPM } from "../ComContext";
import { type WebviewAppState } from "../store";

const defaultState = {
  lastMeasure: 0,
  measuresCount: 0,
  seriesStart: 0,
};

const Audio = () => {
  const {
    bpm: { count: bpm },
    server,
  } = useSelector((state: WebviewAppState) => state);
  const setBPM = useSetBPM();

  const [{ lastMeasure, measuresCount, seriesStart }, setState] =
    React.useState(defaultState);
  const serverURL = `http://${server.host}:${server.port}`;

  const openCaptureLink = (
    <a
      href={`${serverURL}/capture/`}
      // target="_blank"
      // rel="noreferrer"
    >
      {`${serverURL}/capture/`}
    </a>
  );

  const newBPM = Math.round(
    60000 / ((Date.now() - seriesStart) * (1 / measuresCount))
  );

  const handleBPMClick = () => {
    const now = Date.now();
    if (now - lastMeasure > 2000) {
      setState({
        lastMeasure: now,
        measuresCount: 0,
        seriesStart: now,
      });
      return;
    }

    if (measuresCount > 2) {
      setBPM(newBPM);
    }

    setState({
      lastMeasure: now,
      measuresCount: measuresCount + 1,
      seriesStart: seriesStart || now,
    });
  };

  return (
    <section id="audio">
      <header>
        <h1>Audio</h1>

        {openCaptureLink}
      </header>

      <main>
        <div>
          {`BPM: ${bpm}`}

          <button
            style={{
              borderRadius: 40,
              margin: 20,
              width: 60,
              height: 60,
            }}
            type="button"
            onClick={handleBPMClick}
          >
            {newBPM}
          </button>
        </div>
        <div>visualization</div>
      </main>
    </section>
  );
};

export default Audio;
