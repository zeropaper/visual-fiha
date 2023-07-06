import * as vscode from "vscode";
import type { ComEventDataMeta } from "../../utils/com";
import store from "../store";

interface Size {
  width: number;
  height: number;
}

const sizes = {
  "4k": {
    width: 3840,
    height: 2160,
  },
  "1080p": {
    width: 1920,
    height: 1080,
  },
  "720p": {
    width: 1280,
    height: 720,
  },
} as const;

async function promptForSize(): Promise<Size> {
  const choice = await vscode.window.showQuickPick(
    [
      ...Object.keys(sizes).map((label) => ({
        label,
      })),
      {
        label: "Custom",
      },
    ],
    {
      placeHolder: "Select a size",
      title: "Set Stage Size",
    }
  );

  if (!choice) {
    return sizes["720p"];
  }

  if (choice?.label === "Custom") {
    const width = await vscode.window.showInputBox({
      placeHolder: "800",
      title: "Set Stage Width",
    });
    const height = await vscode.window.showInputBox({
      placeHolder: "600",
      title: "Set Stage Height",
    });

    return {
      width: Number(width),
      height: Number(height),
    };
  }

  return sizes[choice.label as keyof typeof sizes];
}

export default function setStageSize() {
  return async (size?: Size, meta?: ComEventDataMeta) => {
    store.dispatch({
      type: "setStageSize",
      payload: size ?? (await promptForSize()),
      meta,
    });
  };
}
