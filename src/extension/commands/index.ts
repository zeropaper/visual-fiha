import type { VFCommand } from "../../types";
import openEditor from "./openEditor";
import setBPM from "./setBPM";
import createLayer from "./createLayer";
import removeLayer from "./removeLayer";
import toggleLayer from "./toggleLayer";
import addLayer from "./addLayer";
import setStageSize from "./setStageSize";
import resetData from "./resetData";
import scaffoldProject from "./scaffoldProject";

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
