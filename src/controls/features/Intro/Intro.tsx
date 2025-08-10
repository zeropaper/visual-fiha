import { steps as assetsSteps } from "@controls/features/Assets/Assets.intro";
import { steps as controlDisplaySteps } from "@controls/features/ControlDisplay/ControlDisplay.intro";
import { steps as displaysSteps } from "@controls/features/Displays/Displays.intro";
import { steps as layersSteps } from "@controls/features/Layers/Layers.intro";
import { useState } from "react";
import { TourUI } from "./TourUI";
import type { TourStep } from "./types";

function normalizeSteps(steps: Partial<TourStep>[]): Partial<TourStep>[] {
  return steps.map(
    ({
      disableInteraction,
      element,
      highlightClass,
      intro,
      position,
      scrollTo,
      step,
      title,
      tooltipClass,
    }) => ({
      disableInteraction,
      element,
      highlightClass,
      intro,
      position,
      scrollTo,
      step,
      title,
      tooltipClass,
    }),
  );
}

export function Intro({
  setSidebarTab,
}: {
  setSidebarTab: (tab: string) => void;
}) {
  const [showIntro, _setShowIntro] = useState(
    localStorage.getItem("introShown") !== "true",
  );
  if (!showIntro) return null;
  const steps: Partial<TourStep>[] = [
    {
      element: "main",
      title: "Welcome to Visual Fiha",
      intro:
        "This is a visual programming environment for creating animations and interactive experiences.",
    },
    ...controlDisplaySteps,
    {
      element: ".sidebar",
      title: "Sidebar",
      position: "right",
      intro: "This is the sidebar where you can access different features.",
    },
    ...layersSteps,
    // TODO: audio steps
    ...assetsSteps,
    // TODO: MIDI steps
    ...displaysSteps,
    // TODO: Timeline steps
    // TODO: Editor steps
    // TODO: Help steps
    // TODO: AI steps
    // TODO: Persistence steps
  ];
  return (
    <TourUI
      onBeforeChange={(tour, element, index, direction) => {
        if (steps[index].sidebarTab) {
          setSidebarTab(steps[index].sidebarTab);
        }
        steps[index].onBeforeChange?.(tour, element, index, direction);

        return true;
      }}
      onExit={(_tour) => {
        localStorage.setItem("introShown", "true");
      }}
      steps={normalizeSteps(steps)}
    />
  );
}
