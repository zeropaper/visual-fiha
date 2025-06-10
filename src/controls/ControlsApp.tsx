import { useState } from "react";
import { ControlDisplay } from "./ControlDisplay";
import styles from "./ControlsApp.module.css";
import { AppFastContextProvider } from "./ControlsContext";
import { Inputs } from "./Inputs";
import { Layers } from "./Layers";
import { ScriptEditor } from "./ScriptEditor";
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
      <div className={styles.sidebar}>
        <ControlDisplay />
        <Stage />
        <WorkerScriptsSelector setCurrentScript={setCurrentScript} />
        <Layers setCurrentScript={setCurrentScript} />
        <Signals />
        <Inputs />
      </div>

      <div className={styles.main}>
        {/*
        <Graph className={styles.flow} />
        */}
        <ScriptEditor
          {...currentScript}
          key={`${currentScript.type}-${currentScript.id}-${currentScript.role}`}
        />
      </div>
    </AppFastContextProvider>
  );
}
