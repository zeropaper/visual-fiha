import {
  useAppFastContextFields,
  useContextWorkerPost,
} from "@contexts/ControlsContext";
import { createContext, useContext, useEffect, useState } from "react";
import type { AppState } from "../../types";

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
          layers: layers.get,
          worker: worker.get,
          signals: signals.get,
          stage: stage.get,
          inputs: inputs.get,
          assets: assets.get.filter((asset) => asset.source !== "local"),
          displays: [],
        } satisfies AppState,
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
          assets.set(name, file);
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
