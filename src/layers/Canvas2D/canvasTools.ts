import mathTools from "../../utils/mathTools";
import { noop, repeat } from "../../utils/miscTools";

interface OffscreenCanvas extends HTMLCanvasElement {}
interface OffscreenCanvasRenderingContext2D extends CanvasRenderingContext2D {}

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

export interface CTX extends OffscreenCanvasRenderingContext2D {}

/**
 * Gets the width of the canvas
 * @param divider - optional divider to scale the width
 * @returns the width of the canvas
 */
type width = (divider?: number) => number;
/**
 * Gets the height of the canvas
 * @param divider - optional divider to scale the height
 * @returns the height of the canvas
 */
type height = (divider?: number) => number;

/**
 * Gets X percents of the minimum viewport height
 * @param multiplier - multiplier to scale the height
 * @returns the minimum viewport height
 */
type vmin = (multiplier: number) => number;
/**
 * Gets X percents of the maximum viewport height
 * @param multiplier - multiplier to scale the height
 * @returns the maximum viewport height
 */
type vmax = (multiplier: number) => number;
/**
 * Gets X percents of the viewport height
 * @param multiplier - multiplier to scale the height
 * @returns the viewport height
 */
type vh = (multiplier: number) => number;
/**
 * Gets X percents of the viewport width
 * @param multiplier - multiplier to scale the width
 * @returns the viewport width
 */
type vw = (multiplier: number) => number;

/**
 * Draws text on the canvas
 * @param lines - array of text lines to draw
 * @param opts - options
 * @param opts.x - x position to draw the text
 * @param opts.y - y position to draw the text
 * @param opts.lineHeight - line height of the text
 * @param opts.position - text position (e.g. "left", "center", "right")
 * @param opts.fill - fill color of the text
 * @param opts.stroke - stroke color of the text
 */
type textLines = (
  lines: string[],
  opts?: {
    x?: number;
    y?: number;
    lineHeight?: number;
    position?: string;
    fill?: string | false;
    stroke?: string | false;
  },
) => void;

/**
 * Mirrors the canvas content
 * @param distance - distance to mirror
 * @param axis - axis to mirror across
 * @param img - image to mirror
 */
type mirror = (
  distance?: number,
  axis?: "x" | "y",
  img?: OffscreenCanvas,
) => void;

type mediaType = (url: string) => "image" | "video";

type clear = () => void;

/**
 * Copies a portion of the canvas
 * @param sx - source x position
 * @param sy - source y position
 * @param sw - source width
 * @param sh - source height
 * @param dx - destination x position
 * @param dy - destination y position
 * @param dw - destination width
 * @param dh - destination height
 */
type copy = (
  sx?: number,
  sy?: number,
  sw?: number,
  sh?: number,
  dx?: number,
  dy?: number,
  dw?: number,
  dh?: number,
) => OffscreenCanvas;

type PasteOperation = (
  src: CanvasImageSource & {
    width?: number;
    height?: number;
    videoWidth?: number;
    videoHeight?: number;
  },
  opts?: ImageCopyCoordinates,
) => void;

/**
 * Pastes an image onto the canvas
 * @param src - source image
 * @param opts - options
 * @param opts.sx - source x position
 * @param opts.sy - source y position
 * @param opts.sw - source width
 * @param opts.sh - source height
 * @param opts.dx - destination x position
 * @param opts.dy - destination y position
 * @param opts.dw - destination width
 * @param opts.dh - destination height
 */
interface pasteImage extends PasteOperation {}

/**
 * Pastes an image onto the canvas while containing it within the specified dimensions
 * @param src - source image
 * @param opts - options
 * @param opts.sx - source x position
 * @param opts.sy - source y position
 * @param opts.sw - source width
 * @param opts.sh - source height
 * @param opts.dx - destination x position
 * @param opts.dy - destination y position
 * @param opts.dw - destination width
 * @param opts.dh - destination height
 */
interface pasteContain extends PasteOperation {}

/**
 * Pastes an image onto the canvas while covering the specified dimensions
 * @param src - source image
 * @param opts - options
 * @param opts.sx - source x position
 * @param opts.sy - source y position
 * @param opts.sw - source width
 * @param opts.sh - source height
 * @param opts.dx - destination x position
 * @param opts.dy - destination y position
 * @param opts.dw - destination width
 * @param opts.dh - destination height
 */
interface pasteCover extends PasteOperation {}

type fontSize = (size: number, unit?: (v: number) => number) => void;
type fontFamily = (familyName: string) => void;
type fontWeight = (weight: string | number) => void;

type plot = (opts?: {
  data?: any[];
  min?: number;
  max?: number;
  samples?: number;
  floor?: number;
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  legend?:
    | "center"
    | "top"
    | "bottom"
    | "left"
    | "right"
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right";
  color?: string;
  fontSize?: number;
  flipped?: boolean;
}) => void;

/**
 * Draws a circle
 * @param opts - options
 * @param opts.x - x position
 * @param opts.y - y position
 * @param opts.radius - radius
 * @param opts.stroke - stroke color
 * @param opts.fill - fill color
 */
type circle = (opts?: {
  x?: number;
  y?: number;
  radius?: number;
  stroke?: string;
  fill?: string;
}) => void;

/**
 * Draws a polygon
 * @param opts - options
 * @param opts.x - x position
 * @param opts.y - y position
 * @param opts.tilt - tilt angle
 * @param opts.sides - number of sides
 */
type polygon = (opts?: {
  x?: number;
  y?: number;
  tilt?: number;
  sides?: number;
  radius?: number;
  stroke?: string;
  fill?: string;
}) => void;

/**
 * Call a function for each cell in a grid
 * @param rows - number of rows
 * @param cols - number of columns
 * @param func - function to call for each cell
 */
type grid = (
  rows: number,
  cols: number,
  func: (...args: any[]) => void,
) => void;

/**
 * Call a function for each cell in a centered grid
 * @param opts - options
 * @param opts.cols - number of columns
 * @param opts.rows - number of rows
 */
type centeredGrid = (
  opts: {
    cols?: number;
    rows?: number;
    dist?: number;
    unit?: (v: number) => number;
  },
  cb: (args: {
    x: number;
    y: number;
    r: number;
    c: number;
    n: number;
    d: number;
  }) => void,
) => void;

type CTXMethod<N extends keyof CTX> = CTX[N];
interface CTXValue<T> {
  (): T;
  (value: T): T;
}

export default function canvasTools(ctx: CTX) {
  if (!ctx) throw new Error("Missing context for canvasTools");
  const { canvas } = ctx;

  const width = (div = 1) => canvas.width * (1 / div);

  const height = (div = 1) => canvas.height * (1 / div);

  const vw = (count = 1) => canvas.width * 0.01 * count;

  const vh = (count = 1) => canvas.height * 0.01 * count;

  const vmin = (count = 1) =>
    Math.min(canvas.width, canvas.height) * 0.01 * count;

  const vmax = (count = 1) =>
    Math.max(canvas.width, canvas.height) * 0.01 * count;

  const textLines: textLines = (lines = [], opts = {}) => {
    const {
      x = width(2),
      y = height(2),
      position = "center",
      fill = "white",
      stroke = false,
      lineHeight = 1.618,
    } = opts;
    const lh = (Number.parseInt(ctx.font, 10) || 20) * lineHeight;
    const linesHeight = lines.length * lh;
    let top = y - linesHeight * 0.5;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";

    switch (position) {
      case "top":
        top = y;
        break;

      case "bottom":
        top = y - linesHeight;
        break;

      case "left":
        ctx.textAlign = "left";
        break;

      case "right":
        ctx.textAlign = "right";
        break;

      case "top-left":
        top = y;
        ctx.textAlign = "left";
        break;

      case "top-right":
        top = y;
        ctx.textAlign = "right";
        break;

      case "bottom-left":
        top = y - linesHeight;
        ctx.textAlign = "left";
        break;

      case "bottom-right":
        top = y - linesHeight;
        ctx.textAlign = "right";
        break;

      default:
    }

    // if (stroke && stroke !== true) ctx.strokeStyle = stroke;
    // if (fill && fill !== true) ctx.fillStyle = fill;
    if (stroke) ctx.strokeStyle = stroke;
    if (fill) ctx.fillStyle = fill;

    let line: string;
    let h: number;
    for (let l = 0; l < lines.length; l += 1) {
      line = lines[l];
      h = lh * (l + 0.5);
      if (stroke) ctx.strokeText(line, x, top + h);
      if (fill) ctx.fillText(line, x, top + h);
    }
  };

  const mirror: mirror = (
    distance = 0.5,
    axis = "x",
    img = canvas as OffscreenCanvas,
  ) => {
    let sx: number;
    let sy: number;
    let sw: number;
    let sh: number;
    let dx: number;
    let dy: number;
    let dw: number;
    let dh: number;
    let scaleX: number;
    let translateX: number;
    let translateY: number;

    if (axis === "y") {
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

  const mediaType: mediaType = (url) =>
    /\.(mp4|webm)$/.test(url) ? "video" : "image";

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
    // @ts-expect-error
    const ofc = new OffscreenCanvas(
      canvas.width,
      canvas.height,
    ) as HTMLCanvasElement;
    ofc.getContext("2d")?.drawImage(canvas, sx, sy, sw, sh, dx, dy, dw, dh);
    return ofc;
  };

  const pasteImage: pasteImage = (src, opts = {}) => {
    const w = src.width ?? src.videoWidth ?? canvas.width ?? 0;
    const h = src.height ?? src.videoHeight ?? canvas.height ?? 0;
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
    const w = src.width ?? src.videoWidth ?? canvas.width ?? 0;
    const h = src.height ?? src.videoHeight ?? canvas.height ?? 0;
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
    const w = src.width ?? src.videoWidth ?? canvas.width ?? 0;
    const h = src.height ?? src.videoHeight ?? canvas.height ?? 0;
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
    const parts = ctx.font.split(" ");
    if (parts.length === 2) {
      ctx.font = `normal ${unit(size)}px ${parts[1]}`;
    } else {
      ctx.font = `${parts[0]} ${unit(size)}px ${parts[2]}`;
    }
  };

  const fontFamily: fontFamily = (val = "sans-serif") => {
    const parts = ctx.font.split(" ");
    if (parts.length === 2) {
      ctx.font = `normal ${parts[0]} ${val}`;
    } else {
      ctx.font = `${parts[0]} ${parts[1]} ${val}`;
    }
  };

  const fontWeight: fontWeight = (weight = "normal") => {
    const parts = ctx.font.split(" ");
    if (parts.length === 2) {
      ctx.font = `${weight} ${parts[0]} ${parts[1]}`;
    } else {
      ctx.font = `${weight} ${parts[1]} ${parts[2]}`;
    }
  };

  const plot: plot = ({
    data = [],
    min = mathTools.arrayMin(data),
    max = mathTools.arrayMax(data),
    samples = data.length,
    floor = 0,
    top = 0,
    bottom = canvas.height,
    left = 0,
    right = canvas.width,
    legend,
    color = "",
    fontSize: fs = vmin(3),
    flipped = false,
  } = {}) => {
    const pWidth = right - left;
    const pHeight = bottom - top;
    const diff = Math.abs(min - max);
    const w = mathTools.sDiv(pWidth, samples - 1);
    const h = mathTools.sDiv(pHeight, diff);

    if (color) {
      ctx.strokeStyle = color;
    }

    ctx.beginPath();

    let val: number;
    let py: number;
    let px: number;
    for (let v = 0; v < data.length; v += 1) {
      val = data[v];
      py = top + (pHeight - h * (val - min));
      px = flipped ? left + (pWidth - w * v) : left + w * v;
      if (v) {
        ctx.lineTo(px, py);
      } else {
        ctx.moveTo(px, py);
      }
    }
    ctx.stroke();
    ctx.closePath();

    if (!legend) return;
    ctx.setLineDash([3, 5]);
    ctx.beginPath();
    ctx.moveTo(left, bottom - h * (floor - min));
    ctx.lineTo(right, bottom - h * (floor - min));
    ctx.stroke();
    ctx.closePath();
    ctx.setLineDash([]);

    let ptop: number;
    let pleft: number;
    switch (legend) {
      case "top":
        ptop = top;
        pleft = left + pWidth * 0.5;
        break;

      case "bottom":
        ptop = bottom;
        pleft = left + pWidth * 0.5;
        break;

      case "left":
        ptop = top + pHeight * 0.5;
        pleft = left;
        break;

      case "right":
        ptop = top + pHeight * 0.5;
        pleft = right;
        break;

      case "top-left":
        ptop = top;
        pleft = right;
        break;

      case "top-right":
        ptop = top;
        pleft = left;
        break;

      case "bottom-left":
        ptop = bottom;
        pleft = right;
        break;

      case "bottom-right":
        ptop = bottom;
        pleft = left;
        break;

      default:
        ptop = top + pHeight * 0.5;
        pleft = left + pWidth * 0.5;
    }

    const originalFont = ctx.font;
    ctx.font = `${fs}px monospace`;
    textLines(
      [
        `max: ${max.toFixed(3).padStart(7, " ")}`,
        `avg: ${arrayAvg(data).toFixed(3).padStart(7, " ")}`,
        `min: ${min.toFixed(3).padStart(7, " ")}`,
      ],
      {
        x: pleft,
        y: ptop,
        position: legend,
        fill: color || "white",
        stroke: "black",
      },
    );
    ctx.font = originalFont;
  };

  const circle: circle = ({
    x = width(),
    y = height(),
    radius = 10,
    stroke = "",
    fill = "",
  } = {}) => {
    if (stroke) ctx.strokeStyle = stroke;
    if (fill) ctx.fillStyle = fill;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, mathTools.PI2);
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
    stroke = "",
    fill = "",
  } = {}) => {
    let px: number;
    let py: number;
    const a = mathTools.PI2 * (1 / sides);
    if (stroke) ctx.strokeStyle = stroke;
    if (fill) ctx.fillStyle = fill;

    ctx.beginPath();
    for (let s = 0; s < sides; s += 1) {
      px = x + Math.sin(tilt + a * s) * radius;
      py = y + Math.cos(tilt + a * s) * radius;
      ctx[!s ? "moveTo" : "lineTo"](px, py);
    }
    ctx.closePath();

    if (stroke) ctx.stroke();
    if (fill) ctx.fill();
  };

  const grid: grid = (rows = 4, cols = 4, func = noop) => {
    const xs = width(rows);
    const ys = height(cols);
    let x: number;
    let y: number;
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

  const centeredGrid: centeredGrid = (
    { cols = 4, rows = 4, dist = vmin(10), unit = vmin } = {
      cols: 4,
      rows: 4,
      dist: vmin(10),
      unit: vmin,
    },
    cb = noop,
  ) => {
    const d =
      typeof dist === "undefined"
        ? unit(100 / Math.max(Math.max(cols, 1), Math.max(rows, 1)))
        : dist;
    const xs = (width() - (cols - 1) * d) * 0.5;
    const ys = (height() - (rows - 1) * d) * 0.5;
    let n = 0;
    const data: any[] = [];

    repeat(rows, (r) => {
      const row: any[] = [];

      repeat(cols, (c) => {
        const args = {
          x: xs + c * d,
          y: ys + r * d,
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

  const tools = { ...baseTools };

  const instKeys = Object.keys(ctx).filter(
    (key) => !["function", "object"].includes(key),
  );
  const proto = ctx.constructor.prototype;

  Object.keys(proto)
    .filter((key) => !instKeys.includes(key))
    .forEach((key) => {
      if (key === "canvas") return;

      const prop: any = (ctx as any)[key];
      if (typeof prop === "function") {
        tools[key as keyof typeof tools] = prop.bind(ctx);
      } else if (!tools[key as keyof typeof tools]) {
        tools[key as keyof typeof tools] = (value = prop) => {
          // biome-ignore lint/suspicious/noTsIgnore: false positive
          // @ts-ignore
          if (prop !== value) ctx[key] = value;
          return prop;
        };
      }
    });

  return tools;
}

declare global {
  const width: width;
  const height: height;
  const vw: vw;
  const vh: vh;
  const vmin: vmin;
  const vmax: vmax;
  const textLines: textLines;
  const mirror: mirror;
  const mediaType: mediaType;
  const clear: clear;
  const copy: copy;
  const pasteImage: pasteImage;
  const pasteContain: pasteContain;
  const pasteCover: pasteCover;
  const fontSize: fontSize;
  const fontFamily: fontFamily;
  const fontWeight: fontWeight;
  const plot: plot;
  const circle: circle;
  const polygon: polygon;
  const grid: grid;
  const centeredGrid: centeredGrid;

  const clip: CTXMethod<"clip">;
  const createImageData: CTXMethod<"createImageData">;
  const createLinearGradient: CTXMethod<"createLinearGradient">;
  const createPattern: CTXMethod<"createPattern">;
  const createRadialGradient: CTXMethod<"createRadialGradient">;
  const drawImage: CTXMethod<"drawImage">;
  const fill: CTXMethod<"fill">;
  const fillText: CTXMethod<"fillText">;
  const getImageData: CTXMethod<"getImageData">;
  const getLineDash: CTXMethod<"getLineDash">;
  const getTransform: CTXMethod<"getTransform">;
  const isPointInPath: CTXMethod<"isPointInPath">;
  const isPointInStroke: CTXMethod<"isPointInStroke">;
  const measureText: CTXMethod<"measureText">;
  const putImageData: CTXMethod<"putImageData">;
  const scale: CTXMethod<"scale">;
  const setLineDash: CTXMethod<"setLineDash">;
  const setTransform: CTXMethod<"setTransform">;
  const stroke: CTXMethod<"stroke">;
  const strokeText: CTXMethod<"strokeText">;
  const transform: CTXMethod<"transform">;
  const translate: CTXMethod<"translate">;
  const arc: CTXMethod<"arc">;
  const arcTo: CTXMethod<"arcTo">;
  const beginPath: CTXMethod<"beginPath">;
  const bezierCurveTo: CTXMethod<"bezierCurveTo">;
  const clearRect: CTXMethod<"clearRect">;
  const closePath: CTXMethod<"closePath">;
  const ellipse: CTXMethod<"ellipse">;
  const fillRect: CTXMethod<"fillRect">;
  const lineTo: CTXMethod<"lineTo">;
  // // @ts-expect-error
  // const moveTo: CTXMethod<'moveTo'>;
  const quadraticCurveTo: CTXMethod<"quadraticCurveTo">;
  const rect: CTXMethod<"rect">;
  const resetTransform: CTXMethod<"resetTransform">;
  const restore: CTXMethod<"restore">;
  const rotate: CTXMethod<"rotate">;
  const save: CTXMethod<"save">;
  const strokeRect: CTXMethod<"strokeRect">;

  const globalAlpha: CTXValue<CTX["globalAlpha"]>;
  const globalCompositeOperation: CTXValue<CTX["globalCompositeOperation"]>;
  const filter: CTXValue<CTX["filter"]>;
  const imageSmoothingEnabled: CTXValue<CTX["imageSmoothingEnabled"]>;
  const imageSmoothingQuality: CTXValue<CTX["imageSmoothingQuality"]>;
  const strokeStyle: CTXValue<CTX["strokeStyle"]>;
  const fillStyle: CTXValue<CTX["fillStyle"]>;
  const shadowOffsetX: CTXValue<CTX["shadowOffsetX"]>;
  const shadowOffsetY: CTXValue<CTX["shadowOffsetY"]>;
  const shadowBlur: CTXValue<CTX["shadowBlur"]>;
  const shadowColor: CTXValue<CTX["shadowColor"]>;
  const lineWidth: CTXValue<CTX["lineWidth"]>;
  const lineCap: CTXValue<CTX["lineCap"]>;
  const lineJoin: CTXValue<CTX["lineJoin"]>;
  const miterLimit: CTXValue<CTX["miterLimit"]>;
  const lineDashOffset: CTXValue<CTX["lineDashOffset"]>;
  const font: CTXValue<CTX["font"]>;
  const textAlign: CTXValue<CTX["textAlign"]>;
  const textBaseline: CTXValue<CTX["textBaseline"]>;
  const direction: CTXValue<CTX["direction"]>;
}
