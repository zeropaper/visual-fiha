import type { Layer, VFCommand } from "../../types";
import * as vscode from "vscode";

async function writeRemovedLayer(id: Layer["id"]): Promise<Layer[]> {
  const folder = vscode.workspace.workspaceFolders?.[0];
  if (!folder) {
    throw new Error("No workspace folder found");
  }

  const filepath = vscode.Uri.joinPath(folder.uri, "fiha.json").fsPath;
  const fiha = JSON.parse(
    (await vscode.workspace.fs.readFile(vscode.Uri.file(filepath))).toString()
  );
  fiha.layers = fiha.layers.filter((layer: Layer) => layer.id !== id);
  await vscode.workspace.fs.writeFile(
    vscode.Uri.file(filepath),
    Buffer.from(JSON.stringify(fiha, null, 2))
  );
  return fiha.layers;
}

const removeLayer: VFCommand = function (context, extension) {
  return async (layer: Layer | Layer["id"]) => {
    const id = typeof layer === "string" ? layer : layer.id;
    const confirmed = await vscode.window
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
          title: "Are you sure?",
          canPickMany: false,
          placeHolder: "Are you sure you want to remove this layer?",
        }
      )
      .then((value) => value && value.label === "yes");
    if (confirmed) {
      extension.dispatch({
        type: "setLayers",
        payload: await writeRemovedLayer(id),
      });
    }
  };
};

export default removeLayer;
