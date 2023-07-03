import { type TypeDirectory } from "../types";
import scriptUri from "./scriptUri";
import asyncReadFile from "./asyncReadFile";

export default async function readScripts(
  type: keyof typeof TypeDirectory,
  runnerType: string,
  id: string
) {
  const setupFSPath = scriptUri(type, runnerType, id, "setup").path;
  const animationFSPath = scriptUri(type, runnerType, id, "animation").path;

  let setup = "";
  let animation = "";

  try {
    setup = await asyncReadFile(setupFSPath);
  } catch (e) {
    /* */
  }
  try {
    animation = await asyncReadFile(animationFSPath);
  } catch (e) {
    /* */
  }

  return {
    setup,
    animation,
  };
}
