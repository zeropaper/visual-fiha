import type * as _monaco from "monaco-editor";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./ScriptEditor.module.css";

import { Button, buttonStyles } from "@ui/Button";
import scriptableTypes from "@utils/Scriptable.editor.types.editor-types.txt?raw";
import mathTypes from "@utils/mathTools.editor-types.txt?raw";
import { HelpCircleIcon } from "lucide-react";
import { AIAssistant } from "./AIAssistant/AIAssistant";
import { LandingContent } from "./LandingContent";
import { extraLibs } from "./ScriptEditor.extraLibs";
import { type DocTopic, Help } from "./features/Help/Help";
import { useCode } from "./hooks/useCode";

function useTranspile() {
  const transpilationWorkerRef = useRef<Worker | null>(null);

  useEffect(() => {
    const worker = new Worker(
      new URL("./tsTranspile.worker.ts", import.meta.url),
      { type: "classic" },
    );
    if (transpilationWorkerRef.current) {
      transpilationWorkerRef.current.terminate();
    }
    transpilationWorkerRef.current = worker;
    return () => {
      worker.terminate();
    };
  }, []);

  return (code: string, type: string, role: string, id: string) => {
    if (!transpilationWorkerRef.current) {
      console.warn("[ScriptEditor] Transpilation worker is not initialized.");
      return;
    }
    transpilationWorkerRef.current.postMessage({ code, type, role, id });
  };
}

let monacoInstance: typeof _monaco | null = null;
export function ScriptEditor({
  role = "animation",
  type = "worker",
  id = "worker",
  onSwitchRole,
  onToggleHelp = () => {},
  onSetDocTopic = () => {},
  docTopic = null,
}: {
  role?: "setup" | "animation";
  type?: "worker" | "layer";
  id?: string | "worker";
  onSwitchRole: () => void;
  onToggleHelp?: () => void;
  onSetDocTopic?: (topic: DocTopic | null) => void;
  docTopic?: DocTopic | null;
}) {
  const language = "typescript";
  const theme = "vs-dark"; // Options: 'vs-dark', 'vs-light', 'hc-black'
  const [{ code: rawTSCode, layerType }, setCode] = useCode(role, type, id);
  const transpile = useTranspile();

  const onChange = useCallback(
    (code: string) => {
      setCode(code);
      transpile(code, type, role, id);
    },
    [type, role, id, transpile, setCode],
  );

  const editorContainerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<_monaco.editor.IStandaloneCodeEditor | null>(null);
  const subscriptionRef = useRef<_monaco.IDisposable | null>(null);
  const [isMonacoReady, setIsMonacoReady] = useState(false);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const handleResize = () => {
    if (editorRef.current) {
      editorRef.current.layout();
    }
  };

  useEffect(() => {
    // Initialize Monaco Environment and Workers
    // This needs to be done only once for the entire application.
    // The `vite-plugin-monaco-editor` handles this automatically in a typical project.
    // For this example, we simulate it.
    if (!monacoInstance) {
      // Dynamically import workers. The `?worker` suffix is a Vite feature.
      // This tells Vite to bundle these files as web workers.
      (async () => {
        try {
          const [monaco, editorWorker, tsWorker] = await Promise.all([
            import("monaco-editor"),
            import("monaco-editor/esm/vs/editor/editor.worker?worker"),
            import("monaco-editor/esm/vs/language/typescript/ts.worker?worker"),
          ]);

          monacoInstance = monaco;

          self.MonacoEnvironment = {
            getWorker: (_moduleId: any, label: string) => {
              if (label === "typescript" || label === "javascript") {
                return new tsWorker.default();
              }
              return new editorWorker.default();
            },
          };

          // Configure TypeScript and JavaScript language defaults (optional)
          monacoInstance.languages.typescript.typescriptDefaults.setEagerModelSync(
            true,
          );
          monacoInstance.languages.typescript.typescriptDefaults.setCompilerOptions(
            {
              esModuleInterop: true,
              target: monacoInstance.languages.typescript.ScriptTarget.ES2020,
              moduleResolution:
                monacoInstance.languages.typescript.ModuleResolutionKind.NodeJs,
              allowNonTsExtensions: true, // Important for JS in TS worker
            },
          );

          monacoInstance.languages.typescript.javascriptDefaults.setEagerModelSync(
            true,
          );

          setIsMonacoReady(true);
        } catch (error) {
          console.error(
            "Failed to initialize Monaco Editor environment:",
            error,
          );
        }
      })();
    } else {
      setIsMonacoReady(true);
    }

    return () => {
      // Cleanup on component unmount
      if (editorRef.current) {
        editorRef.current.dispose();
        editorRef.current = null;
      }
      if (subscriptionRef.current) {
        subscriptionRef.current.dispose();
        subscriptionRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (
      isMonacoReady &&
      editorContainerRef.current &&
      !editorRef.current &&
      monacoInstance
    ) {
      // Create editor instance only when Monaco is ready and container is available
      const editor = monacoInstance.editor.create(editorContainerRef.current, {
        value: rawTSCode,
        language,
        theme,
        automaticLayout: true, // Ensures editor resizes with container
        minimap: { enabled: true },
        scrollBeyondLastLine: false,
        fontSize: 14,
        wordWrap: "on", // Enable word wrap
      });

      subscriptionRef.current = editor.onDidChangeModelContent(() => {
        onChange(editor.getValue());
      });

      editorRef.current = editor;
      setIsEditorReady(true);
    }
  }, [
    isMonacoReady,
    // language,
    // theme,
    rawTSCode,
    onChange,
  ]);

  // Update editor value if the prop changes from outside
  useEffect(() => {
    if (editorRef.current && rawTSCode !== editorRef.current.getValue()) {
      editorRef.current.setValue(rawTSCode);
    }
  }, [rawTSCode]);

  // Update editor language if the prop changes
  useEffect(
    () => {
      if (editorRef.current && monacoInstance && language) {
        const model = editorRef.current.getModel();
        if (model) {
          monacoInstance.editor.setModelLanguage(model, language);
        }
      }
    },
    [
      // language
    ],
  );

  // Update theme
  useEffect(
    () => {
      if (monacoInstance && theme) {
        monacoInstance.editor.setTheme(theme);
      }
    },
    [
      // theme
    ],
  );

  // Set extra libs for the current layer type and role
  useEffect(() => {
    if (!monacoInstance || !isMonacoReady) return;
    if (!layerType) return;

    let extraLibsForTypeRole: [string, string][] = [
      [mathTypes, "ts:math.d.ts"],
      [scriptableTypes, "ts:scriptable.d.ts"],
    ];

    // Add extra libs for canvas and threejs
    const extraLibsForType = extraLibs[layerType];
    if (extraLibsForType) {
      if (extraLibsForType[role]) {
        extraLibsForTypeRole = [
          ...extraLibsForTypeRole,
          ...extraLibsForType[role],
        ];
      }
    }

    const typeRoleLibs = [...extraLibsForTypeRole].map(
      ([content, filePath]) => ({
        content: content.trim(),
        filePath,
      }),
    );
    monacoInstance.languages.typescript.typescriptDefaults.setExtraLibs(
      typeRoleLibs,
    );
  }, [role, layerType, isMonacoReady]);

  // Handle resize of the editor container
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  if (!isMonacoReady) {
    return (
      <div className={styles.root}>
        <div className={styles.loading}>Loading</div>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.info}>
        {id ? (
          <>
            <div className={styles.script}>
              <div>
                <strong>Type</strong> {type === "layer" ? layerType : "worker"}
              </div>
              <div>
                <Button onClick={onSwitchRole} title="Switch script role">
                  Role
                </Button>{" "}
                {role}
              </div>
              {id !== "worker" && <div>{id}</div>}
            </div>
          </>
        ) : (
          <div />
        )}
        <div className={styles.help}>
          <Button
            variant="icon"
            title="Help"
            onClick={onToggleHelp}
            className={[
              buttonStyles.button,
              buttonStyles.icon,
              "help-button",
            ].join(" ")}
          >
            <HelpCircleIcon />
          </Button>
        </div>
      </div>

      <div className={styles.editorHelpContainer}>
        <div
          className={[
            styles.editorContainer,
            docTopic ? styles.editorHelpOpen : "",
          ].join(" ")}
        >
          {id ? (
            <>
              <div
                ref={editorContainerRef}
                className={["editor", styles.editor].join(" ")}
              />
              <div className={styles.editorAIWrapper}>
                {isEditorReady ? (
                  <AIAssistant
                    editor={editorRef.current!}
                    role={role}
                    type={type}
                    layerType={layerType}
                    id={id}
                    onSwitchRole={onSwitchRole}
                  />
                ) : null}
              </div>
            </>
          ) : (
            <div className={styles.noScript}>
              <LandingContent onSetDocTopic={onSetDocTopic} />
            </div>
          )}
        </div>
        <div
          className={[
            styles.helpContent,
            docTopic ? styles.helpContentOpen : "",
          ]
            .join(" ")
            .trim()}
        >
          <Help docTopic={docTopic} />
        </div>
      </div>
    </div>
  );
}
