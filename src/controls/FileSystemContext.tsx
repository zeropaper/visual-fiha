import { createContext, useContext, useState } from "react";
import type { AppState } from "../types";
import { useAppFastContextFields } from "./ControlsContext";

interface FileSystemContextValue {
  saveFiles: () => Promise<void>;
  loadFiles: () => Promise<void>;
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
  const { layers, worker, inputs, signals, stage } = useAppFastContextFields([
    "layers",
    "worker",
    "signals",
    "stage",
    "inputs",
  ]);
  return async () => {
    if (!selectedDirectory) {
      console.error("No directory selected for saving config.");
      return;
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
  const writeConfig = useWriteConfig(selectedDirectory);
  const saveFiles = async () => {
    if (!selectedDirectory) {
      console.error("No directory selected for saving files.");
      return;
    }
    await writeConfig();
  };

  const loadFiles = async () => {
    if (!selectedDirectory) {
      console.error("No directory selected for loading files.");
      return;
    }

    for await (const [name, entry] of selectedDirectory.entries()) {
      console.info(`Processing entry: ${name}`, entry);
      if (name !== "visual-fiha-config.json") {
        continue;
      }
      if (entry.kind !== "file") {
        console.warn(`Skipping non-file entry: ${name}`);
        continue;
      }
      const file = await entry.getFile();
      const content = await file.text();
      console.info(
        `Loaded config file: ${name} with content length: ${content.length}`,
      );
      localStorage.setItem("config", content);
    }
  };

  const selectDirectory = async () => {
    try {
      const directoryHandle = await window.showDirectoryPicker();
      setSelectedDirectory(directoryHandle);
    } catch (error) {
      console.error("Failed to select directory:", error);
    }
  };

  return (
    <FileSystemContext.Provider
      value={{
        saveFiles,
        loadFiles,
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
