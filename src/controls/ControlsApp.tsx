import { useIsMobile } from "@utils/useIsMobile";
import { useCallback, useState } from "react";
import { Suspense, lazy } from "react";
import { ControlDisplay } from "./ControlDisplay";
import styles from "./ControlsApp.module.css";
import { DisplaysControl } from "./DisplaysControl";
import Menu from "./Menu";
import { Stage } from "./Stage";
import { Timeline } from "./Timeline";
import { WorkerScriptsSelector } from "./WorkerScriptsSelector";
import { AudioSetupProvider } from "./contexts/AudioSetupContext";
import { ChatsProvider, localStorageAdapter } from "./contexts/ChatsContext";
import { AppFastContextProvider } from "./contexts/ControlsContext";
import { EditorContextProvider } from "./contexts/EditorContext";
import { FileSystemProvider } from "./contexts/FileSystemContext";
import type { DocTopic } from "./features/Help/Help";
import { Inputs } from "./features/Inputs/Inputs";
import { Layers } from "./features/Layers/Layers";
const ScriptEditor = lazy(() =>
  import("./ScriptEditor").then((module) => ({ default: module.ScriptEditor })),
);

export default function ControlsApp() {
  const [currentScript, _setCurrentScript] = useState<{
    id: string;
    role: "animation" | "setup";
    type: "worker" | "layer";
  }>(
    JSON.parse(
      localStorage.getItem("currentScript") ||
        '{"id": "", "role": "animation", "type": ""}',
    ),
  );
  const setCurrentScript = useCallback(
    (updated: {
      id: string;
      role: "animation" | "setup";
      type: "worker" | "layer";
    }) => {
      _setCurrentScript(updated);
      localStorage.setItem("currentScript", JSON.stringify(updated));
    },
    [],
  );

  const [docTopic, setDocTopic] = useState<DocTopic | null>(null);
  const toggleHelp = useCallback(
    () => setDocTopic((prev) => (prev ? null : "topics")),
    [],
  );
  const isMobile = useIsMobile();

  return (
    <AppFastContextProvider>
      <FileSystemProvider>
        <AudioSetupProvider
          defaultAudioFiles={[
            // "/audio/bas_traps_inst_mix_ab_oz_150/bs_24.mp3",
            // "/audio/bas_traps_inst_mix_ab_oz_150/dr1_01.mp3",
            // "/audio/bas_traps_inst_mix_ab_oz_150/dr2_28.mp3",
            // "/audio/bas_traps_inst_mix_ab_oz_150/dr3_07.mp3",
            // "/audio/bas_traps_inst_mix_ab_oz_150/noise_01.mp3",
            // "/audio/bas_traps_inst_mix_ab_oz_150/syn1_52.mp3",
            // "/audio/bas_traps_inst_mix_ab_oz_150/syn2_39.mp3",
            "/audio/brass_fire_150/bs_88.mp3",
            "/audio/brass_fire_150/dr1_84.mp3",
            "/audio/brass_fire_150/dr2_60-01.mp3",
            "/audio/brass_fire_150/dr3_24.mp3",
            "/audio/brass_fire_150/syn1_167.mp3",
            "/audio/brass_fire_150/syn2_142.mp3",
            "/audio/brass_fire_150/syn3_111.mp3",
            "/audio/brass_fire_150/syn4_60.mp3",
          ]}
        >
          <EditorContextProvider>
            <ChatsProvider
              storageAdapter={localStorageAdapter}
              id={`${currentScript.type}-${currentScript.id}`}
            >
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
                    <WorkerScriptsSelector
                      setCurrentScript={setCurrentScript}
                    />

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

                            <Layers
                              setCurrentScript={setCurrentScript}
                              {...currentScript}
                            />
                            <Inputs />
                          </div>
                        </div>
                      </div>

                      <div className={styles.main}>
                        <ScriptEditor
                          {...currentScript}
                          key={`${currentScript.type}-${currentScript.id}-${currentScript.role}`}
                          onSwitchRole={() =>
                            setCurrentScript({
                              ...currentScript,
                              role:
                                currentScript.role === "animation"
                                  ? "setup"
                                  : "animation",
                            })
                          }
                          onToggleHelp={toggleHelp}
                          onSetDocTopic={setDocTopic}
                          docTopic={docTopic}
                        />
                      </div>

                      <Timeline className={styles.timeline} />
                    </>
                  )}
                </Suspense>
              </div>
            </ChatsProvider>
          </EditorContextProvider>
        </AudioSetupProvider>
      </FileSystemProvider>
    </AppFastContextProvider>
  );
}
