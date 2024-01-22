const lineLineCollision = (a, b, c, d, p, q, r, s) => {
  var det, gamma, lambda;
  det = (c - a) * (s - q) - (r - p) * (d - b);
  if (det === 0) {
    return false;
  } else {
    lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
    gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
    return 0 < lambda && lambda < 1 && 0 < gamma && gamma < 1;
  }
};

const lineLineCollisionPoint = (x1, y1, x2, y2, x3, y3, x4, y4) => {
  // Check if none of the lines are of length 0
  if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
    return false;
  }

  denominator = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);

  // Lines are parallel
  if (denominator === 0) {
    return false;
  }

  let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;
  let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator;

  // is the intersection along the segments
  if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
    return false;
  }

  // Return a object with the x and y coordinates of the intersection
  let x = x1 + ua * (x2 - x1);
  let y = y1 + ua * (y2 - y1);

  return { x, y };
};

class Plane {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.width = 15;
    this.height = 50;
    this.rotation = Math.PI;
    this.rotationalVelocity = 0;
    this.turnAcceleration = 0.0004;
    this.maxRotationalVelocity = 0.03;
    this.rotationalDamping = 0.00007;
    this.speed = 5;

    this.dead = false;

    this.color = "red";

    this.brain = new Brain(5, 2);
  }

  reset_please() {
    this.x = 0;
    this.y = 1; //-gap / 2;
    this.width = 15;
    this.height = 50;
    this.rotation = Math.PI;
    this.rotationalVelocity = 0;
    this.turnAcceleration = 0.0008;
    this.maxRotationalVelocity = 0.06;
    this.rotationalDamping = 0.00014;
    this.speed = 10;
  }

  render() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation - Math.PI / 2);
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    ctx.fillRect(-5, -this.height / 2 - 5, 10, 10);
    ctx.restore();
    ctx.strokeStyle = "black";
    const edges = this.getEdges();
    ctx.moveTo(edges[0].x, edges[0].y);
    edges.slice(1).forEach((point) => ctx.lineTo(point.x, point.y));
    ctx.lineTo(edges.at(-1).x, edges.at(-1).y);
    ctx.stroke();
  }

  update() {
    const groundBottom = terrain.map((point, idx) => ({
      x: idx * xScale,
      y: -point + ground.y - ground.height / 2,
    }));
    const groundTop = terrain.map((point, idx) => ({
      x: idx * xScale,
      y: -point + ground.y - ground.height / 2 - gap,
    }));
    const bottomLineIdx = groundBottom.indexOf(
      groundBottom.reduce((a, b) => (b.x < this.x && b.x > a.x ? b : a))
    );
    const topLineIdx = groundTop.indexOf(
      groundTop.reduce((a, b) => (b.x < this.x && b.x > a.x ? b : a))
    );
    const distanceBottom =
      lineLineCollisionPoint(
        // player line down
        this.x,
        this.y,
        this.x,
        this.y + 1000,
        // ground line
        groundBottom[bottomLineIdx].x,
        groundBottom[bottomLineIdx].y,
        groundBottom[bottomLineIdx + 1].x,
        groundBottom[bottomLineIdx + 1].y
      ).y - this.y;

    const distanceTop =
      lineLineCollisionPoint(
        // player line down
        this.x,
        this.y,
        this.x,
        this.y - 1000,
        // ground line
        groundTop[topLineIdx].x,
        groundTop[topLineIdx].y,
        groundTop[topLineIdx + 1].x,
        groundTop[topLineIdx + 1].y
      ).y - this.y;

    const engines =
      this.brain.predict([
        this.rotationalVelocity / this.maxRotationalVelocity,
        (this.rotation - Math.PI) / (Math.PI / 2),
        (ground.y - ground.height - this.y) / (height + gap),
        distanceBottom / gap,
        distanceTop / gap,
      ]) === 1;
    if (this.dead) return;
    if (engines) {
      this.rotationalVelocity -= this.turnAcceleration;
    } else this.rotationalVelocity += this.turnAcceleration;
    this.rotationalVelocity +=
      this.rotationalDamping * (this.rotationalVelocity > 0 ? -1 : 1);
    this.rotationalVelocity = Math.min(
      Math.max(this.rotationalVelocity, -this.maxRotationalVelocity),
      this.maxRotationalVelocity
    );
    this.rotation += this.rotationalVelocity;
    if (this.rotation > (Math.PI * 3) / 2) {
      this.rotation = (Math.PI * 3) / 2;
    }
    this.x -= Math.cos(this.rotation) * this.speed;
    this.y -= Math.sin(this.rotation) * this.speed;

    if (this.y + this.width / 2 > ground.y - ground.height / 2) {
      this.y = ground.y - ground.height / 2 - this.width / 2 - 0.1;
      this.rotationalVelocity = 0;
      this.rotation = Math.PI;
    }

    const points = this.getEdges();
    const edges = [...points, points[0]];
    for (let i = 0; i < edges.length - 1; i++) {
      const { x: a, y: b } = edges[i],
        { x: c, y: d } = edges[i + 1];
      for (let j = 0; j < groundBottom.length - 1; j++) {
        const { x: p, y: q } = groundBottom[j],
          { x: r, y: s } = groundBottom[j + 1];
        if (lineLineCollision(a, b, c, d, p, q, r, s)) {
          this.dead = true;
          return;
        }
      }
      for (let k = 0; k < groundTop.length - 1; k++) {
        const { x: p, y: q } = groundTop[k],
          { x: r, y: s } = groundTop[k + 1];
        if (lineLineCollision(a, b, c, d, p, q, r, s)) {
          this.dead = true;
          return;
        }
      }
    }
  }

  getEdges() {
    const halfWidth = this.width / 2;
    const halfHeight = this.height / 2;
    const cosRotation = Math.cos(this.rotation + Math.PI / 2);
    const sinRotation = Math.sin(this.rotation + Math.PI / 2);
    const topLeft = {
      x: this.x - halfWidth * cosRotation + halfHeight * sinRotation,
      y: this.y - halfWidth * sinRotation - halfHeight * cosRotation,
    };
    const topRight = {
      x: this.x + halfWidth * cosRotation + halfHeight * sinRotation,
      y: this.y + halfWidth * sinRotation - halfHeight * cosRotation,
    };
    const bottomLeft = {
      x: this.x - halfWidth * cosRotation - halfHeight * sinRotation,
      y: this.y - halfWidth * sinRotation + halfHeight * cosRotation,
    };
    const bottomRight = {
      x: this.x + halfWidth * cosRotation - halfHeight * sinRotation,
      y: this.y + halfWidth * sinRotation + halfHeight * cosRotation,
    };

    return [topLeft, topRight, bottomRight, bottomLeft];
  }

  /**
   *
   * @param {Brain} brain
   */
  evolve(brain) {
    this.brain = brain.mutate();
  }

  get fitness() {
    return this.x ** 3;
  }
}
