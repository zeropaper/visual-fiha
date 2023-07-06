import type { Layer, VFCommand } from "../../types";
import * as vscode from "vscode";
import { isLayerType } from "../isLayerType";

async function collectLayerInfo(): Promise<Layer> {
  function validateId(value: string) {
    if (!value) return "The value is required";

    const exp = /^[a-z0-9-_]+$/i;
    const found = value.match(exp);
    if (found != null) return;
    return "The value contains invalid characters";
  }

  return {
    id: await vscode.window
      .showInputBox({
        title: "Layer ID",
        prompt: "What ID should be used for the layer (/^[a-z0-9-_]+$/i) ?",
        validateInput: validateId,
      })
      .then((id?: string) => {
        if (!id) {
          throw new Error("The value is required");
        }
        return id;
      }),
    type: await vscode.window
      .showQuickPick(
        [
          {
            label: "canvas",
          },
          {
            label: "threejs",
          },
        ],
        {
          title: "Layer type",
          canPickMany: false,
        }
      )
      .then((type?: { label: string }) => {
        if (!type || !isLayerType(type?.label)) {
          throw new Error("Invalid layer type");
        }
        return type.label;
      }),
    active: await vscode.window
      .showQuickPick(
        [
          {
            label: "yes",
          },
          {
            label: "no",
          },
        ],
        {
          title: "Set active",
          canPickMany: false,
        }
      )
      .then((active?: { label: string }) => {
        if (!active) {
          throw new Error("Invalid layer active value");
        }
        return active.label === "yes";
      }),
  };
}

async function writeNewLayer(layer: Layer) {
  const folder = vscode.workspace.workspaceFolders?.[0];
  if (!folder) {
    throw new Error("No workspace folder found");
  }

  const filepath = vscode.Uri.joinPath(folder.uri, "fiha.json").fsPath;
  const fiha = JSON.parse(
    (await vscode.workspace.fs.readFile(vscode.Uri.file(filepath))).toString()
  );
  fiha.layers.push(layer);
  await vscode.workspace.fs.writeFile(
    vscode.Uri.file(filepath),
    Buffer.from(JSON.stringify(fiha, null, 2))
  );
  return layer;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const addLayer: VFCommand = function (context, extension) {
  return async (layer?: Layer) => {
    console.info("[command] addLayer", layer);

    if (!layer) {
      const newLayer = await collectLayerInfo();
      await writeNewLayer(newLayer);
      extension.dispatch({
        type: "addLayer",
        payload: newLayer,
      });
      return;
    }

    await writeNewLayer(layer);
    extension.dispatch({
      type: "addLayer",
      payload: layer,
    });
  };
};

export default addLayer;
