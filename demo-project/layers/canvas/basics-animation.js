clear();
const now = read('now', 0);

const beatP = beatPrct(now, read('bpm', 120) * (1 / 2));
const beatNum = read('beatNum', 1);
const frq = read('frequency', []);
const vol = read('volume', []);
const frqAvg = arrayAvg(frq);

// if (frqAvg > 80) {
//   cache.generate();
// }
lineCap('round');
lineCap('square');
(cache.lines || [])
  .forEach((line) => line.render(now));