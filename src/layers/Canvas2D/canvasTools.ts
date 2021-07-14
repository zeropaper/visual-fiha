import type { ScriptableAPIReference } from '../../types';

import MathTools from '../../utils/mathTools';
import MiscTools from '../../utils/miscTools';

const fetchCache: { [url: string]:Promise<any> } = {};

const {
  PI2,
  arrayMax,
  arrayMin,
  arrayAvg,
  sDiv,
} = MathTools;

const { noop, repeat } = MiscTools;

export type ImageCopyCoordinates = {
  sx?: number;
  sy?: number;
  sw?: number;
  sh?: number;
  dx?: number;
  dy?: number;
  dw?: number;
  dh?: number;
};

export type CTX = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

export default function canvasTools(ctx: CTX) {
  if (!ctx) throw new Error('Missing context for canvasTools');
  const { canvas } = ctx;

  const width = (div = 1) => canvas.width * (1 / div);
  width.category = 'canvas';
  width.type = 'function';
  width.description = 'Get width of the canvas or a division of it.';
  width.snippet = 'const val = width(10); // canvas width divided 10 times';

  const height = (div = 1) => canvas.height * (1 / div);
  height.category = 'canvas';
  height.type = 'function';
  height.description = 'Get height of the canvas or a division of it.';
  height.snippet = 'const val = height(10); // canvas height divided 10 times';

  const vw = (count = 1) => canvas.width * 0.01 * count;
  vw.category = 'canvas';
  vw.type = 'function';
  vw.description = 'Get width of the canvas or percents of it.';
  vw.snippet = 'const val = vw(10);';

  const vh = (count = 1) => canvas.height * 0.01 * count;
  vh.category = 'canvas';
  vh.type = 'function';
  vh.description = 'Get height of the canvas or percents of it.';
  vh.snippet = 'const val = vh(10);';

  const vmin = (count = 1) => (Math.min(canvas.width, canvas.height) * 0.01 * count);
  vmin.category = 'canvas';
  vmin.type = 'function';
  vmin.description = 'Get shortest side of the canvas or percents of it.';
  vmin.snippet = 'const val = vmin(10);';

  const vmax = (count = 1) => (Math.max(canvas.width, canvas.height) * 0.01 * count);
  vmax.category = 'canvas';
  vmax.type = 'function';
  vmax.description = 'Get longest side of the canvas or percents of it.';
  vmax.snippet = 'const val = vmax(10);';

  const textLines = (lines: string[] = [], opts:{
    x?: number;
    y?: number;
    lineHeight?: number;
    position?: string;
    fill?: string | false;
    stroke?: string | false;
  } = {}) => {
    const {
      x = width(2),
      y = height(2),
      position = 'center',
      fill = 'white',
      stroke = false,
      lineHeight = 1.618,
    } = opts;
    const lh = (parseInt(ctx.font, 10) || 20) * lineHeight;
    const linesHeight = lines.length * lh;
    let top = y - (linesHeight * 0.5);
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    switch (position) {
      case 'top':
        top = y;
        break;

      case 'bottom':
        top = y - linesHeight;
        break;

      case 'left':
        ctx.textAlign = 'left';
        break;

      case 'right':
        ctx.textAlign = 'right';
        break;

      case 'top-left':
        top = y;
        ctx.textAlign = 'left';
        break;

      case 'top-right':
        top = y;
        ctx.textAlign = 'right';
        break;

      case 'bottom-left':
        top = y - linesHeight;
        ctx.textAlign = 'left';
        break;

      case 'bottom-right':
        top = y - linesHeight;
        ctx.textAlign = 'right';
        break;

      default:
    }

    // if (stroke && stroke !== true) ctx.strokeStyle = stroke;
    // if (fill && fill !== true) ctx.fillStyle = fill;
    if (stroke) ctx.strokeStyle = stroke;
    if (fill) ctx.fillStyle = fill;

    let line;
    let h;
    for (let l = 0; l < lines.length; l += 1) {
      line = lines[l];
      h = (lh * (l + 0.5));
      if (stroke) ctx.strokeText(line, x, top + h);
      if (fill) ctx.fillText(line, x, top + h);
    }
  };
  textLines.category = 'canvas';
  textLines.type = 'function';
  textLines.description = 'Draws text on different lines.';
  textLines.snippet = `textLines([
  'first line',
  'second lines',
],
// default values
{
  x: width(2),
  y: height(2),
  position: 'center',
  // can be a color or false
  fill: 'white',
  // can be a color or false
  stroke: false,
  lineHeight: 1.618,
});`;
  textLines.args = [
    {
      name: 'lines',
      type: 'array',
      optional: true,
    },
  ];

  const mirror = (distance = 0.5, axis = 'x', img = canvas) => {
    let sx;
    let sy;
    let sw;
    let sh;
    let dx;
    let dy;
    let dw;
    let dh;
    let scaleX;
    let translateX;
    let translateY;

    if (axis === 'y') {
      sx = img.width * distance;
      sy = 0;
      sw = img.width * 0.5;
      sh = img.height;
      dx = 0;
      dy = 0;
      dw = canvas.width * 0.5;
      dh = canvas.height;
      scaleX = -1;
      translateX = 0 - canvas.width;
      translateY = 0;
    } else {
      sx = 0;
      sy = img.height * distance;
      sw = img.width;
      sh = img.height * 0.5;
      dx = 0;
      dy = 0;
      dw = canvas.width;
      dh = canvas.height * 0.5;
      scaleX = 1;
      translateX = 0;
      translateY = 0 - canvas.height;
    }
    ctx.save();

    ctx.scale(scaleX, scaleX * -1);
    ctx.translate(translateX, translateY);

    ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
    ctx.restore();

    ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
  };
  mirror.category = 'media';
  mirror.type = 'function';
  mirror.description = 'Mirrors the canvas or an image.';
  mirror.snippet = `// mirrors the current layer horizontally
mirror();
// mirrors a layer vertically
mirror(0.5, 'y' /*, read('layer:this-layer-name') */);
`;

  const mediaType = (url: string) => (/\.(mp4|webm)$/.test(url) ? 'video' : 'image');
  mediaType.category = 'media';
  mediaType.type = 'function';
  mediaType.description = 'Attempts to quickly determine the type of an URL.';

  const tools: { [k: string]: any } = {
    ...MathTools,
    width,
    height,
    vw,
    vh,
    vmin,
    vmax,
    textLines,
    mirror,

    clear: () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
    },

    copy: (
      sx = 0,
      sy = 0,
      sw = canvas.width,
      sh = canvas.height,
      dx = 0,
      dy = 0,
      dw = canvas.width,
      dh = canvas.height,
    ) => {
      const el = document.createElement('canvas');
      el.width = canvas.width;
      el.height = canvas.height;
      el.getContext('2d')?.drawImage(canvas, sx, sy, sw, sh, dx, dy, dw, dh);
      return el;
    },

    copyLayer: (layerName: string) => {
      throw new Error('Unsupported');
      const el = document.getElementById(layerName) as HTMLCanvasElement;
      if (!el) throw new Error(`layer ${layerName} not found`);
      const copied = document.createElement('canvas');
      copied.width = canvas.width;
      copied.height = canvas.height;
      copied
        .getContext('2d')?.drawImage(el, 0, 0, el.width, el.height, 0, 0, canvas.width, canvas.height);
      return copied;
    },

    pasteImage: (
      src: CanvasImageSource & {
        videoWidth?: number;
        videoHeight?: number;
      }, opts = {} as ImageCopyCoordinates,
    ) => {
      const w = (src.width || src.videoWidth || canvas.width || 0) as number;
      const h = (src.height || src.videoHeight || canvas.height || 0) as number;
      const {
        sx = 0,
        sy = 0,
        sw = w,
        sh = h,
        dx = (canvas.width - w) * 0.5,
        dy = (canvas.height - h) * 0.5,
        dw = w,
        dh = h,
      } = opts;
      ctx.drawImage(src, sx, sy, sw, sh, dx, dy, dw, dh);
    },

    pasteContain: (
      src: CanvasImageSource & {
        videoWidth?: number;
        videoHeight?: number;
      }, opts = {} as ImageCopyCoordinates,
    ) => {
      const w = (src.width || src.videoWidth || canvas.width || 0) as number;
      const h = (src.height || src.videoHeight || canvas.height || 0) as number;
      const wp = canvas.width / w;
      const hp = canvas.height / h;
      const p = Math.abs(wp) < Math.abs(hp) ? wp : hp;
      const ddw = p * w;
      const ddh = p * h;
      const {
        sx = 0,
        sy = 0,
        sw = w,
        sh = h,
        dx = (canvas.width - ddw) * 0.5,
        dy = (canvas.height - ddh) * 0.5,
        dw = ddw,
        dh = ddh,
      } = opts;
      ctx.drawImage(src, sx, sy, sw, sh, dx, dy, dw, dh);
    },

    pasteCover: (
      src: CanvasImageSource & {
        videoWidth?: number;
        videoHeight?: number;
      }, opts = {} as ImageCopyCoordinates,
    ) => {
      const w = (src.width || src.videoWidth || canvas.width || 0) as number;
      const h = (src.height || src.videoHeight || canvas.height || 0) as number;
      const wp = canvas.width / w;
      const hp = canvas.height / h;
      const p = Math.abs(wp) > Math.abs(hp) ? wp : hp;
      const ddw = p * w;
      const ddh = p * h;
      const {
        sx = 0,
        sy = 0,
        sw = w,
        sh = h,
        dx = (canvas.width - ddw) * 0.5,
        dy = (canvas.height - ddh) * 0.5,
        dw = ddw,
        dh = ddh,
      } = opts;
      ctx.drawImage(src, sx, sy, sw, sh, dx, dy, dw, dh);
    },

    fontSize: (size: number, unit = vmin) => {
      const parts = ctx.font.split(' ');
      if (parts.length === 2) {
        ctx.font = `normal ${unit(size)}px ${parts[1]}`;
      } else {
        ctx.font = `${parts[0]} ${unit(size)}px ${parts[2]}`;
      }
    },

    fontFamily: (val = 'sans-serif') => {
      const parts = ctx.font.split(' ');
      if (parts.length === 2) {
        ctx.font = `normal ${parts[0]} ${val}`;
      } else {
        ctx.font = `${parts[0]} ${parts[1]} ${val}`;
      }
    },

    fontWeight: (weight = 'normal') => {
      const parts = ctx.font.split(' ');
      if (parts.length === 2) {
        ctx.font = `${weight} ${parts[0]} ${parts[1]}`;
      } else {
        ctx.font = `${weight} ${parts[1]} ${parts[2]}`;
      }
    },

    // fontLoad: (val) => {
    // },

    fetch: (url: string) => {
      if (typeof fetchCache[url] !== 'undefined') return fetchCache[url];

      fetchCache[url] = new Promise((resolve, reject) => {
        fetch(url, { mode: 'cors' })
          .then((response) => response.blob())
          .then((blob) => {
            let obj;
            const type = mediaType(url);
            if (type === 'video') {
              obj = document.createElement('video');
              obj.src = URL.createObjectURL(blob);
              obj.muted = true;
              obj.loop = true;
              obj.play();
            } else {
              obj = new Image();
              obj.src = URL.createObjectURL(blob);
            }
            resolve(obj);
          })
          .catch(reject);
      });

      return fetchCache[url];
    },

    makeImage: (url: string) => {
      const obj = new Image();
      obj.src = url;
      return obj;
    },

    makeVideo: (url: string, opts = {} as {
      muted?: boolean;
      loop?: boolean;
    }) => {
      const {
        muted = true,
        loop = true,
      } = opts;
      const obj = document.createElement('video');
      obj.src = url;
      obj.muted = muted;
      obj.loop = loop;
      obj.play();
      return obj;
    },

    plot: ({
      data = [],
      min = arrayMin(data),
      max = arrayMax(data),
      samples = data.length,
      floor = 0,
      top = 0,
      bottom = canvas.height,
      left = 0,
      right = canvas.width,
      legend = 'top-left',
      color = '',
      fontSize: fs = vmin(3),
      flipped = false,
    }: {
      data?: any[],
      min?: number;
      max?: number;
      samples?: number;
      floor?: number;
      top?: number;
      bottom?: number;
      left?: number;
      right?: number;
      legend?: string;
      color?: string;
      fontSize?: number;
      flipped: boolean;
    }) => {
      const pWidth = right - left;
      const pHeight = bottom - top;
      const diff = Math.abs(min - max);
      const w = sDiv(pWidth, samples - 1);
      const h = sDiv(pHeight, diff);

      if (color) {
        ctx.strokeStyle = color;
      }

      ctx.setLineDash([3, 5]);
      ctx.beginPath();
      ctx.moveTo(left, bottom - (h * (floor - min)));
      ctx.lineTo(right, bottom - (h * (floor - min)));
      ctx.stroke();
      ctx.closePath();
      ctx.setLineDash([]);

      ctx.beginPath();

      let val;
      let py;
      let px;
      for (let v = 0; v < data.length; v += 1) {
        val = data[v];
        py = top + (pHeight - (h * (val - min)));
        px = flipped ? left + (pWidth - (w * v)) : (left + (w * v));
        if (v) {
          ctx.lineTo(px, py);
        } else {
          ctx.moveTo(px, py);
        }
      }
      ctx.stroke();
      ctx.closePath();

      if (!legend) return;
      let ptop: number;
      let pleft: number;
      switch (legend) {
        case 'top':
          ptop = top;
          pleft = left + (pWidth * 0.5);
          break;

        case 'bottom':
          ptop = bottom;
          pleft = left + (pWidth * 0.5);
          break;

        case 'left':
          ptop = top + (pHeight * 0.5);
          pleft = left;
          break;

        case 'right':
          ptop = top + (pHeight * 0.5);
          pleft = right;
          break;

        case 'top-left':
          ptop = top;
          pleft = right;
          break;

        case 'top-right':
          ptop = top;
          pleft = left;
          break;

        case 'bottom-left':
          ptop = bottom;
          pleft = right;
          break;

        case 'bottom-right':
          ptop = bottom;
          pleft = left;
          break;

        default:
          ptop = top + (pHeight * 0.5);
          pleft = left + (pWidth * 0.5);
      }

      const originalFont = ctx.font;
      ctx.font = `${fs}px monospace`;
      textLines(
        [
          `max: ${max.toFixed(3).padStart(7, ' ')}`,
          `avg: ${arrayAvg(data).toFixed(3).padStart(7, ' ')}`,
          `min: ${min.toFixed(3).padStart(7, ' ')}`,
        ],
        {
          x: pleft,
          y: ptop,
          position: legend,
          fill: color || 'white',
          stroke: 'black',
        },
      );
      ctx.font = originalFont;
    },

    circle: ({
      x,
      y,
      radius = 10,
      stroke = '',
      fill = '',
    }: {
      x: number;
      y: number;
      radius?: number;
      stroke?: string;
      fill?: string;
    }) => {
      if (stroke) ctx.strokeStyle = stroke;
      if (fill) ctx.fillStyle = fill;

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, PI2);
      ctx.closePath();

      if (stroke) ctx.stroke();
      if (fill) ctx.fill();
    },

    polygon: ({
      x,
      y,
      sides = 3,
      radius = 10,
      tilt = 0,
      stroke = '',
      fill = '',
    }: {
      x: number;
      y: number;
      tilt?: number;
      sides?: number;
      radius?: number;
      stroke?: string;
      fill?: string;
    }) => {
      let px;
      let py;
      const a = PI2 * (1 / sides);
      if (stroke) ctx.strokeStyle = stroke;
      if (fill) ctx.fillStyle = fill;

      ctx.beginPath();
      for (let s = 0; s < sides; s += 1) {
        px = x + (Math.sin(tilt + (a * s)) * radius);
        py = y + (Math.cos(tilt + (a * s)) * radius);
        ctx[!s ? 'moveTo' : 'lineTo'](px, py);
      }
      ctx.closePath();

      if (stroke) ctx.stroke();
      if (fill) ctx.fill();
    },

    grid: (rows = 4, cols = 4, func = noop) => {
      const xs = width(rows);
      const ys = height(cols);
      let x;
      let y;
      let n = 0;

      for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) {
          x = xs * (r + 0.5);
          y = ys * (c + 0.5);
          func(x, y, n, r, c);
          n += 1;
        }
      }
    },

    // TODO: redo grid in distributedGrid with same params and returned as centeredGrid

    centeredGrid: ({
      cols = 4,
      rows = 4,
      dist = vmin(10),
      unit = vmin,
    } = {
      cols: 4,
      rows: 4,
      dist: vmin(10),
      unit: vmin,
    }, cb = noop) => {
      const d = typeof dist === 'undefined'
        ? unit(100 / Math.max(Math.max(cols, 1), Math.max(rows, 1)))
        : dist;
      const xs = (width() - ((cols - 1) * d)) * 0.5;
      const ys = (height() - ((rows - 1) * d)) * 0.5;
      let n = 0;
      const data: any[] = [];

      repeat(rows, (r) => {
        const row: any[] = [];

        repeat(cols, (c) => {
          const args = {
            x: xs + (c * d),
            y: ys + (r * d),
            r,
            c,
            n,
            d,
          };
          cb(args);
          row.push(args);

          n += 1;
        });

        data.push(row);
      });

      return {
        x: xs,
        y: ys,
        size: d,
        data,
      };
    },
  };

  const reference: ScriptableAPIReference = {};
  reference.clear = {};
  reference.clear.category = 'canvas';
  reference.clear.type = 'function';
  reference.clear.description = 'Clears the whole canvas';
  reference.clear.snippet = 'clear();';

  reference.fontSize = {};
  reference.fontSize.category = 'canvas';
  reference.fontSize.type = 'function';
  reference.fontSize.description = 'Changes the size of text';
  // eslint-disable-next-line
  reference.fontSize.snippet = '// pass an amount and optionally a sizing function\nfontSize(2, vmax);';

  reference.fontWeight = {};
  reference.fontWeight.category = 'canvas';
  reference.fontWeight.type = 'function';
  reference.fontWeight.description = `Changes the weight of the text font.
  The possible values depend on the font but common values could be:
  * 100, 200, 300... to 700
  * "lighter", "light", "normal", "bold" and "bolder"`;
  reference.fontWeight.snippet = 'fontWeight(700);';

  reference.fontFamily = {};
  reference.fontFamily.category = 'canvas';
  reference.fontFamily.type = 'function';
  reference.fontFamily.description = `Common values are "sans", "sans-serif" or "monospace" but
  you could use other font families if they are loaded or installed locally.`;
  reference.fontFamily.snippet = 'fontFamily(700);';

  reference.plot = {};
  reference.plot.category = 'canvas';
  reference.plot.type = 'function';
  reference.plot.description = 'Plot given data';
  reference.plot.snippet = `const data = read('frequencies', []);
plot({
  data,
  min: arrayMin(data),
  max: arrayMax(data),
  samples: data.length,
  floor: arrayAvg(data),
  top: 0,
  bottom: height(),
  left: 0,
  right: width(),
  legend: 'top-left',
  color: 'lime',
  fontSize: vmin(2),
});`;

  reference.circle = {};
  reference.circle.category = 'canvas';
  reference.circle.type = 'function';
  reference.circle.description = 'Draws a circle';
  reference.circle.snippet = `circle({
  x: width(3),
  y: height(2),
  radius: vmin(25),
  stroke: null,
  fill: '#fff',
});`;

  reference.polygon = {};
  reference.polygon.category = 'canvas';
  reference.polygon.type = 'function';
  reference.polygon.description = 'Draws a polygon';
  reference.polygon.snippet = `polygon({
  x: width(3),
  y: height(2),
  sides: 5,
  radius: vmin(25),
  tilt: 6,
  stroke: null,
  fill: '#fff',
});`;

  reference.grid = {};
  reference.grid.category = 'canvas';
  reference.grid.type = 'function';
  reference.grid.description = 'Executes a callback with grid coordinates as arguments. The first and second arguments represent the number of rows and columns. The third argument is the callback to be executed.';
  reference.grid.snippet = `grid(3, 4, (x, y, n, r, c) => {
// circle({ x, y, radius: vmin(5), fill: 'white' })
});`;

  reference.centeredGrid = {};
  reference.centeredGrid.category = 'canvas';
  reference.centeredGrid.type = 'function';
  reference.centeredGrid.description = 'Executes a callback following a grid, centered on the screen, of equal width and height. .';
  reference.centeredGrid.snippet = `const cols = 5;
const rows = 5;
const result = centeredGrid({
  cols,
  rows,
  dist: abs(read('frequencies')[64] - 70),
  unit: vmin, // function (vmin, vmax, vw, vh)
}, ({
  x, y, // x, y position
  c, r, // column and row number
  n, // number
  d, // distance
}) => {
  circle({
    x, y,
    radius: d * 0.5,
    stroke: true,
  });
});

strokeRect(
  result.x,
  result.y,
  result.size * (cols - 1),
  result.size * (rows - 1)
);`;

  reference.copy = {};
  reference.copy.category = 'canvas';
  reference.copy.type = 'function';
  reference.copy.description = 'Copy the canvas as an image for later manipulation';
  reference.copy.snippet = 'cache.img = copy();\npasteImage(cache.img);';

  reference.copyLayer = {};
  reference.copyLayer.category = 'canvas';
  reference.copyLayer.type = 'function';
  reference.copyLayer.description = 'Copy the canvas of a layer as an image for later manipulation';
  reference.copyLayer.snippet = 'cache.img = copyLayer(\'someLayerName\');\npasteImage(cache.img);';

  reference.makeImage = {};
  reference.makeImage.category = 'canvas';
  reference.makeImage.type = 'function';
  reference.makeImage.description = 'Creates an image object from a URL';
  reference.makeImage.snippet = 'makeImage(\'http://someurl.org/img.png\')';

  reference.pasteImage = {};
  reference.pasteImage.category = 'canvas';
  reference.pasteImage.type = 'function';
  reference.pasteImage.description = 'Put an image on the canvas';
  reference.pasteImage.snippet = `/*
You should fetch the image in the setup script and make it available in the cache

fetch('https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Golden_tabby_and_white_kitten_n03.jpg/1024px-Golden_tabby_and_white_kitten_n03.jpg')
  .then(img => cache.img = img)
  .catch(err => console.info(err));
*/

// in a animation script
clear();
if (!cache.img) return;
pasteImage(cache.img);
`;

  reference.pasteContain = {};
  reference.pasteContain.category = 'canvas';
  reference.pasteContain.type = 'function';
  // eslint-disable-next-line
  reference.pasteContain.description = 'Put an image on the canvas so that the image is contained in the available surface';
  reference.pasteContain.snippet = `/*
You should fetch the image in the setup script and make it available in the cache

fetch('https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Golden_tabby_and_white_kitten_n03.jpg/1024px-Golden_tabby_and_white_kitten_n03.jpg')
  .then(img => cache.img = img)
  .catch(err => console.info(err));
*/

// in a animation script
clear();
if (!cache.img) return;
pasteContain(cache.img);
`;

  reference.pasteCover = {};
  reference.pasteCover.category = 'canvas';
  reference.pasteCover.type = 'function';
  // eslint-disable-next-line
  reference.pasteCover.description = 'Put an image on the canvas so that the image covers the whole surface';
  reference.pasteCover.snippet = `/*
You should fetch the image in the setup script and make it available in the cache

fetch('https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Golden_tabby_and_white_kitten_n03.jpg/1024px-Golden_tabby_and_white_kitten_n03.jpg')
  .then(img => cache.img = img)
  .catch(err => console.info(err));
*/

// in a animation script
clear();
if (!cache.img) return;
pasteCover(cache.img);
`;

  reference.fetch = {};
  reference.fetch.category = 'canvas';
  reference.fetch.type = 'function';
  // eslint-disable-next-line
  reference.fetch.description = 'Fetch a media (image or video) for later use';
  reference.fetch.snippet = `// You should fetch the image in the setup script
fetch('https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Golden_tabby_and_white_kitten_n03.jpg/1024px-Golden_tabby_and_white_kitten_n03.jpg')
  .then(img => cache.img = img)
  .catch(err => console.info(err));
`;

  const instKeys = Object.keys(ctx)
    .filter((key) => !['function', 'object'].includes(key));
  const proto = ctx.constructor.prototype;

  Object.keys(proto)
    .filter((key) => !instKeys.includes(key))
    .forEach((key) => {
      if (key === 'canvas') return;
      reference[key] = {};

      const prop: any = (ctx as any)[key as string];
      if (typeof prop === 'function') {
        tools[key] = prop.bind(ctx);

        reference[key].category = 'canvas';
        reference[key].type = 'function';
        reference[key].description = `Utility function for CanvasRenderingContext2D.${key}()`;
      } else if (!tools[key]) {
        tools[key] = (value = prop) => {
          // @ts-ignore
          if (prop !== value) ctx[key] = value;
          return prop;
        };

        reference[key].category = 'canvas';
        reference[key].type = 'function';
        reference[key].description = `Utility function for CanvasRenderingContext2D.${key} (read or write)`;
      }

      // eslint-disable-next-line
      reference[key].link = `https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/${key}`;
    });

  return tools;
}
