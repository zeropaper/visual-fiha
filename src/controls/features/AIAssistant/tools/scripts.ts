import { tsTranspile } from "@utils/tsTranspile";
import type { ScriptInfo } from "src/types";
import { z } from "zod";

/**
 * Base schema for script operations.
 * Defines the common parameters needed for script manipulation.
 */
export const scriptBaseSchema = z.object({
  role: z.enum(["setup", "animation"]).describe("The role of the script"),
});

/**
 * Schema for setting script content.
 * Extends the base schema with the actual script code.
 */
export const setScriptSchema = scriptBaseSchema.extend({
  code: z.string().describe("The new script code"),
});

/**
 * Creates a function to update layer or worker scripts.
 * This tool allows the AI to modify Visual Fiha scripts.
 *
 * @param params - Configuration object containing script setters and identifiers
 * @returns Async function that can be called by the AI to update scripts
 *
 * @example
 * ```typescript
 * const setScriptTool = setScript({
 *   setAnimationScript,
 *   setSetupScript,
 *   getSetupScript: () => setupScript,
 *   getAnimationScript: () => animationScript,
 *   type: "worker",
 *   id: "worker",
 *   role: "setup",
 * });
 *
 * // AI can now call: setScriptTool({ role: "animation", code: "// new code" })
 * ```
 */
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

    // Transpile the script to check for syntax errors
    await tsTranspile(code, type, changesRole, id);
    return `Successfully updated ${changesRole} script with ${code.length} characters.`;
  };
}

/**
 * Creates a function to retrieve current layer or worker scripts.
 * This tool allows the AI to read existing Visual Fiha scripts.
 *
 * @param params - Object containing the current script content
 * @returns Async function that can be called by the AI to read scripts
 *
 * @example
 * ```typescript
 * const getScriptTool = getScript({
 *   setupScript: "// current setup code",
 *   animationScript: "// current animation code"
 * });
 *
 * // AI can now call: getScriptTool({ role: "setup" })
 * ```
 */
export function getScript({
  setupScript,
  animationScript,
}: {
  setupScript: string;
  animationScript: string;
}) {
  return async ({ role }: z.infer<typeof scriptBaseSchema>) => {
    const script = role === "setup" ? setupScript : animationScript;
    return script || `// No ${role} script defined yet`;
  };
}
