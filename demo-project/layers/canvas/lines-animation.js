const color = hsla((read("now") * 0.0001) % 1, 1, 0.5);

clear();
strokeStyle(color);

const now = (read("now") * 0.01) % 360;
cache.render?.(now);
