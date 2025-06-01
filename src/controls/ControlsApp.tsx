import React, { useEffect, useState } from "react";
import styles from "./ControlsApp.module.css";
import { MonacoEditorComponent } from "./MonacoEditorComponent";

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

export default function ControlsApp() {
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
    <div>
      {workerError && (
        <div className={styles.errorMessage}>
          <strong>Warning:</strong> {workerError}
        </div>
      )}
      <MonacoEditorComponent
        language="typescript"
        value={tsCode}
        onChange={transpileTsCode}
        theme="vs-light" // Options: 'vs-dark', 'vs-light', 'hc-black'
      />
      <details>
        <summary
          style={{ cursor: "pointer", marginTop: "10px", color: "#1a73e8" }}
        >
          View TypeScript Code
        </summary>
        <pre className={styles.codePreview}>
          <code>{tsCode}</code>
        </pre>
      </details>
      <details open>
        <summary
          style={{ cursor: "pointer", marginTop: "10px", color: "#43a047" }}
        >
          View Transpiled JavaScript
        </summary>
        <pre className={styles.codePreview}>
          <code>{jsCode}</code>
        </pre>
      </details>
    </div>
  );
}
