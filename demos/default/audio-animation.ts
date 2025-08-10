clear();
const keys = Object.keys(read("audio", {}));
keys.forEach((key, i) => {
  plot({
    data: read(`audio.${key}.0.timeDomain.data` as any, []).map(
      (v: number) => v - 127,
    ),
    color: hsla((1 / keys.length) * i, 1, 0.5, 0.5),
    top: 0,
    bottom: height(),
    left: 0,
    right: width(),
    min: -100,
    max: 100,
    // legend: 'center',
    // fontSize: vmin(fs)
  });
});
