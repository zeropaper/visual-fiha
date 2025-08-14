clear();

// const image: ImageBitmap = read('asset./images/uv-checker.png');
// pasteContain(image, {
//   dx: width(-4),
//   dy: height(4),
// });

const layer: OffscreenCanvas = read("asset.wobblyball");
pasteContain(layer, {
  dx: width(4),
  dy: height(-4),
});
pasteContain(layer, {
  dx: width(-4),
  dy: height(4),
});
pasteContain(layer, {
  dx: width(4),
  dy: height(4),
});
pasteContain(layer, {
  dx: width(-4),
  dy: height(-4),
});
