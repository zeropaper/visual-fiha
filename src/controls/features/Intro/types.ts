import type introJs from "intro.js";
export type Tour = ReturnType<typeof introJs.tour>;
export type TourOptions = Parameters<Tour["setOptions"]>[0];

import type { TourStep as _TourStep } from "intro.js/src/packages/tour/steps";

export type { _TourStep as IntroTourStep };

export type TourStep = _TourStep & {
  sidebarTab?: string;
  onBeforeChange?: (
    tour: Tour,
    element: HTMLElement,
    index: number,
    direction: "forward" | "backward",
  ) => void | Promise<void>;
};

export type TourOnMethods = {
  [K in keyof Tour as K extends `on${Capitalize<string>}`
    ? K
    : never]?: Tour[K] extends (handler: (...args: infer P) => infer R) => any
    ? (tour: Tour, ...args: P) => R
    : never;
};
