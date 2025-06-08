import { useState } from "react";
import { ControlDisplay } from "./ControlDisplay";
import styles from "./ControlsApp.module.css";
import { AppFastContextProvider } from "./ControlsContext";
import { Inputs } from "./Inputs";
import { Layers } from "./Layers";
import { ScriptEditor } from "./ScriptEditor";
import { Signals } from "./Signals";

export default function ControlsApp() {
  const [currentScript, setCurrentScript] = useState<{
    id: string;
    role: "animation" | "setup";
    type: "worker" | "layer";
  }>({
    id: "worker",
    type: "worker",
    role: "animation",
  });
  return (
    <AppFastContextProvider>
      <div className={styles.sidebar}>
        <ControlDisplay />
        <Layers setCurrentScript={setCurrentScript} />
        <Signals />
        <Inputs />
      </div>

      <div className={styles.main}>
        {/*
        <Graph className={styles.flow} />
        */}
        <ScriptEditor {...currentScript} />
      </div>
    </AppFastContextProvider>
  );
}
