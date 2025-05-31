import type * as _monaco from "monaco-editor";
import type React from "react";
import { useEffect, useRef, useState } from "react";

// Since Vite bundles workers differently, we need to set up MonacoEnvironment.
// This should be done once.
// In a real Vite project, using `vite-plugin-monaco-editor` is highly recommended
// as it handles this setup more elegantly in `vite.config.js`.
// For this self-contained example, we'll do it here.
// Store monaco instance to avoid importing multiple times if component re-renders.
let monacoInstance: typeof _monaco | null = null;
interface MonacoEditorProps {
  value?: string;
  language?: "typescript" | "javascript";
  onChange?: (value: string) => void;
  theme?: string;
  height?: string;
}
export const MonacoEditorComponent: React.FC<MonacoEditorProps> = ({
  value = "",
  language = "typescript",
  onChange,
  theme = "vs-dark",
  height = "400px",
}) => {
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
        value,
        language,
        theme,
        automaticLayout: true, // Ensures editor resizes with container
        minimap: { enabled: true },
        scrollBeyondLastLine: false,
        fontSize: 14,
        wordWrap: "on", // Enable word wrap
      });

      subscriptionRef.current = editor.onDidChangeModelContent(() => {
        const currentValue = editor.getValue();
        if (onChange) {
          onChange(currentValue);
        }
      });

      editorRef.current = editor;
    }
  }, [isMonacoReady, language, theme, value, onChange]); // Dependencies for re-creating or updating editor

  // Update editor value if the prop changes from outside
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.getValue()) {
      editorRef.current.setValue(value);
    }
  }, [value]);

  // Update editor language if the prop changes
  useEffect(() => {
    if (editorRef.current && monacoInstance && language) {
      const model = editorRef.current.getModel();
      if (model) {
        monacoInstance.editor.setModelLanguage(model, language);
      }
    }
  }, [language]);

  // Update theme
  useEffect(() => {
    if (monacoInstance && theme) {
      monacoInstance.editor.setTheme(theme);
    }
  }, [theme]);

  if (!isMonacoReady) {
    return <div>Loading Editor...</div>;
  }

  return (
    <div
      ref={editorContainerRef}
      style={{
        height,
        width: "100%",
        border: "1px solid #ccc",
        borderRadius: "4px",
      }}
    />
  );
};
