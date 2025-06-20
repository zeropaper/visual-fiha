/* 
declare global {
  interface Cache {
    lastValues: number[];
  }
}
// fix issue with global type declaration above in the script editor
export { };
*/


clear();

const now = read('time.elapsed', 0);
if (now - cache.lastFrameCountStart > 1000) {
  cache.lastFrameCountStart = now;
  cache.fps.push(cache.framesCount);
  cache.fps = cache.fps.slice(width(-2));
  cache.framesCount = 0;
}
cache.framesCount += 1;

/*
// terrible performances... 

const samples = 80;
cache.lastValues = cache.lastValues || [];
cache.lastValues.push(read('audio.0.0.frequency'));
cache.lastValues = (cache.lastValues as any[]).slice(0 - samples);

const segLength = height(cache.lastValues.at(0));
const space = width(samples);
lineWidth(vh(0.5));

cache.lastValues.forEach((frequency, x) => {
  frequency.data.forEach((val, h) => {
    beginPath();
    strokeStyle('blue');
    moveTo(space * x, 0);

    lineTo(space * x, segLength * h);

    stroke();
    // closePath();
  });
});
*/

const fs = 6;
// Plotting some data
plot({
  data: cache.fps,
  color: '#f0f',
  // min: 0,
  // max: 180,
  left: width(2),
  right: width(),
  top: 0,
  bottom: height(2),
  legend: 'center',
  fontSize: vmin(fs)
});
plot({
  data: read('audio.0.0.timeDomain.data', []).map(v => (v - 127)),
  color: '#0ff',
  // min: -10,
  // max: 10,
  left: width(2),
  right: width(),
  top: height(),
  bottom: height(2),
  legend: 'center',
  fontSize: vmin(fs)
});
plot({
  data: read('audio.0.0.frequency.data', []),
  color: '#ff0',
  left: 0,
  right: width(2),
  top: height(2),
  bottom: height(),
  legend: 'center',
  fontSize: vmin(fs)
});


// Writing some text lines
fontSize(fs);
fontFamily('monospace');
textLines([
  'time:  ' + now + 'ms',
  'bpm:   ' + read('bpm.bpm') + 'bpm',
  'beat:  ' + read('bpm.elapsed') + 'ms',
], {
  fill: 'lime',
  stroke: 'black',
  position: 'center',
  lineHeight: 1.218,
  x: width(4),
  y: height(4)
});
