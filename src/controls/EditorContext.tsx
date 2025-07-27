import type * as _monaco from "monaco-editor";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

interface EditorContextValue {
  editor: _monaco.editor.IStandaloneCodeEditor | null;
  monaco: typeof _monaco | null;
  isMonacoReady?: boolean;
}

let monacoInstance: typeof _monaco | null = null;
const EditorContext = createContext<EditorContextValue | undefined>(undefined);
export function EditorContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMonacoReady, setIsMonacoReady] = useState(false);
  const subscriptionRef = useRef<_monaco.IDisposable | null>(null);
  const editorRef = useRef<_monaco.editor.IStandaloneCodeEditor | null>(null);
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

  const value = useMemo<EditorContextValue>(() => {
    return {
      editor: editorRef.current,
      monaco: monacoInstance,
      isMonacoReady,
    };
  }, [isMonacoReady]);

  return (
    <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditor must be used within an EditorContextProvider");
  }
  return context;
}
