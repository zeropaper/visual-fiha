import { useState } from "react";
import { Tour } from "./Tour";

export function Intro() {
  const [showIntro, setShowIntro] = useState(
    localStorage.getItem("introShown") !== "true",
  );
  if (!showIntro) return null;
  return (
    <Tour
      onAfterChange={(tour, step) => {
        console.log("Intro step changed", step);
      }}
      onBeforeChange={(tour, element, index, direction) => {
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
      onStart={(tour) => {
        console.log("Intro started");
      }}
      onExit={(tour) => {
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
        {
          element: ".controls-display",
          title: "Control Display",
          intro: "This is where you can see the output of your scripts.",
        },
        {
          element: ".displays",
          title: "Displays",
          intro:
            "Here you can manage your displays. Click 'New Display' to create a new one.",
        },
        {
          element: ".layers",
          title: "Layers",
          intro: "This is where you can manage the layers of your scene.",
        },
        {
          element: ".inputs",
          title: "Inputs",
          intro: "This is where you can control the inputs for your setup.",
        },

        {
          element: ".animation-script-button",
          title: "Animation Script",
          intro:
            "This button opens the script editor for the animation role. You can write scripts that control the animation of your layer. Let's click it to open the editor.",
        },

        {
          element: "main",
          title: "Script Editor",
          intro:
            "This is where you can write and edit your scripts. You can switch between setup and animation roles.",
        },
      ]}
    />
  );
}
