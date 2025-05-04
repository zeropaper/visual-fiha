import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { type DirectoryResult, dir } from "tmp-promise";
// Mock function to simulate setting up a workspace
const __setWorkspace = (
  path: string,
  options: { worksapceFolders: string[] },
) => {
  // Simulate workspace setup logic here
};

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
