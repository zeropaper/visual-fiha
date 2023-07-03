import type { AppState } from "../types";

const vscode = acquireVsCodeApi<AppState>();

export default vscode;
