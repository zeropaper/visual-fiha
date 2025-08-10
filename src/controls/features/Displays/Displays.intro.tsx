import type { TourStep } from "@controls/features/Intro/types";

export const steps: Partial<TourStep>[] = [
  {
    element: ".tab-content",
    position: "right",
    sidebarTab: "displays",
    title: "Displays",
    intro:
      "Here you can manage your displays. Click 'New Display' to create a new one.",
  },
];
