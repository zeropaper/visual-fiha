import { tsTranspile } from "@utils/tsTranspile";
import type { ScriptInfo } from "src/types";
import { z } from "zod";

export const scriptBaseSchema = z.object({
  role: z.enum(["setup", "animation"]).describe("The role of the script"),
});

export const setScriptSchema = scriptBaseSchema.extend({
  code: z.string().describe("The new script code"),
});

export function setScript({
  setAnimationScript,
  setSetupScript,
  type,
  id,
}: ScriptInfo & {
  setSetupScript: (code: string) => void;
  setAnimationScript: (code: string) => void;
  getSetupScript: () => string;
  getAnimationScript: () => string;
}) {
  return async ({
    code,
    role: changesRole,
  }: z.infer<typeof setScriptSchema>) => {
    if (changesRole === "setup") {
      setSetupScript(code);
    } else if (changesRole === "animation") {
      setAnimationScript(code);
    }

    await tsTranspile(code, type, changesRole, id);
  };
}

export function getScript({
  setupScript,
  animationScript,
}: {
  setupScript: string;
  animationScript: string;
}) {
  return async ({ role }: z.infer<typeof scriptBaseSchema>) => {
    return role === "setup" ? setupScript : animationScript;
  };
}
