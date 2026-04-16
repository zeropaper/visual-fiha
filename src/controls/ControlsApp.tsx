import { LoadingFallback } from "@ui/LoadingFallback";
import { SidebarTabs } from "@ui/SidebarTabs";
import { VFLogo } from "@ui/VFLogo";
import { useIsMobile } from "@utils/useIsMobile";
import {
  AudioLinesIcon,
  FileIcon,
  KeyboardMusicIcon,
  LayersIcon,
  MonitorIcon,
} from "lucide-react";
import { lazy, Suspense, useCallback, useState } from "react";
import { Toaster } from "sonner";
import type { ScriptInfo } from "src/types";
import styles from "./ControlsApp.module.css";
import { AudioSetupProvider } from "./contexts/AudioSetupContext";
import { AppFastContextProvider } from "./contexts/ControlsContext";
import { FileSystemProvider } from "./contexts/FileSystemContext";
import { Assets } from "./features/Assets/Assets";
import { Audio } from "./features/Audio/Audio";
import { ControlDisplay } from "./features/ControlDisplay/ControlDisplay";
import { Displays } from "./features/Displays/Displays";
import type { DocTopic } from "./features/Help/Help";
import { Intro } from "./features/Intro/Intro";
import { Layers } from "./features/Layers/Layers";
import { MIDIBridge } from "./features/MIDIBridge/MIDIBridge";
import { MobileFallback } from "./features/MobileFallback/MobileFallback";
import { Timeline } from "./features/Timeline/Timeline";
import Menu from "./Menu";

const ScriptEditor = lazy(() =>
  import("./features/ScriptEditor/ScriptEditor").then((module) => ({
    default: module.ScriptEditor,
  })),
);

export default function ControlsApp() {
  console.log("[ControlsApp] Initializing controls application");
  const [currentScript, _setCurrentScript] = useState<ScriptInfo>(
    JSON.parse(
      localStorage.getItem("currentScript") ||
        '{"id": "", "role": "animation", "type": ""}',
    ),
  );
  console.log("[ControlsApp] Current script loaded:", currentScript);
  const setCurrentScript = useCallback((updated: ScriptInfo) => {
    _setCurrentScript(updated);
    localStorage.setItem("currentScript", JSON.stringify(updated));
  }, []);

  const [docTopic, setDocTopic] = useState<DocTopic | null>(null);
  const toggleHelp = useCallback(
    () =>
      setDocTopic((prev) =>
        prev || !currentScript.type ? null : `${currentScript.type}-api`,
      ),
    [currentScript.type],
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
      content: <Audio />,
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
  const [currentTab, _setCurrentTab] = useState<keyof typeof tabs>(
    (localStorage.getItem("currentTab") as keyof typeof tabs) || "layers",
  );
  const setCurrentTab = useCallback((tab: keyof typeof tabs) => {
    _setCurrentTab(tab);
    localStorage.setItem("currentTab", tab);
  }, []);

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
              <VFLogo className={styles.logo} width={32} height={32} />

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
          <Toaster />
        </AudioSetupProvider>
      </FileSystemProvider>
    </AppFastContextProvider>
  );
}
