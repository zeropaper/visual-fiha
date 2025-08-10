import { LoadingFallback } from "@ui/LoadingFallback";
import { SidebarTabs } from "@ui/SidebarTabs";
import { useIsMobile } from "@utils/useIsMobile";
import {
  AudioLinesIcon,
  FileIcon,
  KeyboardMusicIcon,
  LayersIcon,
  MonitorIcon,
} from "lucide-react";
import { lazy, Suspense, useCallback, useState } from "react";
import styles from "./ControlsApp.module.css";
import { AudioSetupProvider } from "./contexts/AudioSetupContext";
import { AppFastContextProvider } from "./contexts/ControlsContext";
import { FileSystemProvider } from "./contexts/FileSystemContext";
import { Assets } from "./features/Assets/Assets";
import { ControlDisplay } from "./features/ControlDisplay/ControlDisplay";
import { Displays } from "./features/Displays/Displays";
import type { DocTopic } from "./features/Help/Help";
import { Inputs } from "./features/Inputs/Inputs";
import { MIDIBridge } from "./features/Inputs/MIDIBridge";
import { Intro } from "./features/Intro/Intro";
import { Layers } from "./features/Layers/Layers";
import { MobileFallback } from "./features/MobileFallback/MobileFallback";
import { Timeline } from "./features/Timeline/Timeline";
import Menu from "./Menu";

const ScriptEditor = lazy(() =>
  import("./features/ScriptEditor/ScriptEditor").then((module) => ({
    default: module.ScriptEditor,
  })),
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

  const tabs = {
    layers: {
      title: "Layers",
      icon: <LayersIcon />,
      content: (
        <Layers setCurrentScript={setCurrentScript} {...currentScript} />
      ),
    },
    audio: {
      title: "Audio",
      icon: <AudioLinesIcon />,
      content: <Inputs />,
    },
    assets: {
      title: "Assets",
      icon: <FileIcon />,
      content: <Assets />,
    },
    midi: {
      title: "MIDI",
      icon: <KeyboardMusicIcon />,
      content: <MIDIBridge />,
    },
    displays: {
      title: "Displays",
      icon: <MonitorIcon />,
      content: <Displays />,
    },
  };
  const [currentTab, setCurrentTab] = useState<keyof typeof tabs>("layers");

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
                {/* <WorkerScriptsSelector setCurrentScript={setCurrentScript} /> */}
                <Menu />
              </>
            )}
          </header>
          <Suspense fallback={<LoadingFallback />}>
            <div className={isMobile ? styles.appMobile : styles.app}>
              {isMobile ? (
                <MobileFallback />
              ) : (
                <>
                  <div className={styles.sidebar}>
                    <div className={`${styles.controlDisplay} control-display`}>
                      <ControlDisplay />
                    </div>
                    <SidebarTabs
                      tabs={tabs}
                      currentTab={currentTab}
                      setCurrentTab={setCurrentTab}
                    />
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
                  <Intro
                    setSidebarTab={setCurrentTab as (tab: string) => void}
                  />
                </>
              )}
            </div>
          </Suspense>
        </AudioSetupProvider>
      </FileSystemProvider>
    </AppFastContextProvider>
  );
}
