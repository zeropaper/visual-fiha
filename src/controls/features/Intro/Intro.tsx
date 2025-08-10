import * as assets from "@controls/features/Assets/Assets.intro";
import * as controlDisplay from "@controls/features/ControlDisplay/ControlDisplay.intro";
import * as displays from "@controls/features/Displays/Displays.intro";
import * as layers from "@controls/features/Layers/Layers.intro";
import { useState } from "react";
import { TourUI } from "./TourUI";

export function Intro() {
  const [showIntro, _setShowIntro] = useState(
    localStorage.getItem("introShown") !== "true",
  );
  if (!showIntro) return null;
  return (
    <TourUI
      onAfterChange={(tour, step) => {
        console.log("Intro step changed", step);
      }}
      onBeforeChange={(_tour, element, index, direction) => {
        console.log("Intro step about to change", element, index, direction);
        // dispatch a click event on the first layer animation button
        if (index === 6) {
          const button = document.querySelector(".animation-script-button");
          button?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
          return new Promise((resolve) => {
            // Simulate an asynchronous operation
            setTimeout(() => {
              resolve(true);
            }, 1000);
          });
        }
        return true;
      }}
      onStart={(_tour) => {
        console.log("Intro started");
      }}
      onExit={(_tour) => {
        console.log("Intro exited");
        localStorage.setItem("introShown", "true");
      }}
      steps={[
        {
          element: "main",
          title: "Welcome to Visual Fiha",
          intro:
            "This is a visual programming environment for creating animations and interactive experiences.",
        },
        ...controlDisplay.steps,
        ...assets.steps,
        ...displays.steps,
        ...layers.steps,
      ]}
    />
  );
}
