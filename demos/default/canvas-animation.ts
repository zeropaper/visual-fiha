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

const samples = 60;
cache.lastValues = cache.lastValues || [];
cache.lastValues = (cache.lastValues as any[]).slice(0 - samples);

const now = read('time.elapsed', 0) * 0.001;
const tdMax = read('audio.0.0.timeDomain.max', 127) - 127;
const fAvg = read('audio.0.0.frequency.average', 60) - 60;

/*
fontSize(30);
fontFamily('monospace');
textLines([
  fAvg.toFixed() 
], {});
*/

cache.lastValues.push([
  abs(fAvg),
  abs(tdMax)
]);

cache.lastValues.forEach((val, v) => {
  lineWidth(val[1] * 0.275);
  circle({
    stroke: rgba(val[1] * 0.001, val[1] * 0.01, 1, v / samples),
    fill: 'transparent',
    radius: width(val[0] * 0.5),
    x: width(2),
    y: height(2),

  });
});
