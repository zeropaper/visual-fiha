import {
  useAppFastContextFields,
  useContextWorkerPost,
} from "@contexts/ControlsContext";
import { createContext, useContext, useEffect, useState } from "react";
import type { AppState, LayerConfig } from "../../types";

interface FileSystemContextValue {
  saveFiles: () => Promise<void>;
  loadFiles: () => Promise<void>;
  readFile: (name: string) => Promise<string | null>;
  selectedDirectory: FileSystemDirectoryHandle | null;
  selectDirectory: () => Promise<void>;
}

const FileSystemContext = createContext<FileSystemContextValue | undefined>(
  undefined,
);

declare global {
  interface Window {
    showDirectoryPicker: () => Promise<FileSystemDirectoryHandle>;
  }
  interface FileSystemDirectoryHandle {
    entries: () => AsyncIterableIterator<
      [string, FileSystemFileHandle | FileSystemDirectoryHandle]
    >;
  }
}

const safe = (s: string) => s.replace(/[^a-zA-Z0-9-_.]/g, "-");

function useWriteConfig(selectedDirectory: FileSystemDirectoryHandle | null) {
  const { layers, worker, inputs, signals, stage, assets } =
    useAppFastContextFields([
      "layers",
      "worker",
      "signals",
      "stage",
      "inputs",
      "assets",
    ]);
  return async () => {
    if (!selectedDirectory) {
      throw new Error("No directory selected for saving config.");
    }
    // Helper to write a script file within a given directory and return its reference marker
    const writeScript = async (
      dir: FileSystemDirectoryHandle,
      relativePath: string,
      contents: string,
    ) => {
      // Support relativePath like "setup.ts" or "layer-foo/setup.ts"
      const parts = relativePath.split("/").filter(Boolean);
      const fileName = parts.pop()!;
      let dirHandle = dir;
      for (const part of parts) {
        dirHandle = await dirHandle.getDirectoryHandle(part, { create: true });
      }
      const fileHandle = await dirHandle.getFileHandle(fileName, {
        create: true,
      });
      const writable = await fileHandle.createWritable();
      await writable.write(contents ?? "");
      await writable.close();
      return `file:${relativePath}`;
    };

    // Ensure base directories exist
    const workerDir = await selectedDirectory.getDirectoryHandle("worker", {
      create: true,
    });
    const layersDir = await selectedDirectory.getDirectoryHandle("layers", {
      create: true,
    });

    // Write worker scripts to worker/*.ts files
    await writeScript(workerDir, `setup.ts`, worker.get.setup);
    await writeScript(workerDir, `animation.ts`, worker.get.animation);

    // Write layer scripts to individual .ts files and build new layer configs with file refs
    const layersWithRefs = await Promise.all(
      layers.get.map(async (layer) => {
        // Create per-layer directory under layers/
        const layerDirName = safe(layer.id);
        await writeScript(
          layersDir,
          `${layer.type}/${layerDirName}/setup.ts`,
          layer.setup,
        );
        await writeScript(
          layersDir,
          `${layer.type}/${layerDirName}/animation.ts`,
          layer.animation,
        );
        return {
          ...layer,
          setup: undefined,
          animation: undefined,
        } as unknown as LayerConfig;
      }),
    );

    const fileHandle = await selectedDirectory.getFileHandle(
      `visual-fiha-config.json`,
      {
        create: true,
      },
    );

    const writable = await fileHandle.createWritable();
    await writable.write(
      JSON.stringify(
        {
          layers: layersWithRefs,
          signals: signals.get,
          stage: stage.get,
          inputs: inputs.get,
          assets: assets.get.filter((asset) => asset.source !== "local"),
          displays: [],
        },
        null,
        2,
      ),
    );
    await writable.close();
  };
}

export const FileSystemProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [selectedDirectory, setSelectedDirectory] =
    useState<FileSystemDirectoryHandle | null>(null);
  const post = useContextWorkerPost();
  const writeConfig = useWriteConfig(selectedDirectory);
  const saveFiles = async () => {
    if (!selectedDirectory) {
      throw new Error("No directory selected for saving files.");
    }
    await writeConfig();
  };

  const loadFiles = async () => {
    if (!selectedDirectory) {
      throw new Error("No directory selected for loading files.");
    }

    let json: AppState | null = null;
    const assets = new Map<string, File>();
    for await (const [name, entry] of selectedDirectory.entries()) {
      if (name !== "visual-fiha-config.json") {
        if (entry.kind === "file") {
          const file = await entry.getFile();
          // Skip TypeScript source files for scripts – they are handled via config references
          if (!name.endsWith(".ts")) {
            assets.set(name, file);
          }
        }
        continue;
      }
      if (entry.kind !== "file") {
        console.warn(`Skipping non-file entry: ${name}`);
        continue;
      }
      const file = await entry.getFile();
      const content = await file.text();
      json = JSON.parse(content);
    }

    if (!json) {
      throw new Error("Failed to load config.");
    }

    // Helper to resolve a script string: if it's a file reference (file:foo.ts) read it from disk
    const resolveScript = async (path: string) => {
      // Traverse directories according to the relative path
      const parts = path.split("/").filter(Boolean);
      const fileName = parts.pop();
      if (!fileName) return "";
      let dirHandle: FileSystemDirectoryHandle = selectedDirectory;
      for (const part of parts) {
        dirHandle = await dirHandle.getDirectoryHandle(part);
      }
      const fileHandle = await dirHandle.getFileHandle(fileName);
      const file = await fileHandle.getFile();
      return await file.text();
    };

    // Resolve worker scripts
    json.worker = {
      setup: await resolveScript("worker/setup.ts").catch((err) => {
        console.warn("Failed to resolve worker setup script:", err);
        throw err;
      }),
      animation: await resolveScript("worker/animation.ts").catch((err) => {
        console.warn("Failed to resolve worker animation script:", err);
        throw err;
      }),
    };

    // Resolve layer scripts
    json.layers = await Promise.all(
      (json.layers || []).map(async (layer) => ({
        ...layer,
        setup: await resolveScript(
          `layers/${layer.type}/${safe(layer.id)}/setup.ts`,
        ).catch((err) => {
          console.warn("Failed to resolve layer setup script:", err);
          throw err;
        }),
        animation: await resolveScript(
          `layers/${layer.type}/${safe(layer.id)}/animation.ts`,
        ).catch((err) => {
          console.warn("Failed to resolve layer animation script:", err);
          throw err;
        }),
      })),
    );

    json.assets = (json.assets || []).filter(
      ({ source }) => source !== "local",
    );
    for (const [name] of assets) {
      const file = assets.get(name);
      if (!file) continue;
      json.assets.push({
        id: name,
        source: "local",
        blobUrl: URL.createObjectURL(file),
        state: "loaded",
      });
    }

    localStorage.setItem("config", JSON.stringify(json));

    post?.("init", json);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: selectedDirectory is intentionally the only dependency
  useEffect(() => {
    if (selectedDirectory) loadFiles();
  }, [selectedDirectory]);

  const selectDirectory = async () => {
    const directoryHandle = await window.showDirectoryPicker();
    setSelectedDirectory(directoryHandle);
  };

  const readFile = async (name: string) => {
    if (!selectedDirectory) {
      throw new Error("No directory selected for reading files.");
    }

    const fileHandle = await selectedDirectory.getFileHandle(name);
    const file = await fileHandle.getFile();
    const content = await file.text();
    return content;
  };

  return (
    <FileSystemContext.Provider
      value={{
        saveFiles,
        loadFiles,
        readFile,
        selectedDirectory,
        selectDirectory,
      }}
    >
      {children}
    </FileSystemContext.Provider>
  );
};

export const useFileSystem = () => {
  const context = useContext(FileSystemContext);
  if (!context) {
    throw new Error("useFileSystem must be used within a FileSystemProvider");
  }
  return context;
};

export default FileSystemContext;
