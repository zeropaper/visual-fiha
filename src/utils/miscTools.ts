import blobURI2DataURI from "./blobURI2DataURI";
import deprecate from "./deprecate";

type ReadInterface = (name: string, defaultValue?: any) => any;

export const noop = (...args: any[]): any => {};

/**
 * Converts normalized RGBA values (0-1 range for r, g, b, and 0-1 for a) to a CSS rgba string.
 *
 * @param r - Red channel value (default is 0.5), normalized between 0 and 1.
 * @param g - Green channel value (default is 0.5), normalized between 0 and 1.
 * @param b - Blue channel value (default is 0.5), normalized between 0 and 1.
 * @param a - Alpha channel value (default is 1), normalized between 0 and 1.
 * @returns A CSS rgba color string, e.g., "rgba(128, 128, 128, 1.000)".
 */
export const rgba = (r = 0.5, g = 0.5, b = 0.5, a = 1) =>
  `rgba(${(r * 255).toFixed()}, ${(g * 255).toFixed()}, ${(
    b * 255
  ).toFixed()}, ${a.toFixed(3)})`;

/**
 * Generates an HSLA color string from normalized values.
 *
 * @param h - Hue value normalized between 0 and 1 (default: 0.5).
 * @param s - Saturation value normalized between 0 and 1 (default: 0.5).
 * @param l - Lightness value normalized between 0 and 1 (default: 0.5).
 * @param a - Alpha (opacity) value normalized between 0 and 1 (default: 1).
 * @returns A string representing the color in HSLA format, e.g., `hsla(180, 50%, 50%, 1.000)`.
 */
export const hsla = (h = 0.5, s = 0.5, l = 0.5, a = 1) =>
  `hsla(${(h * 360).toFixed()}, ${(s * 100).toFixed()}%, ${(
    l * 100
  ).toFixed()}%, ${a.toFixed(3)})`;

/**
 * Executes a provided function a specified number of times.
 *
 * @param times - The number of times to execute the function. Defaults to 1.
 * @param func - The function to execute. Receives the current iteration index and the total number of times as arguments.
 */
export const repeat = (times = 1, func = noop) => {
  for (let t = 0; t < times; t += 1) {
    func(t, times);
  }
};

export const assetDataURI = deprecate(async (asset: any) => {
  const uri = await blobURI2DataURI(asset.src);
  return uri;
}, "should not be used");

export const isFunction = (what: any) => typeof what === "function";

const toggled: Record<string, boolean> = {};
const prevToggle: Record<string, any> = {};
/**
 * Creates a toggle function for a given state name, allowing execution of callbacks when toggled on or off.
 *
 * @param read - A function that reads the current value of the state by name.
 * @param name - The name of the state to toggle.
 * @returns A function that takes two callbacks: `on` (called when toggled on) and `off` (called when toggled off).
 *
 * The returned function checks the current value of the state, toggles its value if changed,
 * and executes the appropriate callback based on the new state.
 *
 * @example
 * const toggleState = toggle(readState, 'isActive');
 * toggleState(() => console.log('Activated'), () => console.log('Deactivated'));
 */
export const toggle =
  (read: ReadInterface, name: string) => (on: any, off: any) => {
    const val = read(name);
    if (prevToggle[name] !== val && val) toggled[name] = !toggled[name];
    if (toggled[name] && isFunction(on)) on();
    if (!toggled[name] && isFunction(off)) off();
    prevToggle[name] = val;
    return toggled[name];
  };

/**
 * Executes callback functions based on the truthiness of a value read from a given interface.
 *
 * @param read - A function that takes a string and returns a value (typically used to read a property or state).
 * @param name - The name/key to be read from the interface.
 * @returns A function that takes two callbacks: `on` and `off`.
 *          - If the value read is truthy and `on` is a function, `on()` is called.
 *          - If the value read is falsy and `off` is a function, `off()` is called.
 *          - Returns the value read.
 */
export const inOut =
  (read: ReadInterface, name: string) => (on: any, off: any) => {
    const val = read(name);
    if (val && isFunction(on)) on();
    if (!val && isFunction(off)) off();
    return val;
  };

const steps: Record<string, number> = {};
const prevStepVals: Record<string, any> = {};
/**
 * Increments a step counter for a given name based on the value read from a provided interface.
 *
 * If the value for the given name is truthy and there was no previous value, the step counter is incremented by the specified distance.
 * The previous value for the name is then updated.
 *
 * @param read - A function that reads a value associated with a name, with an optional default value.
 * @param name - The identifier for the step counter.
 * @param distance - The amount to increment the step counter by (default is 1).
 * @returns The current step count for the given name.
 */
export const stepper = (read: ReadInterface, name: string, distance = 1) => {
  const val = read(name, 0);
  steps[name] = steps[name] || 0;
  if (!prevStepVals[name] && val) steps[name] += distance;
  prevStepVals[name] = val;
  return steps[name];
};

/**
 * Merges multiple objects into a single object.
 * Properties from later objects will overwrite those from earlier objects if they share the same key.
 *
 * @param objs - An array of objects to merge.
 * @returns A new object containing all properties from the input objects.
 */
export const merge = (...objs: Array<Record<string, any>>) => {
  const result: Record<string, any> = {};
  objs.forEach((obj) => {
    Object.keys(obj).forEach((key) => {
      result[key] = obj[key];
    });
  });
  return result;
};

export const miscTools = {
  // biome-ignore lint/correctness/noInvalidUseBeforeDeclaration: <explanation>
  rgba,
  // biome-ignore lint/correctness/noInvalidUseBeforeDeclaration: <explanation>
  hsla,
  // biome-ignore lint/correctness/noInvalidUseBeforeDeclaration: <explanation>
  repeat,
  // biome-ignore lint/correctness/noInvalidUseBeforeDeclaration: <explanation>
  noop,
  // biome-ignore lint/correctness/noInvalidUseBeforeDeclaration: <explanation>
  assetDataURI,
  // biome-ignore lint/correctness/noInvalidUseBeforeDeclaration: <explanation>
  isFunction,
  // biome-ignore lint/correctness/noInvalidUseBeforeDeclaration: <explanation>
  toggle,
  // biome-ignore lint/correctness/noInvalidUseBeforeDeclaration: <explanation>
  inOut,
  // biome-ignore lint/correctness/noInvalidUseBeforeDeclaration: <explanation>
  stepper,
  // biome-ignore lint/correctness/noInvalidUseBeforeDeclaration: <explanation>
  merge,
};

export default miscTools;

declare global {
  // biome-ignore lint/suspicious/noRedeclare: <explanation>
  const inOut: (typeof miscTools)["inOut"];
  // biome-ignore lint/suspicious/noRedeclare: <explanation>
  const rgba: (typeof miscTools)["rgba"];
  // biome-ignore lint/suspicious/noRedeclare: <explanation>
  const hsla: (typeof miscTools)["hsla"];
  // biome-ignore lint/suspicious/noRedeclare: <explanation>
  const repeat: (typeof miscTools)["repeat"];
  // biome-ignore lint/suspicious/noRedeclare: <explanation>
  const noop: (typeof miscTools)["noop"];
  // biome-ignore lint/suspicious/noRedeclare: <explanation>
  const assetDataURI: (typeof miscTools)["assetDataURI"];
  // biome-ignore lint/suspicious/noRedeclare: <explanation>
  const isFunction: (typeof miscTools)["isFunction"];
  // biome-ignore lint/suspicious/noRedeclare: <explanation>
  const toggle: (typeof miscTools)["toggle"];
  // biome-ignore lint/suspicious/noRedeclare: <explanation>
  const stepper: (typeof miscTools)["stepper"];
  // biome-ignore lint/suspicious/noRedeclare: <explanation>
  const merge: (typeof miscTools)["merge"];
}
