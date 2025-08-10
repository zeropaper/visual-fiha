import type { TourStep } from "@controls/features/Intro/types";

export const steps: Partial<TourStep>[] = [
  {
    element: ".tab-content",
    sidebarTab: "layers",
    position: "right",
    title: "Layers",
    intro: "This is where you can manage the layers of your scene.",
  },
];
