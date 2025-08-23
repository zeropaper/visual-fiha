import { useTakeLayerScreenshot } from "@controls/hooks/useTakeLayerScreenshot";
import { useCode } from "@hooks/useCode";
import { useCallback } from "react";
import type { AIAssistantConfig } from "../config/aiConfig";
import { getScript, setScript } from "../tools/scripts";

/**
 * Custom hook for managing AI tool functions
 */
export function useAITools(config: AIAssistantConfig) {
  const { role, type, id } = config;

  const [{ code: setupScript }, setSetupScript] = useCode(
    "setup",
    type || "worker",
    id || "worker",
  );
  const [{ code: animationScript }, setAnimationScript] = useCode(
    "animation",
    type || "worker",
    id || "worker",
  );
  const takeLayerScreenshot = useTakeLayerScreenshot();

  // Tool functions
  const getScriptTool = getScript({ setupScript, animationScript });

  const setScriptTool = setScript({
    setAnimationScript,
    setSetupScript,
    getSetupScript: () => setupScript,
    getAnimationScript: () => animationScript,
    type: type || "worker",
    id: id || "worker",
    role: role || "setup",
  });

  const takeLayerScreenshotTool = useCallback(
    async ({ layerId }: { layerId: string }) => {
      if (!layerId && id) {
        return await takeLayerScreenshot({ layerId: id });
      }
      return await takeLayerScreenshot({ layerId });
    },
    [takeLayerScreenshot, id],
  );

  // Execute a tool by name
  const executeTool = useCallback(
    async (toolName: string, args: any) => {
      switch (toolName) {
        case "getScript":
          return await getScriptTool(args);
        case "setScript":
          return await setScriptTool(args);
        case "takeLayerScreenshot":
          return await takeLayerScreenshotTool(args);
        default:
          throw new Error(`Unknown tool: ${toolName}`);
      }
    },
    [getScriptTool, setScriptTool, takeLayerScreenshotTool],
  );

  return {
    executeTool,
    takeLayerScreenshotTool,
    scripts: {
      setupScript,
      animationScript,
    },
  };
}
