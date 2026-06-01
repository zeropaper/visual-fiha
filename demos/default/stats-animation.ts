clear();

const now = Date.now();
const elapsed = read("time.elapsed", 0);
cache.lastFrameCountStart = cache.lastFrameCountStart || 0;
cache.fps = cache.fps || [];
cache.framesCount = cache.framesCount || 0;
if (now - cache.lastFrameCountStart > 200) {
  cache.lastFrameCountStart = now;
  cache.fps.push(cache.framesCount * 5);
  cache.fps = cache.fps.slice(width(-6));
  cache.framesCount = 0;
}
cache.framesCount += 1;

const fs = 6;
// Plotting some data
plot({
  data: cache.fps,
  color: "#f0f",
  left: width(2),
  right: width(),
  top: 0,
  bottom: height(2),
  legend: "center",
  fontSize: vmin(fs),
});
plot({
  data: read("audio.0.0.timeDomain.data", []).map((v) => v - 127),
  color: "#0ff",
  // min: -10,
  // max: 10,
  left: width(2),
  right: width(),
  top: height(),
  bottom: height(2),
  legend: "center",
  fontSize: vmin(fs),
});
plot({
  data: read("audio.0.0.frequency.data", []),
  color: "#ff0",
  left: 0,
  right: width(2),
  top: height(2),
  bottom: height(),
  legend: "center",
  fontSize: vmin(fs),
});

// Writing some text lines
fontSize(fs);
fontFamily("monospace");
textLines(
  [
    `time:  ${elapsed}ms`,
    `bpm:   ${read("bpm.bpm")}bpm`,
    `beat:  ${read("bpm.elapsed").toString().padStart(3, "0")}ms`,
  ],
  {
    fill: "lime",
    stroke: "black",
    position: "center",
    lineHeight: 1.218,
    x: width(4),
    y: height(4),
  },
);
