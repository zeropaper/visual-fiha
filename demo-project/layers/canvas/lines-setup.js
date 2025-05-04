class Star {
  constructor(x, y, radius, color, translation = [0, 0, 0]) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.translation = translation;
  }

  render(now) {
    // fillStyle(this.color);
    beginPath();

    const bx = this.x + this.translation[0] * Math.sin(now / PI) * 100;
    const by = this.y + this.translation[1] * Math.sin(now / PI) * 100;
    const br = this.radius + this.translation[2] * Math.sin(now / PI) * 10;
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2; // Skip every other point for a pentagram
      const x = bx + Math.cos(angle) * br;
      const y = by + Math.sin(angle) * br;
      if (i === 0) {
        moveTo(x, y);
      } else {
        lineTo(x, y);
      }
    }
    lineTo(bx + Math.cos(-Math.PI / 2) * br, by + Math.sin(-Math.PI / 2) * br); // Close the pentagram
    closePath();
    stroke();
  }
}

function randTranslation() {
  const translations = [
    Math.random() * 2 - 1,
    Math.random() * 2 - 1,
    Math.random() * 2 - 1,
  ];
  console.info(translations);
  return translations;
}

cache.stars = [];
cache.generate = () => {
  cache.stars = [];
  const numStars = 10;
  for (let i = 0; i < numStars; i++) {
    const x = Math.random() * width();
    const y = Math.random() * height();
    const radius = Math.random() * 2 + 5;
    const color = hsla(1, 1, 0.5);
    cache.stars.push(new Star(x, y, radius, color, randTranslation()));
  }
};
cache.generate();
cache.render = (now) => {
  lineWidth(1);
  cache.stars.forEach((star) => star.render(now));

  // beginPath();
  // lineWidth(10);
  // moveTo(0, 0);
  // lineTo(width(360) * now, 0);
  // stroke();
  // fontSize(10);
  // textLines([
  //     now.toFixed(5)
  // ], {

  // });
};
