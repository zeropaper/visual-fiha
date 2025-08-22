import type { Decorator } from "@storybook/react";
import { AudioSetupProvider } from "../src/controls/contexts/AudioSetupContext";
import { AppFastContextProvider } from "../src/controls/contexts/ControlsContext";
import { FileSystemProvider } from "../src/controls/contexts/FileSystemContext";

/**
 * Storybook decorator that provides all the necessary React contexts
 * for Visual Fiha components to function properly.
 *
 * This includes:
 * - AppFastContextProvider: Application state management
 * - AudioSetupProvider: Audio input and analysis
 * - FileSystemProvider: File system operations
 */
export const withVisualFihaContexts: Decorator = (Story) => {
  return (
    <AppFastContextProvider>
      <FileSystemProvider>
        <AudioSetupProvider>
          <Story />
        </AudioSetupProvider>
      </FileSystemProvider>
    </AppFastContextProvider>
  );
};

/**
 * Minimal context provider for components that only need basic app state
 */
export const withAppContext: Decorator = (Story) => {
  return (
    <AppFastContextProvider>
      <Story />
    </AppFastContextProvider>
  );
};

/**
 * Full context provider including audio setup for components that need audio features
 */
export const withAudioContext: Decorator = (Story) => {
  return (
    <AppFastContextProvider>
      <AudioSetupProvider>
        <Story />
      </AudioSetupProvider>
    </AppFastContextProvider>
  );
};
