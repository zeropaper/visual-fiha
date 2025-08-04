import type { z } from "zod";
import type { scriptBaseSchema, setScriptSchema } from "./scripts";

export type VFTools = {
  setScript: {
    input: z.infer<typeof setScriptSchema>;
    output: string;
  };
  getScript: {
    input: z.infer<typeof scriptBaseSchema>;
    output: string;
  };
  takeScreenshot: {
    input: never;
    output: string;
  };
  askForConfirmation: {
    input: { message: string };
    output: string;
  };
};
