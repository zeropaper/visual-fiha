import introJs from "intro.js";
import "intro.js/introjs.css";
import { buttonStyles } from "@ui/Button";
import { useEffect, useRef } from "react";
import type { Prettify } from "../../../types";
import styles from "./Tour.module.css";

type Tour = ReturnType<typeof introJs.tour>;
type TourOptions = Parameters<Tour["setOptions"]>[0];

type TourOnMethods = {
  [K in keyof Tour as K extends `on${Capitalize<string>}`
    ? K
    : never]?: Tour[K] extends (handler: (...args: infer P) => infer R) => any
    ? (tour: Tour, ...args: P) => R
    : never;
};

export function Tour(props: Prettify<TourOptions & TourOnMethods>) {
  const tourRef = useRef<Tour | null>(null);
  // biome-ignore lint/correctness/useExhaustiveDependencies: mounting effect
  useEffect(() => {
    if (tourRef.current) {
      return;
    }
    tourRef.current = introJs.tour();
    const tour = tourRef.current;

    for (const [key, value] of Object.entries(props)) {
      if (
        typeof value === "function" &&
        key.startsWith("on") &&
        key.length > 2 &&
        key[2] === key[2].toUpperCase()
      ) {
        console.info(`Setting tour event handler: ${key}`);
        (tour as any)[key as any]?.((...args: any[]) => {
          return (value as (tour: Tour, ...args: any[]) => any)(tour, ...args);
        });
      }
    }

    requestAnimationFrame(() => {
      const options: TourOptions = Object.entries(props).reduce(
        (acc, [key, value]) => {
          if (typeof value !== "function") {
            acc[key as keyof TourOptions] = value as any;
          }
          return acc;
        },
        {
          steps: [],
          showProgress: true,
          showBullets: false,
          exitOnEsc: true,
          exitOnOverlayClick: true,
          tooltipClass: styles.tour,
          buttonClass: buttonStyles.button,
        } as TourOptions,
      );
      tour.setOptions(options);
      tour.onStart(() => {
        console.log("Tour started");
      });
      tour.start();
    });
    return () => {
      tourRef.current?.exit();
    };
  }, []);
  return null; // No UI component to render, just the tour functionality
}
