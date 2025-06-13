import { useState } from "react";
import { Suspense, lazy } from "react";
import { ControlDisplay } from "./ControlDisplay";
import styles from "./ControlsApp.module.css";
import { AppFastContextProvider } from "./ControlsContext";
import { DisplaysControl } from "./DisplaysControl";
import { Inputs } from "./Inputs";
import { Layers } from "./Layers";
const ScriptEditor = lazy(() =>
  import("./ScriptEditor").then((module) => ({ default: module.ScriptEditor })),
);
import { Signals } from "./Signals";
import { Stage } from "./Stage";
import { WorkerScriptsSelector } from "./WorkerScriptsSelector";

export default function ControlsApp() {
  const [currentScript, setCurrentScript] = useState<{
    id: string;
    role: "animation" | "setup";
    type: "worker" | "layer";
  }>({
    id: "default-canvas",
    type: "layer",
    role: "animation",
  });
  return (
    <AppFastContextProvider>
      <header className={styles.header}>
        <div className={styles.branding}>
          <svg
            className={styles.logo}
            xmlns="http://www.w3.org/2000/svg"
            version="1.1"
            viewBox="0 0 1000 1000"
            height="32"
            width="32"
          >
            <title>Visual Fiha logo</title>
            <path
              d="m 42.144772,100.70423 460.738378,798.02231 137.92084,-238.11891 -100.83949,0 -83.42113,-144.48961 267.68175,0 78.38889,-135.77355 -424.45952,0 -83.42215,-144.49139 591.30382,0 78.02825,-135.14885 z"
              fill="currentColor"
            />
          </svg>

          <h1>Visual Fiha</h1>
        </div>
      </header>
      <div className={styles.app}>
        <div className={styles.sidebar}>
          <ControlDisplay />
          <Stage />
          <DisplaysControl />
          <WorkerScriptsSelector setCurrentScript={setCurrentScript} />
          <Layers setCurrentScript={setCurrentScript} />
          <Signals />
          <Inputs />
        </div>

        <div className={styles.main}>
          <Suspense fallback={<div>Loading...</div>}>
            {/*
          <Graph className={styles.flow} />
          */}
            <ScriptEditor
              {...currentScript}
              key={`${currentScript.type}-${currentScript.id}-${currentScript.role}`}
            />
          </Suspense>
        </div>
      </div>
    </AppFastContextProvider>
  );
}
