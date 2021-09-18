// @ts-check

const now = read('now', 0);

const n = (now % 10000) * 0.0001;
const h = (sin(n * PI2)) * 0.1;
const color = hsla(h + 0.75, 0.5, .7, 1);

clear();
fillStyle(color);

rect(width(2), height(2), width(4), height(4));
fill();
