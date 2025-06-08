import type * as _monaco from "monaco-editor";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAppFastContextFields } from "./ControlsContext";
import styles from "./ScriptEditor.module.css";

let monacoInstance: typeof _monaco | null = null;
export function ScriptEditor({
  role = "animation",
  type = "worker",
  id = "worker",
}: {
  role?: "setup" | "animation";
  type?: "worker" | "layer";
  id?: string | "worker";
}) {
  const language = "typescript";
  const theme = "vs-light"; // Options: 'vs-dark', 'vs-light', 'hc-black'
  const [tsCode, setTsCode] = useState<string>("");
  const transpilationWorkerRef = React.useRef<Worker | null>(null);
  const {
    layers: { set: setLayers, get: layers },
    worker: { set: setWorker, get: worker },
  } = useAppFastContextFields(["layers", "worker"]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    // Dynamically import the worker as classic (not module)
    // @ts-ignore
    const worker = new Worker(
      new URL("./tsTranspile.worker.ts", import.meta.url),
      { type: "classic" },
    );
    if (transpilationWorkerRef.current)
      transpilationWorkerRef.current.terminate();
    transpilationWorkerRef.current = worker;
    worker.onmessage = (e) => {
      if (type === "worker") {
        setWorker({ [role]: e.data as string } as any);
      } else {
        const layer = layers.find((l) => l.id === id);
        if (layer) {
          setLayers(
            layers.map((l) => (l.id === id ? { ...l, [role]: e.data } : l)),
          );
        }
      }
    };
    // Initial transpile
    worker.postMessage(tsCode);
    return () => {
      worker.terminate();
    };
  }, []);

  const onChange = useCallback((code: string) => {
    setTsCode(code);
    if (transpilationWorkerRef.current) {
      transpilationWorkerRef.current.postMessage(code);
    }
  }, []);

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
            // @ts-ignore
            import("monaco-editor/esm/vs/editor/editor.worker?worker"),
            // @ts-ignore
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
              jsx: monacoInstance.languages.typescript.JsxEmit.React,
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
          monacoInstance.languages.typescript.javascriptDefaults.setCompilerOptions(
            {
              jsx: monacoInstance.languages.typescript.JsxEmit.React,
              esModuleInterop: true,
              target: monacoInstance.languages.typescript.ScriptTarget.ES2020,
              moduleResolution:
                monacoInstance.languages.typescript.ModuleResolutionKind.NodeJs,
              allowNonTsExtensions: true,
            },
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
        value: tsCode,
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
    tsCode,
    onChange,
  ]);

  // Update editor value if the prop changes from outside
  useEffect(() => {
    if (editorRef.current && tsCode !== editorRef.current.getValue()) {
      editorRef.current.setValue(tsCode);
    }
  }, [tsCode]);

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

  // Set initial code based on type and role
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (type === "worker") {
      setTsCode(worker[role]);
      return;
    }
    const layer = layers.find((l) => l.id === id);
    if (layer) {
      setTsCode(layer[role]);
    }
  }, [role, type, id]);

  if (!isMonacoReady) {
    return <div>Loading Editor...</div>;
  }

  return (
    <div className={styles.root}>
      <div className={styles.info}>
        <div>
          <strong>Type</strong> {type}
        </div>
        <div>
          <strong>Role</strong> {role}
        </div>
        {id !== "worker" && <div>{id}</div>}
      </div>

      <div ref={editorContainerRef} className={styles.editor} />
    </div>
  );
}
