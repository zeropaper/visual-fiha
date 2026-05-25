clear();
const now = read("time.elapsed", 0);

const fns = [
  () => 0,
  () => {
    const fAvg = read("audio.0.0.frequency.average", 90) - 90;
    return fAvg * (1 / 90) * height(2);
  },
  () => {
    const fAvg = read("audio.0.0.frequency.median", 90) - 90;
    return fAvg * (1 / 90) * height(2);
  },
  () => {
    const fAvg = read("audio.0.0.timeDomain.average", 127) - 127;
    return fAvg * (1 / 90) * height(2);
  },
  () => {
    const fAvg = read("audio.0.0.timeDomain.median", 127) - 127;
    return fAvg * (1 / 90) * height(2);
  },
];

const xGap = width(fns.length);
const xBase = xGap * 0.5;

const yBase = height(2);

fns.forEach((fn, f) => {
  circle({
    y: yBase + fn(),
    x: xGap * f + xBase,
    fill: "lime",
  });
});
