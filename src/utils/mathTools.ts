type Box = { width: number, height: number };

const PI2 = Math.PI * 2;

const GR = 1.6180339887498948482;

const sDiv = (val: number, div: number): number => val * (1 / div);

const arrayMax = (arr: number[]) => arr.reduce((val, prev) => Math.max(val, prev), 0);

const arrayMin = (arr: number[]) => arr.reduce((val, prev) => Math.min(val, prev), Infinity);

const arraySum = (arr: number[]) => arr.reduce((val, prev) => val + prev, 0);

const arrayDiff = (arr: number[]) => (Math.abs(arrayMax(arr) - arrayMin(arr)));

const arrayAvg = (arr: number[]) => sDiv(arraySum(arr), arr.length);

const arrayMirror = (arr: number[]) => [...arr, ...arr.reverse()];

const arrayDownsample = (arr: number[], samples = 2) => {
  const result: number[] = [];
  arr.forEach((item, i) => {
    if ((i % samples) === 0) result.push(item);
  });
  return result;
};

const arraySmooth = (arr: number[], factor = 2) => arr.reduce((acc: number[], val: number, index: number) => {
  acc.push(arrayAvg(arr.slice(index, index + factor)));
  return acc;
}, []);

const deg2rad = (deg:number) => (PI2 / 360) * deg;

const rad2deg = (rad:number) => (360 / PI2) * rad;

const cap = (val:number, min = 0, max = 127) => Math.min(Math.max(val, min), max);

const between = (val:number, min = 0, max = 127) => val < max && val > min;

const beatPrct = (now:number, bpm = 120) => {
  const timeBetweenBeats = sDiv(60, bpm) * 1000;
  return cap(sDiv(now % timeBetweenBeats, timeBetweenBeats), 0, 1);
};

const beat = (now:number, bpm = 120) => {
  // eslint-disable-next-line no-console
  console.log('[DERECATED]: beat(), use beatPrct() instead');
  return beatPrct(now, bpm);
};

const orientation = (width: number, height: number) => (width >= height ? 'landscape' : 'portrait');

const objOrientation = (obj: Box) => orientation(obj.width, obj.height);

const containBox = (box1: Box, box2: Box) => {
  const { width, height } = box1;
  const { width: box2Width, height: box2Height } = box2;
  const { width: box1Width, height: box1Height } = box1;
  const x = (box2Width / box1Width) * width;
  const y = (box2Height / box1Height) * height;
  return { width: x, height: y };
};

const coverBox = (box1: Box, box2: Box) => {
  const { width, height } = box1;
  const { width: box2Width, height: box2Height } = box2;
  const { width: box1Width, height: box1Height } = box1;
  const x = (box1Width / box2Width) * width;
  const y = (box1Height / box2Height) * height;
  return { width: x, height: y };
};

const reference: {
  [key: string]: {
    type?: string;
    category: string;
    description?: string;
    link?: string;
    usage?: string;
    snippet?: string;
  }
} = {
  PI2: {
    type: 'number',
    category: 'math',
    description: 'Shortcut to Math.PI * 2',
  },
  GR: {
    type: 'number',
    category: 'math',
    description: 'Golden ratio',
  },
  sDiv: {
    type: 'function',
    category: 'math',
    description: 'Error safe division (by avoiding: 0 / x)',
    usage: 'const dividedX = sDiv(x, y);',
  },
  arrayMax: {
    type: 'function',
    category: 'math',
    description: 'Get the maximal value in a array',
    usage: 'const maxVal = arrayMax([1, 3, 4]); // maxVal will be 4',
  },
  arrayMin: {
    type: 'function',
    category: 'math',
    description: 'Get the minimal value in a array',
    usage: 'const minVal = arrayMin([1, 3, 4]); // minVal will be 1',
  },
  arraySum: {
    type: 'function',
    category: 'math',
    description: 'Get the sum of array values',
    usage: 'const sumVal = arraySum([1, 3, 4]); // sumVal will be 8',
  },
  arrayDiff: {
    type: 'function',
    category: 'math',
    description: 'Get the difference between the maximal and minimal values in a array',
    usage: 'const diffVal = arrayDiff([1, 2, 4]); // diffVall will be 3',
  },
  arrayAvg: {
    type: 'function',
    category: 'math',
    description: 'Calculates the average of the values of an array.',
    usage: 'const arrayAvg([2, 4, 6]); // returns 6',
  },
  arrayMirror: {
    type: 'function',
    category: 'math',
    description: 'Mirrors the values of an array. The resulting array will have a length twice as hight as the given array.',
    usage: 'const arrayMirror([2, 4, 6]); // => [2, 4, 6, 6, 4, 2]',
  },
  arrayDownsample: {
    type: 'function',
    category: 'math',
    description: 'Downsamles an array by eliminating some of its keys.',
    usage: 'const downsampled = arrayDownsample([1, 2, 3, 4, 1, 2, 3, 4], 2); // [1, 3, 1, 3]',
  },
  arraySmooth: {
    type: 'function',
    category: 'math',
    description: 'Smooth the values of an array (useful with audio)',
    snippet: `const smthFrq = arraySmooth(
    read('frequencies', []),
    10
  );`,
  },
  deg2rad: {
    type: 'function',
    category: 'math',
    description: 'Converts degrees into radians.',
    usage: 'const deg2rad(degrees);',
  },
  rad2deg: {
    type: 'function',
    category: 'math',
    description: 'Converts radians into dergrees.',
    usage: 'const rad2deg(radians);',
  },
  cap: {
    type: 'function',
    category: 'math',
    description: 'Returns a value capped between "min" and "max".',
    usage: 'const val = between(random(), 0.25, 0.75);',
  },
  between: {
    type: 'function',
    category: 'math',
    description: 'Returns true if a value is between "min" and "max".',
    usage: 'const val = between(0.5, 0.25, 0.75); // true',
  },
  beatPrct: {
    type: 'function',
    category: 'math',
    description: 'Takes "now" and ',
    usage: 'const bPrct = beatPrct(read(\'now\'), read(\'bpm\', 120));',
  },
  beat: {
    // ...reference.beatPrct,
    category: 'deprecated',
  },
  orientation: {
    type: 'function',
    category: 'math',
    description: 'Returns "landscape" or "portrait" based on the width and height arguments.',
  },
  objOrientation: {
    type: 'function',
    category: 'math',
    description: 'Returns "landscape" or "portrait" based on the width and height properties of an object.',
  },
  containBox: {
    type: 'function',
    category: 'math',
    description: 'Returns a box with the width and height of the first box that fits inside the second box.',
  },
  coverBox: {
    type: 'function',
    category: 'math',
    description: 'Returns a box with the width and height of the first box that covers the second box.',
  },
};

const tools: { [k: string]: any } = {
  PI2,
  GR,
  arrayMax,
  arrayMin,
  arraySum,
  arrayDiff,
  arrayAvg,
  arrayMirror,
  arrayDownsample,
  arraySmooth,
  deg2rad,
  rad2deg,
  sDiv,
  cap,
  between,
  beat,
  beatPrct,
  orientation,
  objOrientation,
  containBox,
  coverBox,
};

Object.getOwnPropertyNames(Math)
  .forEach((key: string) => {
    tools[key] = Math[key as keyof Math];
    const type = typeof Math[key as keyof Math];
    reference[key] = {
      type,
      category: 'math',
      description: `Equivalent of Math.${key}${type === 'function' ? '()' : ''}`,
      // eslint-disable-next-line
      link: `https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/${key}`,
    };
  });

export const apiReference = reference;

export default tools;
