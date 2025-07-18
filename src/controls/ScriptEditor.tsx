import type * as _monaco from "monaco-editor";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAppFastContextFields } from "./ControlsContext";
import styles from "./ScriptEditor.module.css";

import { HelpCircleIcon } from "lucide-react";
import scriptableTypes from "../utils/Scriptable.editor.types.editor-types.txt?raw";
import mathTypes from "../utils/mathTools.editor-types.txt?raw";
import { Help } from "./Help";
import { extraLibs } from "./ScriptEditor.extraLibs";
import { Button } from "./base/Button";

function useCode(
  role: "setup" | "animation",
  type: "worker" | "layer",
  id: string,
): [
  { code: string; layerType: "canvas" | "threejs" | null },
  (code: string) => void,
] {
  const {
    layers: { get: layers, set: setLayers },
    worker: { get: worker, set: setWorker },
  } = useAppFastContextFields(["layers", "worker"]);
  if (type === "worker") {
    return [
      {
        code:
          worker[role] || `// No code available for worker with role ${role}`,
        layerType: null,
      },
      (code: string) =>
        setWorker({
          ...worker,
          [role]: code,
        }),
    ];
  }

  const layer = layers.find((l) => l.id === id);
  if (layer) {
    return [
      {
        code:
          layer[role] ||
          `// No code available for layer ${id} with role ${role}`,
        layerType: layer.type,
      },
      (code: string) =>
        setLayers(
          layers.map((l) => (l.id === id ? { ...l, [role]: code } : l)),
        ),
    ];
  }

  return [
    {
      code: `// No code available for layer ${id} with role ${role}`,
      layerType: null,
    },
    (code: string) => {
      console.warn(
        `[ScriptEditor] Cannot set code for layer ${id} with role ${role} because it does not exist.`,
      );
    },
  ];
}

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
  showHelp = false,
}: {
  role?: "setup" | "animation";
  type?: "worker" | "layer";
  id?: string | "worker";
  onSwitchRole: () => void;
  onToggleHelp?: () => void;
  showHelp?: boolean;
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
  useEffect(() => {
    const handleResize = () => {
      if (editorRef.current) {
        editorRef.current.layout();
      }
    };
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
          <Button variant="icon" title="Help" onClick={onToggleHelp}>
            <HelpCircleIcon />
          </Button>
        </div>
      </div>

      <div className={styles.editorHelpContainer}>
        <div className={styles.editorContainer}>
          {id ? (
            <div ref={editorContainerRef} className={styles.editor} />
          ) : (
            <div className={styles.noScript}>pick</div>
          )}
        </div>
        <div
          className={[
            styles.helpContent,
            showHelp ? styles.helpContentOpen : "",
          ]
            .join(" ")
            .trim()}
        >
          <Help docTopic={layerType} />
        </div>
      </div>
    </div>
  );
}
