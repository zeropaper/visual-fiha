import { readFile } from "node:fs/promises";
import type { TypeDirectory } from "../types";
import scriptUri from "./scriptUri";

export default async function readScripts(
  type: keyof typeof TypeDirectory,
  runnerType: string,
  id: string,
) {
  const setupFSPath = scriptUri(type, runnerType, id, "setup").path;
  const animationFSPath = scriptUri(type, runnerType, id, "animation").path;

  let setup = "";
  let animation = "";

  try {
    setup = await readFile(setupFSPath, "utf8");
  } catch (e) {
    /* */
  }
  try {
    animation = await readFile(animationFSPath, "utf8");
  } catch (e) {
    /* */
  }

  return {
    setup,
    animation,
  };
}
