import { useCallback, useState } from "react";
import { Suspense, lazy } from "react";
import { ControlDisplay } from "./ControlDisplay";
import styles from "./ControlsApp.module.css";
import { AppFastContextProvider } from "./ControlsContext";
import { DisplaysControl } from "./DisplaysControl";
import { Layers } from "./Layers";
import { Inputs } from "./inputs/Inputs";
const ScriptEditor = lazy(() =>
  import("./ScriptEditor").then((module) => ({ default: module.ScriptEditor })),
);
import { useIsMobile } from "../utils/useIsMobile";
import { FileSystemProvider } from "./FileSystemContext";
import Menu from "./Menu";
import { Stage } from "./Stage";
import { Timeline } from "./Timeline";
import { WorkerScriptsSelector } from "./WorkerScriptsSelector";
import { AudioSetupProvider } from "./inputs/AudioSetupContext";

export default function ControlsApp() {
  const [currentScript, setCurrentScript] = useState<{
    id: string;
    role: "animation" | "setup";
    type: "worker" | "layer";
  }>({
    id: "",
    type: "worker",
    role: "setup",
  });

  const [showHelp, setShowHelp] = useState<boolean>(false);
  const toggleHelp = useCallback(() => setShowHelp((prev) => !prev), []);
  const isMobile = useIsMobile();

  return (
    <AppFastContextProvider>
      <FileSystemProvider>
        <AudioSetupProvider>
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
            {isMobile ? null : (
              <>
                <Stage />
                <WorkerScriptsSelector setCurrentScript={setCurrentScript} />

                <Menu />
              </>
            )}
          </header>
          <div className={isMobile ? styles.appMobile : styles.app}>
            <Suspense fallback={<div>Loading...</div>}>
              {isMobile ? (
                <div className={styles.mobileWarning}>
                  <div>
                    This app is not intended for mobile devices.
                    <br />
                    Please use a desktop browser for the best experience.
                  </div>
                </div>
              ) : (
                <>
                  <div className={styles.sidebar}>
                    <ControlDisplay />
                    <div className={styles.sidebarScrollable}>
                      <div className={styles.sidebarScrollableInner}>
                        <DisplaysControl />

                        <Layers setCurrentScript={setCurrentScript} />
                        <Inputs />
                      </div>
                    </div>
                  </div>

                  <div className={styles.main}>
                    <ScriptEditor
                      {...currentScript}
                      key={`${currentScript.type}-${currentScript.id}-${currentScript.role}`}
                      onSwitchRole={() =>
                        setCurrentScript((prev) => ({
                          ...prev,
                          role:
                            prev.role === "animation" ? "setup" : "animation",
                        }))
                      }
                      onToggleHelp={toggleHelp}
                      showHelp={showHelp}
                    />
                  </div>

                  <Timeline className={styles.timeline} />
                </>
              )}
            </Suspense>
          </div>
        </AudioSetupProvider>
      </FileSystemProvider>
    </AppFastContextProvider>
  );
}
