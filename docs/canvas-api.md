# Canvas 2D layer API

The 2D canvas API is analogous to the HTML5 Canvas API, allowing you to draw shapes, text, and images.

The main difference is that all the 2D context methods and properties are available as global functions.

If you are used to writing something like this:

```js
const canvas = document
  .getElementById("myCanvas");
const ctx = canvas.getContext("2d");
ctx.fillStyle = "red";
ctx.fillRect(10, 10, 100, 100);
```

You must write it like this in Visual Fiha:

```ts
fillStyle("red");
fillRect(10, 10, 100, 100);
```

# Utilities

## Drawing

### circle()

Draws a circle at the specified position with the given radius.

```ts
circle(opts?: {
  x?: number;
  y?: number;
  radius?: number;
  stroke?: string;
  fill?: string;
}): void;
```

## Sizing

Working with sizes is crucial to maintaining the proportions of your drawings and ensuring they fit within the canvas.

If you consider writing something like this:

```ts
const width = canvas.width;
const height = canvas.height;

const centerX = width / 2;
const centerY = height / 2;
```

You must actually write it like this:

```ts
const centerX = width(2);
const centerY = height(2);
```

### height()

Gets the height of the canvas.
If you want half the height, you can use pass `2` as the divider.

```ts
height(divider: number): number;
```

### width()

Gets the width of the canvas.
If you want half the width, you can use pass `2` as the divider.

```ts
width(divider: number): number;
```

### vh()

Similar to the CSS `vh` unit, this function returns a value based on the viewport height.
If you want half the viewport height, you can pass `50` as the multiplier.

```ts
vh(multiplier: number): number;
```

### vw()
Similar to the CSS `vw` unit, this function returns a value based on the viewport width.
If you want half the viewport width, you can pass `50` as the multiplier.

```ts
vw(multiplier: number): number;
```

### vmin()
Similar to the CSS `vmin` unit, this function returns a value based on the smaller of the viewport width and height.
If you want half the smaller dimension, you can pass `50` as the multiplier.

```ts
vmin(multiplier: number): number;
```

### vmax()
Similar to the CSS `vmax` unit, this function returns a value based on the larger of the viewport width and height.
If you want half the larger dimension, you can pass `50` as the multiplier.

```ts
vmax(multiplier: number): number;
```

## Text and Typography

### textLines()

Renders multiple lines of text at once with configurable positioning and styling.

```ts
textLines(lines: string[], opts?: {
  x?: number;
  y?: number;
  lineHeight?: number;
  position?: "center" | "top" | "bottom" | "left" | "right" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
  fill?: string | false;
  stroke?: string | false;
}): void;
```

### fontSize()

Sets the font size using a specified unit function (defaults to vmin).

```ts
fontSize(size: number, unit?: (v: number) => number): void;
```

### fontFamily()

Sets the font family for text rendering.

```ts
fontFamily(familyName: string): void;
```

### fontWeight()

Sets the font weight for text rendering.

```ts
fontWeight(weight: string | number): void;
```

## Drawing Utilities

### circle()

Draws a circle at the specified position with the given radius.

```ts
circle(opts?: {
  x?: number;
  y?: number;
  radius?: number;
  stroke?: string;
  fill?: string;
}): void;
```

### polygon()

Draws a polygon with the specified number of sides.

```ts
polygon(opts?: {
  x?: number;
  y?: number;
  tilt?: number;
  sides?: number;
  radius?: number;
  stroke?: string;
  fill?: string;
}): void;
```

### clear()

Clears the entire canvas and begins a new path.

```ts
clear(): void;
```

## Grid Systems

### grid()

Creates a grid layout and executes a function for each cell.

```ts
grid(rows: number, cols: number, func: (x: number, y: number, n: number, r: number, c: number) => void): void;
```

### centeredGrid()

Creates a centered grid with equal spacing between elements.

```ts
centeredGrid(
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
  }) => void
): void;
```

## Image and Media

### copy()

Creates a copy of the current canvas or a portion of it.

```ts
copy(
  sx?: number,
  sy?: number,
  sw?: number,
  sh?: number,
  dx?: number,
  dy?: number,
  dw?: number,
  dh?: number
): OffscreenCanvas;
```

### pasteImage()

Pastes an image onto the canvas at the specified coordinates.

```ts
pasteImage(src: CanvasImageSource, opts?: {
  sx?: number;
  sy?: number;
  sw?: number;
  sh?: number;
  dx?: number;
  dy?: number;
  dw?: number;
  dh?: number;
}): void;
```

### pasteContain()

Pastes an image onto the canvas, scaling it to fit within the canvas while maintaining aspect ratio.

```ts
pasteContain(src: CanvasImageSource, opts?: {
  sx?: number;
  sy?: number;
  sw?: number;
  sh?: number;
  dx?: number;
  dy?: number;
  dw?: number;
  dh?: number;
}): void;
```

### pasteCover()

Pastes an image onto the canvas, scaling it to cover the entire canvas while maintaining aspect ratio.

```ts
pasteCover(src: CanvasImageSource, opts?: {
  sx?: number;
  sy?: number;
  sw?: number;
  sh?: number;
  dx?: number;
  dy?: number;
  dw?: number;
  dh?: number;
}): void;
```

### mirror()

Creates a mirror effect by reflecting the canvas content along the specified axis.

```ts
mirror(distance?: number, axis?: "x" | "y", img?: OffscreenCanvas): void;
```

### mediaType()

Determines the media type of a URL (image or video).

```ts
mediaType(url: string): "image" | "video";
```

## Data Visualization

### plot()

Draws a line plot of data with optional styling and legend.

```ts
plot(opts?: {
  data?: any[];
  min?: number;
  max?: number;
  samples?: number;
  floor?: number;
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  legend?: "center" | "top" | "bottom" | "left" | "right" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
  color?: string;
  fontSize?: number;
  flipped?: boolean;
}): void;
```

## Canvas Context Properties and Methods

All standard Canvas 2D context methods and properties are available as global functions. For properties, you can call them with no arguments to get the current value, or with an argument to set a new value.

### Drawing Methods

- `arc()`, `arcTo()`, `beginPath()`, `bezierCurveTo()`, `clearRect()`, `closePath()`
- `ellipse()`, `fillRect()`, `lineTo()`, `moveTo()`, `quadraticCurveTo()`, `rect()`
- `strokeRect()`, `fill()`, `stroke()`, `clip()`

### Text Methods

- `fillText()`, `strokeText()`, `measureText()`

### Image Methods

- `drawImage()`, `createImageData()`, `getImageData()`, `putImageData()`

### Transform Methods

- `scale()`, `translate()`, `rotate()`, `transform()`, `setTransform()`, `resetTransform()`
- `save()`, `restore()`, `getTransform()`

### Gradient and Pattern Methods

- `createLinearGradient()`, `createRadialGradient()`, `createPattern()`

### Path and Hit Testing

- `isPointInPath()`, `isPointInStroke()`

### Line Dash Methods

- `getLineDash()`, `setLineDash()`

### Properties (getter/setter functions)

- `globalAlpha()`, `globalCompositeOperation()`, `filter()`
- `imageSmoothingEnabled()`, `imageSmoothingQuality()`
- `strokeStyle()`, `fillStyle()`
- `shadowOffsetX()`, `shadowOffsetY()`, `shadowBlur()`, `shadowColor()`
- `lineWidth()`, `lineCap()`, `lineJoin()`, `miterLimit()`, `lineDashOffset()`
- `font()`, `textAlign()`, `textBaseline()`, `direction()`