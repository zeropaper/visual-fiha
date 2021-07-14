import blobURI2DataURI from './blobURI2DataURI';

interface ReadInterface {
  (name: string, defaultValue?: any): any
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const noop = (...args: any[]): any => {};

const rgba = (r = 0.5, g = 0.5, b = 0.5, a = 1) => `rgba(${(r * 255).toFixed()}, ${(g * 255).toFixed()}, ${(b * 255).toFixed()}, ${a.toFixed(3)})`;

const hsla = (h = 0.5, s = 0.5, l = 0.5, a = 1) => `hsla(${(h * 360).toFixed()}, ${(s * 100).toFixed()}%, ${(l * 100).toFixed()}%, ${a.toFixed(3)})`;

const repeat = (times = 1, func = noop) => {
  for (let t = 0; t < times; t += 1) {
    func(t, times);
  }
};

const assetDataURI = async (asset: any) => {
  const uri = await blobURI2DataURI(asset.src);
  return uri;
};

const isFunction = (what: any) => typeof what === 'function';

const toggled: { [key: string]: boolean } = {};
const prevToggle: { [key: string]: any } = {};
const toggle = (read: ReadInterface, name: string) => (on: any, off: any) => {
  const val = read(name);
  if (prevToggle[name] !== val && val) toggled[name] = !toggled[name];
  if (toggled[name] && isFunction(on)) on();
  if (!toggled[name] && isFunction(off)) off();
  prevToggle[name] = val;
  return toggled[name];
};

const inOut = (read:ReadInterface, name:string) => (on: any, off: any) => {
  const val = read(name);
  if (val && isFunction(on)) on();
  if (!val && isFunction(off)) off();
  return val;
};

const steps: { [key: string]: number } = {};
const prevStepVals: { [key: string]: any } = {};
const stepper = (read:ReadInterface, name:string, distance = 1) => {
  const val = read(name, 0);
  steps[name] = steps[name] || 0;
  if (!prevStepVals[name] && val) steps[name] += distance;
  prevStepVals[name] = val;
  return steps[name];
};

const merge = (...objs: { [k: string]: any }[]) => {
  const result: { [k: string]: any } = {};
  objs.forEach((obj) => {
    Object.keys(obj).forEach((key) => {
      result[key] = obj[key];
    });
  });
  return result;
};

const reference = {
  read: {
    type: 'function',
    category: 'misc',
    description: 'Returns a "signal" value or a default value',
    usage: `// get the audio frequencies
  const frq = read('frequencies', []);
  // get the precise time
  const now = read('now', 0);`,
  },
  noop: {
    type: 'function',
    category: 'misc',
    description: 'Function that does not do anything',
  },
  rgba: {
    type: 'function',
    category: 'color',
    description: 'Returns a color string based on red, green, blue and alpha values from 0 to 1',
  },
  hsla: {
    type: 'function',
    category: 'color',
    description: 'Returns a color string based on hue, saturation, lightness and alpha values from 0 to 1',
  },
  repeat: {
    category: 'misc',
    type: 'function',
    description: 'Executes a callback a given amount of times',
    snippet: 'repeat(3, (t, times) => console.info(t, times));',
  },
  assetDataURI: {
    type: 'function',
    category: 'misc',
    description: 'Returns the data URI of an asset',
  },
  isFunction: {
    type: 'function',
    category: 'misc',
    description: 'Determine if something is a function',
  },
  toggle: {
    type: 'function',
    category: 'misc',
    description: 'Creates a function which can be used to execute 1 or 2 functions depending if a value is "on" or "off". See also inOut().',
    snippet: `// NOTE!
// you should actually use this function only in
// the SETUP script and keep its result in
// the cache object like:
//
// cache.keyA = toggle(read, 'a');
//
// and then in your ANIMATION script:
//
// cache.keyA(
//   () => { /* on */ },
//   () => { /* off */ }
// );`,
  },
  inOut: {
    type: 'function',
    category: 'misc',
    description: 'Creates a function which can be used to execute 1 or 2 functions depending if a value is "on" or "off". See also toggle().',
    snippet: `// NOTE!
// you should actually use this function only in
// the SETUP script and keep its result in
// the cache object like:
//
// cache.keyA = inOut(read, 'a');
//
// and then in your ANIMATION script:
//
// cache.keyA(
//   () => { /* on */ },
//   () => { /* off */ }
// );`,
  },
  stepper: {
    type: 'function',
    category: 'misc',
    description: 'Return a number which is incremented by 1 every time a read value changes from 0 to something bigger (key is pressed)',
    snippet: `const step = stepper(read, 'a');
textLines(['press on the "a" key of your keyboard', step]);`,
  },
  merge: {
    type: 'function',
    category: 'misc',
    description: 'Merges the objects together',
    snippet: `const merged = merge({ keyA: 'vala' }, { keyB: 'valb', keyC: 1 });
// -> { keyA: 'vala', keyB: 'valb', keyC: 1 }`,
  },
};

const tools = {
  rgba,
  hsla,
  repeat,
  noop,
  assetDataURI,
  isFunction,
  toggle,
  inOut,
  stepper,
  merge,
};

export const apiReference = reference;

export default tools;
