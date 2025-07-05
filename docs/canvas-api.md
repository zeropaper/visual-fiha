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

You can write it like this in Visual Fiha:

```ts
fillStyle("red");
fillRect(10, 10, 100, 100);
```