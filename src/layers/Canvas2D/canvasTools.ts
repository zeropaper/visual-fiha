/* eslint-disable @typescript-eslint/naming-convention */

interface OffscreenCanvas extends HTMLCanvasElement { }
interface OffscreenCanvasRenderingContext2D extends CanvasRenderingContext2D { }

import {
  PI2,
  arrayMax,
  arrayMin,
  arrayAvg,
  sDiv,
} from '../../utils/mathTools';
import { noop, repeat } from '../../utils/miscTools';

interface ImageCopyCoordinates {
  sx?: number;
  sy?: number;
  sw?: number;
  sh?: number;
  dx?: number;
  dy?: number;
  dw?: number;
  dh?: number;
}

export interface CTX extends OffscreenCanvasRenderingContext2D { }

export interface width { (divider?: number): number; }
export interface height { (divider?: number): number; }

export interface vmin { (multiplier: number): number; }
export interface vmax { (multiplier: number): number; }
export interface vh { (multiplier: number): number; }
export interface vw { (multiplier: number): number; }

export interface textLines {
  (lines: string[], opts?: {
    x?: number;
    y?: number;
    lineHeight?: number;
    position?: string;
    fill?: string | false;
    stroke?: string | false;
  }): void;
}

export interface mirror {
  (distance?: number, axis?: 'x' | 'y', img?: OffscreenCanvas): void;
}

export interface mediaType {
  (url: string): 'image' | 'video';
}

export interface clear {
  (): void;
}

export interface copy {
  (
    sx?: number,
    sy?: number,
    sw?: number,
    sh?: number,
    dx?: number,
    dy?: number,
    dw?: number,
    dh?: number,
  ): OffscreenCanvas;
}

interface PasteOperation {
  (
    src: CanvasImageSource & {
      videoWidth?: number;
      videoHeight?: number;
    }, opts?: ImageCopyCoordinates,
  ): void;
}

export interface pasteImage extends PasteOperation {}

export interface pasteContain extends PasteOperation {}

export interface pasteCover extends PasteOperation {}

export interface fontSize {
  (size: number, unit?: (v: number) => number): void;
}
export interface fontFamily { (familyName: string): void; }
export interface fontWeight { (weight: string | number): void; }

export interface plot {
  (opts?: {
    data?: any[];
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
    flipped?: boolean;
  }): void;
}

/**
 * Draws a circle
 */
export interface circle {
  (opts?: {
    x?: number;
    y?: number;
    radius?: number;
    stroke?: string;
    fill?: string;
  }): void;
}

export interface polygon {
  (opts?: {
    x?: number;
    y?: number;
    tilt?: number;
    sides?: number;
    radius?: number;
    stroke?: string;
    fill?: string;
  }): void;
}

export interface grid {
  (rows: number, cols: number, func: (...args: any[]) => void): void;
}

export interface centeredGrid {
  (opts: {
    cols: number,
    rows: number,
    dist: number,
    unit: (v: number) => number,
  }, cb: (...args: any[]) => void): void;
}

interface CTXMethod {
  (...args: any[]): any;
}
interface CTXValue<T> {
  (): T;
  (value: T): T;
}

export interface Canvas2DAPI {
  width: width;
  height: height;
  vw: vw;
  vh: vh;
  vmin: vmin;
  vmax: vmax;
  textLines: textLines;
  mirror: mirror;
  mediaType: mediaType;
  clear: clear;
  copy: copy;
  pasteImage: pasteImage;
  pasteContain: pasteContain;
  pasteCover: pasteCover;
  fontSize: fontSize;
  fontFamily: fontFamily;
  fontWeight: fontWeight;
  plot: plot;
  circle: circle;
  polygon: polygon;
  grid: grid;
  centeredGrid: centeredGrid;

  // based on OffscreenCanvasRenderingContext2D
  clip: CTXMethod;
  createImageData: CTXMethod;
  createLinearGradient: CTXMethod;
  createPattern: CTXMethod;
  createRadialGradient: CTXMethod;
  drawImage: CTXMethod;
  fill: CTXMethod;
  fillText: CTXMethod;
  getImageData: CTXMethod;
  getLineDash: CTXMethod;
  getTransform: CTXMethod;
  isPointInPath: CTXMethod;
  isPointInStroke: CTXMethod;
  measureText: CTXMethod;
  putImageData: CTXMethod;
  scale: CTXMethod;
  setLineDash: CTXMethod;
  setTransform: CTXMethod;
  stroke: CTXMethod;
  strokeText: CTXMethod;
  transform: CTXMethod;
  translate: CTXMethod;
  arc: CTXMethod;
  arcTo: CTXMethod;
  beginPath: CTXMethod;
  bezierCurveTo: CTXMethod;
  clearRect: CTXMethod;
  closePath: CTXMethod;
  ellipse: CTXMethod;
  fillRect: CTXMethod;
  lineTo: CTXMethod;
  moveTo: CTXMethod;
  quadraticCurveTo: CTXMethod;
  rect: CTXMethod;
  resetTransform: CTXMethod;
  restore: CTXMethod;
  rotate: CTXMethod;
  save: CTXMethod;
  strokeRect: CTXMethod;

  globalAlpha: CTXValue<CTX['globalAlpha']>;
  globalCompositeOperation: CTXValue<CTX['globalCompositeOperation']>;
  filter: CTXValue<CTX['filter']>;
  imageSmoothingEnabled: CTXValue<CTX['imageSmoothingEnabled']>;
  imageSmoothingQuality: CTXValue<CTX['imageSmoothingQuality']>;
  strokeStyle: CTXValue<CTX['strokeStyle']>;
  fillStyle: CTXValue<CTX['fillStyle']>;
  shadowOffsetX: CTXValue<CTX['shadowOffsetX']>;
  shadowOffsetY: CTXValue<CTX['shadowOffsetY']>;
  shadowBlur: CTXValue<CTX['shadowBlur']>;
  shadowColor: CTXValue<CTX['shadowColor']>;
  lineWidth: CTXValue<CTX['lineWidth']>;
  lineCap: CTXValue<CTX['lineCap']>;
  lineJoin: CTXValue<CTX['lineJoin']>;
  miterLimit: CTXValue<CTX['miterLimit']>;
  lineDashOffset: CTXValue<CTX['lineDashOffset']>;
  font: CTXValue<CTX['font']>;
  textAlign: CTXValue<CTX['textAlign']>;
  textBaseline: CTXValue<CTX['textBaseline']>;
  direction: CTXValue<CTX['direction']>;
}

export default function canvasTools(ctx: CTX) {
  if (!ctx) throw new Error('Missing context for canvasTools');
  const { canvas } = ctx;

  const width = (div = 1) => canvas.width * (1 / div);

  const height = (div = 1) => canvas.height * (1 / div);

  const vw = (count = 1) => canvas.width * 0.01 * count;

  const vh = (count = 1) => canvas.height * 0.01 * count;

  const vmin = (count = 1) => (Math.min(canvas.width, canvas.height) * 0.01 * count);

  const vmax = (count = 1) => (Math.max(canvas.width, canvas.height) * 0.01 * count);

  const textLines: textLines = (lines = [], opts = {}) => {
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

  const mirror: mirror = (distance = 0.5, axis = 'x', img = canvas as OffscreenCanvas) => {
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

  const mediaType: mediaType = (url) => (/\.(mp4|webm)$/.test(url) ? 'video' : 'image');

  const clear: clear = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
  };

  const copy: copy = (
    sx = 0,
    sy = 0,
    sw = canvas.width,
    sh = canvas.height,
    dx = 0,
    dy = 0,
    dw = canvas.width,
    dh = canvas.height,
  ) => {
    // @ts-ignore
    const ofc = new OffscreenCanvas(canvas.width, canvas.height) as HTMLCanvasElement;
    ofc.getContext('2d')?.drawImage(canvas, sx, sy, sw, sh, dx, dy, dw, dh);
    return ofc;
  };

  const pasteImage: pasteImage = (src, opts = {}) => {
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
  };

  const pasteContain: pasteContain = (src, opts = {}) => {
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
  };

  const pasteCover: pasteCover = (src, opts = {}) => {
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
  };

  const fontSize: fontSize = (size: number, unit = vmin) => {
    const parts = ctx.font.split(' ');
    if (parts.length === 2) {
      ctx.font = `normal ${unit(size)}px ${parts[1]}`;
    } else {
      ctx.font = `${parts[0]} ${unit(size)}px ${parts[2]}`;
    }
  };

  const fontFamily: fontFamily = (val = 'sans-serif') => {
    const parts = ctx.font.split(' ');
    if (parts.length === 2) {
      ctx.font = `normal ${parts[0]} ${val}`;
    } else {
      ctx.font = `${parts[0]} ${parts[1]} ${val}`;
    }
  };

  const fontWeight: fontWeight = (weight = 'normal') => {
    const parts = ctx.font.split(' ');
    if (parts.length === 2) {
      ctx.font = `${weight} ${parts[0]} ${parts[1]}`;
    } else {
      ctx.font = `${weight} ${parts[1]} ${parts[2]}`;
    }
  };

  const plot: plot = ({
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
  } = {}) => {
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
  };

  const circle: circle = ({
    x = width(),
    y = height(),
    radius = 10,
    stroke = '',
    fill = '',
  } = {}) => {
    if (stroke) ctx.strokeStyle = stroke;
    if (fill) ctx.fillStyle = fill;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, PI2);
    ctx.closePath();

    if (stroke) ctx.stroke();
    if (fill) ctx.fill();
  };

  const polygon: polygon = ({
    x = width(),
    y = height(),
    sides = 3,
    radius = 10,
    tilt = 0,
    stroke = '',
    fill = '',
  } = {}) => {
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
  };

  const grid: grid = (rows = 4, cols = 4, func = noop) => {
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
  };

  const centeredGrid: centeredGrid = ({
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
  };

  const baseTools = {
    width,
    height,
    vw,
    vh,
    vmin,
    vmax,
    textLines,
    mirror,
    mediaType,
    clear,
    copy,
    pasteImage,
    pasteContain,
    pasteCover,
    fontSize,
    fontFamily,
    fontWeight,
    plot,
    circle,
    polygon,
    grid,
    // TODO: redo grid in distributedGrid with same params and returned as centeredGrid
    centeredGrid,
  };

  const tools = { ...baseTools } as Canvas2DAPI;

  const instKeys = Object.keys(ctx)
    .filter((key) => !['function', 'object'].includes(key));
  const proto = ctx.constructor.prototype;

  Object.keys(proto)
    .filter((key) => !instKeys.includes(key))
    .forEach((key) => {
      if (key === 'canvas') return;

      const prop: any = (ctx as any)[key as string];
      if (typeof prop === 'function') {
        tools[key as keyof typeof tools] = prop.bind(ctx);
      } else if (!tools[key as keyof typeof tools]) {
        tools[key as keyof typeof tools] = (value = prop) => {
          // @ts-ignore
          if (prop !== value) ctx[key] = value;
          return prop;
        };
      }
    });

  return tools;
}
