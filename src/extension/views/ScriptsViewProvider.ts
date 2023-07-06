/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as vscode from "vscode";
import type VFExtension from "../VFExtension";
import type { Layer } from "../../types";
import { type Unsubscribe } from "redux";

interface Node extends Pick<Layer, "id" | "weight" | "active"> {
  type: string;
  parent?: Node;
}

class ScriptsViewProvider implements vscode.TreeDataProvider<Node> {
  private readonly _onDidChangeTreeData = new vscode.EventEmitter<
    Node | undefined
  >();

  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(context: vscode.ExtensionContext, extension: VFExtension) {
    this.#context = context;
    this.#extension = extension;
    this.#unsubscribe = this.#extension.subscribe(this.refresh.bind(this));
  }

  #unsubscribe: Unsubscribe;

  #context: vscode.ExtensionContext;

  #extension: VFExtension;

  dispose() {
    this.#unsubscribe();
  }

  refresh() {
    this._onDidChangeTreeData.fire(undefined);
  }

  getChildren(element?: Node) {
    if (element) {
      return [
        {
          id: `${element.id}-setup}`,
          type: "setup",
          weight: 0,
          active: true,
          parent: element,
        },
        {
          id: `${element.id}-animation`,
          type: "animation",
          weight: 1,
          active: true,
          parent: element,
        },
      ];
    }
    return (
      [
        {
          id: "worker",
          type: "worker",
          weight: -1000,
          active: true,
        },
        ...this.#extension.state.layers.map((layer) => ({
          id: layer.id,
          type: layer.type,
          weight: layer.weight,
          active: layer.active,
        })),
      ] as Node[]
    ).sort((a, b) => (a.weight ?? 0) - (b.weight ?? 0));
  }

  getTreeItem(element: Node): vscode.TreeItem | Thenable<vscode.TreeItem> {
    if (["setup", "animation"].includes(element.type)) {
      const scriptId = element.parent!.id;
      const scriptType = element.parent!.type;
      const scriptRole = element.type;

      const title = `Open ${scriptId} ${scriptRole} script`;

      const scriptRelativePath =
        scriptId === "worker"
          ? `worker/worker-${scriptRole}.mjs`
          : `layers/${scriptType}/${scriptId}-${scriptRole}.mjs`;

      return {
        id: element.id,
        label: scriptRole,
        collapsibleState: vscode.TreeItemCollapsibleState.None,
        tooltip: title,
        command: {
          command: "visualFiha.openEditor",
          title,
          arguments: [scriptRelativePath],
        },
      };
    }
    return {
      id: element.id,
      label: element.id,
      description: `${element.type} ${element.active ? "✓" : ""}`,
      collapsibleState: vscode.TreeItemCollapsibleState.Expanded,
      contextValue: element.id === "worker" ? "worker" : "layer",
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class ScriptsView {
  constructor(context: vscode.ExtensionContext, extension: VFExtension) {
    this.#provider = new ScriptsViewProvider(context, extension);

    this.#view = vscode.window.createTreeView("visualFiha.scriptsView", {
      treeDataProvider: this.#provider,
      showCollapseAll: true,
      canSelectMany: true,
    });

    context.subscriptions.push(this.#view);
  }

  #view: vscode.TreeView<Node>;

  #provider: vscode.TreeDataProvider<Node>;
}
