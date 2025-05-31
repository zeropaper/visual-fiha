import React, { useEffect, useState } from "react";
import { MonacoEditorComponent } from "./MonacoEditorComponent";

// Styles for the App
export const styles = {
  appContainer: {},
  header: {
    textAlign: "center" as React.CSSProperties["textAlign"],
    color: "#333",
    marginBottom: "30px",
    fontSize: "2rem",
  },
  editorSection: {
    marginBottom: "30px",
    padding: "20px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  },
  codePreview: {
    marginTop: "15px",
    padding: "10px",
    backgroundColor: "#282c34", // Dark background for code
    color: "#abb2bf", // Light text for dark background
    borderRadius: "4px",
    overflowX: "auto" as React.CSSProperties["overflowX"],
    fontSize: "0.9em",
    whiteSpace: "pre-wrap" as React.CSSProperties["whiteSpace"],
  },
  errorMessage: {
    backgroundColor: "#ffebee",
    color: "#c62828",
    padding: "10px 15px",
    borderRadius: "4px",
    marginBottom: "20px",
    border: "1px solid #ef9a9a",
    textAlign: "center" as React.CSSProperties["textAlign"],
  },
};

const initialTsCode = `
// TypeScript Example
interface User {
  name: string;
  id: number;
}

function getUserName(user: User): string {
  return user.name;
}

const user: User = { name: "Alice", id: 1 };
console.log(getUserName(user));

// Try adding a new property to 'user' or calling getUserName with a number
// to see TypeScript's error checking in action.
`;

function ControlApp() {
  const [tsCode, setTsCode] = useState<string>(initialTsCode);
  const [workerError, setWorkerError] = useState<string | null>(null);
  const [jsCode, setJsCode] = useState<string>("");
  const workerRef = React.useRef<Worker | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    // Dynamically import the worker as classic (not module)
    // @ts-ignore
    const worker = new Worker(
      new URL("./tsTranspile.worker.ts", import.meta.url),
      { type: "classic" },
    );
    if (workerRef.current) workerRef.current.terminate();
    workerRef.current = worker;
    worker.onmessage = (e) => {
      setJsCode(e.data);
    };
    // Initial transpile
    worker.postMessage(tsCode);
    return () => {
      worker.terminate();
    };
    // eslint-disable-next-line
  }, []);

  const transpileTsCode = (code: string) => {
    setTsCode(code);
    if (workerRef.current) {
      workerRef.current.postMessage(code);
    }
  };

  // Check for potential worker issues (e.g. if not served correctly)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!(self as any).MonacoEnvironment) {
        setWorkerError(
          "MonacoEnvironment is not set. Workers might not load correctly. " +
            "If using Vite, ensure `vite-plugin-monaco-editor` is configured, " +
            "or that manual worker imports (`?worker`) are working.",
        );
      }
    }, 3000); // Check after 3 seconds
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={styles.appContainer}>
      {workerError && (
        <div style={styles.errorMessage}>
          <strong>Warning:</strong> {workerError}
        </div>
      )}
      <MonacoEditorComponent
        language="typescript"
        value={tsCode}
        onChange={transpileTsCode}
        theme="vs-dark" // Options: 'vs-dark', 'vs-light', 'hc-black'
      />
      <details>
        <summary
          style={{ cursor: "pointer", marginTop: "10px", color: "#1a73e8" }}
        >
          View TypeScript Code
        </summary>
        <pre style={styles.codePreview}>
          <code>{tsCode}</code>
        </pre>
      </details>
      <details>
        <summary
          style={{ cursor: "pointer", marginTop: "10px", color: "#43a047" }}
        >
          View Transpiled JavaScript
        </summary>
        <pre style={styles.codePreview}>
          <code>{jsCode}</code>
        </pre>
      </details>
    </div>
  );
}

export default ControlApp;
