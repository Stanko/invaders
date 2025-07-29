const { abs } = Math;

class Vec {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  rotate(angle: number): Vec {
    const x = this.x * Math.cos(angle) - this.y * Math.sin(angle);
    const y = this.x * Math.sin(angle) + this.y * Math.cos(angle);

    return new Vec(x, y);
  }

  angle(): number {
    return Math.atan2(this.y, this.x);
  }

  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  distance(v: Vec): number {
    return this.sub(v).length();
  }

  lengthSquared(): number {
    return this.x * this.x + this.y * this.y;
  }

  distanceSquared(v: Vec): number {
    return this.sub(v).lengthSquared();
  }

  dot(v: Vec): number {
    return this.x * v.x + this.y * v.y;
  }

  normalize(): Vec {
    const d = this.length();

    if (d === 0) {
      console.warn('Normalizing zero vector');
      return new Vec(this.x, this.y);
    }

    return new Vec(this.x / d, this.y / d);
  }

  add(v: Vec): Vec {
    return new Vec(this.x + v.x, this.y + v.y);
  }

  sub(v: Vec): Vec {
    return new Vec(this.x - v.x, this.y - v.y);
  }

  mul(v: Vec): Vec {
    return new Vec(this.x * v.x, this.y * v.y);
  }

  abs(): Vec {
    return new Vec(abs(this.x), abs(this.y));
  }

  div(v: Vec): Vec {
    if (v.x === 0 || v.y === 0) {
      throw new Error(`Dividing by zero, vector: ${v.toString()}`);
    }

    return new Vec(this.x / v.x, this.y / v.y);
  }

  addScalar(n: number): Vec {
    return new Vec(this.x + n, this.y + n);
  }

  subScalar(n: number): Vec {
    return new Vec(this.x - n, this.y - n);
  }

  mulScalar(n: number): Vec {
    return new Vec(this.x * n, this.y * n);
  }

  divScalar(n: number): Vec {
    if (n === 0) {
      console.warn(`Dividing by zero, vector: ${this.toString()}`);
    }

    return new Vec(this.x / n, this.y / n);
  }

  // Shortest distance and between "this" vector and p1-p2 line
  segmentDistance(p1: Vec, p2: Vec): number {
    const l2 = p1.distanceSquared(p2);

    if (l2 === 0) {
      return this.distance(p1);
    }

    const t = this.sub(p1).dot(p2.sub(p1)) / l2;

    if (t < 0) {
      return this.distance(p1);
    }

    if (t > 1) {
      return this.distance(p2);
    }

    return p1.add(p2.sub(p1).mulScalar(t)).distance(this);
  }

  toString() {
    return `x: ${this.x.toFixed(2)}\n` + `y: ${this.y.toFixed(2)})\n`;
  }

  max(v: Vec) {
    return new Vec(Math.max(this.x, v.x), Math.max(this.y, v.y));
  }
}

export default Vec;
