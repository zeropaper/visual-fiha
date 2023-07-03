class Line {
  constructor(index) {
    this.x = width(2) - (width() * random());
    this.y = height() * random();
    this.length = random() * width(0.75);
    this.index = index
    this.velocity = random() - 0.5;
    this.width = random();

    const v = random();
    this.color = rgba(v, v, v, 1);
  }

  render(now, beatNum) {
    const lwidth = vmin(this.width * 20);
    lineWidth(lwidth);
    strokeStyle(this.color);
    beginPath();

    const distance = this.length + width() + lwidth;
    const relative = abs(now * this.velocity) % distance;

    let x = relative - this.length;

    if (this.velocity < 0) {
      x = width() - relative;
    }
    
    moveTo(x, this.y);
    lineTo(x + this.length, this.y);
    stroke();
  }
}

cache.lines = [];
cache.generate = () => {
  repeat(50, (i) => {
    cache.lines.push(new Line(i));
  });
}
cache.generate();
