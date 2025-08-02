# Layers

Layers are aimed at rendering visual content in the Visual Fiha system. 

## Controls

In the sidebar, layers can be tuned on or off, their opacity can be adjusted, and they can be reordered.

## Types of Layers

- [**Canvas layers**](#canvas-api): These are used to draw graphics onto a canvas element.
- [**ThreeJS layers**](#threejs-api): These are used to render 3D graphics using the Three.js library.

## Commnon API

All layers have a `setup` and `animation` scripts.  
The `setup` script is run once when it is modified, and the `animation` script is run on every frame.  
It is possible to pass data from the `setup` script to the `animation` script using the `cache` object (available globally).
All layer scripts have a set of global functions available to them, such as:
* `read`: A function to [read input values](#inputs) (e.g., MIDI, audio, time, etc.).
* Math utilities: `sin`, `cos`, `tan`, `sqrt`, `pow`, etc. These functions are the same as the JavaScript Math functions, but they are available globally without needing to call `Math.` prefix.

### The `cache` Global Object

The `cache` object is a global object that can be used to store data between the `setup` and `animation` scripts.  
It is useful for storing data that needs to be accessed in the `animation` script after it has been set in the `setup` script.  
For example, you can store a value in the `setup` script like this:

```js
cache.myValue = 42;
```
And then access it in the `animation` script like this:
```js
const myValue = cache.myValue;
```

### Utilities

All layer types have access to a common set of utility functions that make it easier to work with colors, control flow, data manipulation, and more.

#### Color Functions

##### rgba()

Creates an RGBA color string from normalized values (0-1).

```ts
rgba(r?: number, g?: number, b?: number, a?: number): string;
```

**Parameters:**
- `r` (default: 0.5): Red component (0-1)
- `g` (default: 0.5): Green component (0-1) 
- `b` (default: 0.5): Blue component (0-1)
- `a` (default: 1): Alpha/opacity component (0-1)

**Example:**
```js
fillStyle(rgba(1, 0, 0, 0.8)); // Semi-transparent red
fillStyle(rgba(0.2, 0.8, 0.4)); // Green with default opacity
```

##### hsla()

Creates an HSLA color string from normalized values (0-1).

```ts
hsla(h?: number, s?: number, l?: number, a?: number): string;
```

**Parameters:**
- `h` (default: 0.5): Hue component (0-1, maps to 0-360 degrees)
- `s` (default: 0.5): Saturation component (0-1, maps to 0-100%)
- `l` (default: 0.5): Lightness component (0-1, maps to 0-100%)
- `a` (default: 1): Alpha/opacity component (0-1)

**Example:**
```js
fillStyle(hsla(0.6, 0.8, 0.5)); // Blue with high saturation
fillStyle(hsla(0.1, 1, 0.5, 0.7)); // Semi-transparent orange
```

#### Control Flow Functions

##### repeat()

Executes a function a specified number of times, passing the current iteration and total count.

```ts
repeat(times: number, func: (iteration: number, total: number) => void): void;
```

**Parameters:**
- `times`: Number of times to execute the function
- `func`: Function to execute on each iteration

**Example:**
```js
repeat(5, (i, total) => {
  circle({ x: i * 50, y: 100, radius: 20 });
});
```

##### noop()

A no-operation function that does nothing. Useful as a default callback or placeholder.

```ts
noop(...args: any[]): any;
```

**Example:**
```js
const callback = someCondition ? myFunction : noop;
```

##### toggle()

Creates a toggle function that alternates between on and off states based on input changes.

```ts
toggle(read: ReadInterface, name: string): (on: Function, off: Function) => boolean;
```

**Parameters:**
- `read`: The read function for accessing input values
- `name`: Name of the input to monitor

**Returns:** A function that takes `on` and `off` callbacks and returns the current toggle state.

**Example:**
```js
const myToggle = toggle(read, 'midiNote60');
myToggle(
  () => console.log('Note pressed!'),
  () => console.log('Note released!')
);
```

##### inOut()

Executes functions based on whether an input is active (truthy) or inactive.

```ts
inOut(read: ReadInterface, name: string): (on: Function, off: Function) => any;
```

**Parameters:**
- `read`: The read function for accessing input values
- `name`: Name of the input to monitor

**Returns:** A function that takes `on` and `off` callbacks and returns the current input value.

**Example:**
```js
const gateHandler = inOut(read, 'audioGate');
gateHandler(
  () => { /* Audio is above threshold */ },
  () => { /* Audio is below threshold */ }
);
```

##### stepper()

Creates a step counter that increments when an input transitions from false to true.

```ts
stepper(read: ReadInterface, name: string, distance?: number): number;
```

**Parameters:**
- `read`: The read function for accessing input values
- `name`: Name of the input to monitor
- `distance` (default: 1): Amount to increment on each step

**Returns:** Current step count.

**Example:**
```js
const step = stepper(read, 'midiNote60', 2);
// step will be 0, 2, 4, 6, ... each time the note is pressed
```

#### Data Functions

##### isFunction()

Checks if a value is a function.

```ts
isFunction(value: any): boolean;
```

**Example:**
```js
if (isFunction(callback)) {
  callback();
}
```

##### merge()

Merges multiple objects into a single object. Later objects override earlier ones.

```ts
merge(...objects: Array<Record<string, any>>): Record<string, any>;
```

**Example:**
```js
const config = merge(
  { color: 'red', size: 10 },
  { color: 'blue', opacity: 0.8 }
);
// Result: { color: 'blue', size: 10, opacity: 0.8 }
```

##### assetDataURI()

Converts an asset to a data URI for use in scripts.

```ts
assetDataURI(asset: any): Promise<string>;
```

**Parameters:**
- `asset`: Asset object with a `src` property

**Returns:** Promise that resolves to a data URI string.

**Example:**
```js
// In setup script
cache.imageDataURI = await assetDataURI(myImageAsset);

// In animation script
const img = new Image();
img.src = cache.imageDataURI;
```

#### Math Functions

All standard JavaScript Math functions are available globally without the `Math.` prefix, plus additional mathematical utilities for creative coding.

##### Basic Math Functions

All these functions work exactly like their JavaScript `Math` equivalents but are available globally:

**Trigonometric Functions:**
- `sin(x)`, `cos(x)`, `tan(x)` - Basic trigonometric functions
- `asin(x)`, `acos(x)`, `atan(x)`, `atan2(y, x)` - Inverse trigonometric functions
- `sinh(x)`, `cosh(x)`, `tanh(x)` - Hyperbolic functions
- `asinh(x)`, `acosh(x)`, `atanh(x)` - Inverse hyperbolic functions

**Exponential and Logarithmic:**
- `exp(x)`, `expm1(x)` - Exponential functions
- `log(x)`, `log1p(x)`, `log2(x)`, `log10(x)` - Logarithmic functions
- `pow(x, y)`, `sqrt(x)`, `cbrt(x)` - Power and root functions

**Rounding and Comparison:**
- `floor(x)`, `ceil(x)`, `round(x)`, `trunc(x)` - Rounding functions
- `abs(x)`, `sign(x)` - Absolute value and sign
- `max(...values)`, `min(...values)` - Maximum and minimum values

**Other Math Functions:**
- `random()` - Random number between 0 and 1
- `hypot(...values)` - Euclidean norm (square root of sum of squares)

##### Math Constants

**Standard Constants:**
- `PI` - π (3.14159...)
- `E` - Euler's number (2.71828...)
- `LN2`, `LN10` - Natural logarithms of 2 and 10
- `LOG2E`, `LOG10E` - Base 2 and 10 logarithms of E
- `SQRT1_2`, `SQRT2` - Square roots

**Extended Constants:**
- `PI2` - 2π (6.28318...) - Useful for full rotations
- `GR` - Golden ratio (1.618033988)

##### Utility Math Functions

##### sDiv()

Safe division that multiplies by the reciprocal.

```ts
sDiv(value: number, divisor: number): number;
```

**Example:**
```js
const halfWidth = sDiv(width(), 2); // Same as width() * (1/2)
```

##### deg2rad() / rad2deg()

Convert between degrees and radians.

```ts
deg2rad(degrees: number): number;
rad2deg(radians: number): number;
```

**Example:**
```js
const angle = deg2rad(45); // Convert 45 degrees to radians
const degrees = rad2deg(PI / 4); // Convert π/4 radians to degrees
```

##### cap()

Constrains a value between minimum and maximum bounds.

```ts
cap(value: number, min?: number, max?: number): number;
```

**Parameters:**
- `value`: Value to constrain
- `min` (default: 0): Minimum value
- `max` (default: 127): Maximum value

**Example:**
```js
const constrainedValue = cap(mouseX, 0, width()); // Keep mouseX within canvas width
```

##### between()

Checks if a value is between two bounds.

```ts
between(value: number, min?: number, max?: number): boolean;
```

**Example:**
```js
if (between(mouseY, 100, 200)) {
  // Mouse Y is between 100 and 200
}
```

##### beatPrct()

Calculates the percentage progress through a beat at given BPM.

```ts
beatPrct(now: number, bpm?: number): number;
```

**Parameters:**
- `now`: Current time in milliseconds
- `bpm` (default: 120): Beats per minute

**Returns:** Value between 0 and 1 representing beat progress.

**Example:**
```js
const beatProgress = beatPrct(read('time'), 140);
const pulse = sin(beatProgress * PI2); // Creates a sine wave synced to beat
```

##### Array Utilities

**Statistical Functions:**
- `arrayMax(array)` - Maximum value in array
- `arrayMin(array)` - Minimum value in array
- `arraySum(array)` - Sum of all values
- `arrayAvg(array)` - Average of all values
- `arrayDiff(array)` - Difference between max and min

**Array Manipulation:**
- `arrayMirror(array)` - Duplicates array with reversed copy appended
- `arrayDownsample(array, samples)` - Reduces array size by sampling every nth element
- `arraySmooth(array, factor)` - Smooths array by averaging neighboring values

**Example:**
```js
const audioData = read('audio.0.0.frequency.data');
const maxFreq = arrayMax(audioData);
const smoothedData = arraySmooth(audioData, 3);
```

##### Geometry Utilities

##### orientation()

Determines if dimensions represent landscape or portrait orientation.

```ts
orientation(width: number, height: number): "landscape" | "portrait";
```

##### containBox() / coverBox()

Scale one box to fit within or cover another box while maintaining aspect ratio.

```ts
containBox(box1: Box, box2: Box): Box;
coverBox(box1: Box, box2: Box): Box;
```

**Example:**
```js
const imageBox = { width: 800, height: 600 };
const canvasBox = { width: width(), height: height() };
const fitted = containBox(imageBox, canvasBox); // Fit image within canvas
```
