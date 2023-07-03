import { dir, type DirectoryResult } from "tmp-promise";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment, @typescript-eslint/prefer-ts-expect-error
// @ts-ignore
import { __setWorkspace } from "vscode";

import workspaceFileExists from "./workspaceFileExists";

let tmpDir: DirectoryResult;
beforeAll(async () => {
  tmpDir = await dir();
});

afterAll(async () => {
  await tmpDir.cleanup();
});

describe("workspaceFileExists", () => {
  it("returns false when the relative path does not exists", async () => {
    await expect(workspaceFileExists("whatever")).resolves.toBe(false);
  });

  it("returns true when the relative path exists", async () => {
    __setWorkspace(tmpDir.path, {
      worksapceFolders: ["folder-a"],
    });
    await expect(workspaceFileExists("whatever")).resolves.toBe(false);
  });
});
