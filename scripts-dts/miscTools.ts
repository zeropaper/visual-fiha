import type * as miscTools from '../src/utils/miscTools';

declare global {
  const noop: typeof miscTools.noop;
  const rgba: typeof miscTools.rgba;
  const hsla: typeof miscTools.hsla;
  const repeat: typeof miscTools.repeat;
  const assetDataURI: typeof miscTools.assetDataURI;
  const isFunction: typeof miscTools.isFunction;
  const toggled: typeof miscTools.toggled;
  const prevToggle: typeof miscTools.prevToggle;
  const toggle: typeof miscTools.toggle;
  const inOut: typeof miscTools.inOut;
  const steps: typeof miscTools.steps;
  const prevStepVals: typeof miscTools.prevStepVals;
  const stepper: typeof miscTools.stepper;
  const merge: typeof miscTools.merge;
}

export { };
