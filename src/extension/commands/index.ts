import type { VFCommand } from "../../types";
import addLayer from "./addLayer";
import createLayer from "./createLayer";
import openEditor from "./openEditor";
import removeLayer from "./removeLayer";
import resetData from "./resetData";
import scaffoldProject from "./scaffoldProject";
import setBPM from "./setBPM";
import setStageSize from "./setStageSize";
import toggleLayer from "./toggleLayer";

export type Commands = Record<string, VFCommand>;

const commands: Commands = {
  openEditor,
  setBPM,
  createLayer,
  removeLayer,
  toggleLayer,
  addLayer,
  setStageSize,
  resetData,
  scaffoldProject,
};

export default commands;
