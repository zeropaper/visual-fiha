clear();
const now = read("time.elapsed", 0);

const fns = [
  () => 0,
  () => (now % height()) + height(-2),
  () => (-now % height()) + height(2),
  () => sin(now * 0.005) * height(2),
  () => cos(now * 0.005) * height(2),
  () => tan(now * 0.001) * height(10),
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
