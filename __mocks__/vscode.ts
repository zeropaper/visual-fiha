let workspacePath = '/absolute/fictive'

const workspace = {
  workspaceFolders: ['fictive-a', 'fictive-b']
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function __setWorkspace (absPath: string, info: { worksapceFolders: string[] }) {
  workspace.workspaceFolders = info.worksapceFolders
  workspacePath = absPath
}

export const Uri = {
  parse: jest.fn(),
  joinPath: jest.fn((_, filepath: string) => {
    // console.warn('[vscode mock] Uri.joinPath', workspacePath, filepath);
    return {
      fsPath: `${workspacePath}/${filepath}`
    }
  })
}

export { workspace }
