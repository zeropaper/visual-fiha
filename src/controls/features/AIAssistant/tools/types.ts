import type { UITool } from "ai";

// export type VFTools = Record<'setScript' | 'getScript' | 'takeScreenshot' | 'askForConfirmation', UITool>;

export type VFTools = {
  setScript: UITool;
  getScript: UITool;
  takeScreenshot: UITool;
  askForConfirmation: UITool;
};
