import isInPolygon from 'robust-point-in-polygon';
import Vec from '../utils/vec';
import { getFatLine } from '../utils/get-fat-line';
import random from '../utils/random';
import type { Options } from '../utils/options-type';
import { splitLine } from '../utils/split-line';

export type HornTentacle = {
  line: Vec[];
  fatLine: Vec[];
};

export class Invader {
  height: number;
  width: number;
  grid: string[][];
  gridAnimation: string[][];

  bodyCenter: Vec;
  body: Vec[] = [];
  horns: HornTentacle[] = [];
  hornsAnimation: HornTentacle[] = [];
  tentacles: HornTentacle[] = [];
  tentaclesAnimation: HornTentacle[] = [];

  options: Options;

  constructor(width: number = 15, height: number = 15, options: Options) {
    if (width % 2 === 0) {
      throw new Error('Width must be odd');
    }

    // Cap size to 51 (it has to be odd)
    // Large grid sizes also take a while to render
    this.width = Math.min(width, 51);
    this.height = Math.min(height, 51);
    this.options = options;

    this.bodyCenter = new Vec(width / 2, Math.round(height * 0.4));

    this.grid = this.initGrid();
    this.gridAnimation = this.initGrid();

    this.generate();
  }

  // ----- Grid ----- //

  initGrid() {
    const grid = [];

    for (let x = 0; x < this.width; x++) {
      const col: string[] = [];
      for (let y = 0; y < this.height; y++) {
        col.push(' ');
      }
      grid.push(col);
    }

    return grid;
  }

  fillGrid(grid: string[][], hornTentacles: Vec[][]) {
    const { body } = this;

    const EXTREMITIES_SEARCH_RADIUS = 0.5;
    // -1 should be outside, but I probably messed up polygon orientation
    // it works, so I can't be bothered to fix it
    const INSIDE = -1;
    const EDGE = 0;

    const bodyArray: [number, number][] = body.map((p) => [p.x, p.y]);

    grid.forEach((col, x) => {
      col.forEach((_, y) => {
        const isInBody = isInPolygon(bodyArray, [x + 0.5, y + 0.5]);

        if (isInBody === INSIDE || isInBody === EDGE) {
          this.paint(grid, x, y, 'x');
        } else if (grid[x][y] === ' ') {
          for (const polygon of hornTentacles) {
            const polygonArray: [number, number][] = polygon.map((p) => [p.x, p.y]);
            let painted = false;

            for (const point of polygon) {
              const d = point.distance(new Vec(x + 0.5, y + 0.5));
              const isIn = isInPolygon(polygonArray, [x + 0.5, y + 0.5]);

              if (d < EXTREMITIES_SEARCH_RADIUS || isIn === INSIDE || isIn === EDGE) {
                this.paint(grid, x, y, 'l');
                painted = true;
                break;
              }
            }

            // If we painted the cell, skip the rest of the extremities
            if (painted) {
              break;
            }
          }
        }
      });
    });
  }

  // ----- Generate ----- //

  generate() {
    const {
      width,
      height,
      bodyCenter: { x, y },
      options,
      grid,
      gridAnimation,
    } = this;

    // --- Body

    const half = height * 0.3;
    // top and bottom coordinates of the body
    // Adding 1 to top and bottom to ensure minimum of 3 pixels for the body
    const bottom = y + 1 + random(0, half, null, 0);
    const top = bottom - random(3, height * 0.4, null, 0); // y - 1 - random(0, half);

    // Corners of the body
    // TODO make it relative to the invader size
    const pointsCount = random(1, 5, null, 0);
    const pointsLeft: Vec[] = [];

    while (pointsLeft.length < pointsCount) {
      // width * 0.1 -> small padding on the left side
      // x -1 -> makes sure it is left from the top corner which is always centered
      const px = random(width * 0.1, x - 1, null, 0);
      // height * 0.2 -> padding on the top for the horns
      // height * 0.6 -> leaves space for the tentacles at the bottom
      const py = random(height * 0.2, height * 0.6, null, 0);

      const point = new Vec(px, py);

      // Check if the point is already in the array
      if (!pointsLeft.find((p) => p.x === point.x && p.y === point.y)) {
        pointsLeft.push(point);
      }
    }

    // Sort them by y-coordinate (sort works in place)
    pointsLeft.sort((a, b) => a.y - b.y);

    const cornersRight = this.mirror(pointsLeft);

    const bodyTopPoint = new Vec(x, top);
    const bodyBottomPoint = new Vec(x, bottom);

    this.body = [
      bodyTopPoint, // top
      ...pointsLeft, // left
      bodyBottomPoint, // bottom
      ...cornersRight, // right
    ];

    // --- Tentacles
    // Use the most bottom side point as the start point for the tentacle
    const leftTentacleStart = pointsLeft[pointsLeft.length - 1];
    const sideTentacles = this.getSideTentacles(leftTentacleStart);
    const midTentacles = this.getMiddleTentacles(bodyBottomPoint, sideTentacles[0].line);

    this.tentacles = [...sideTentacles, ...midTentacles];

    const sideTentaclesAnimation = this.getSideTentaclesAnimation(sideTentacles[0].line);
    this.tentaclesAnimation = [...sideTentaclesAnimation, ...midTentacles];

    // --- Horns
    this.horns = this.getHorns();
    this.hornsAnimation = this.getHornsAnimation(this.horns[0].line);

    // --- Fill grid
    const hornTentacles = [
      ...this.tentacles.map((t) => t.fatLine), //
      ...this.horns.map((h) => h.fatLine),
    ];

    this.fillGrid(grid, hornTentacles);

    // --- Fill animation frame grid
    const hornTentaclesAnimation = [
      ...this.tentaclesAnimation.map((t) => t.fatLine), //
      ...this.hornsAnimation.map((h) => h.fatLine),
    ];

    this.fillGrid(gridAnimation, hornTentaclesAnimation);

    // --- Eyes
    const mid = top + (bottom - top) / 2;
    const eyes = this.getEyes();
    eyes(grid, random(mid - 1, mid + 1, options.eyesRng, 0));
    eyes(gridAnimation, random(mid - 1, mid + 1, options.eyesRng, 0));
  }

  // ----- Eyes ----- //

  eye(grid: string[][], x: number, y: number) {
    this.paint(grid, x, y, 'o');
    this.paint4(grid, x, y, 'x');
  }

  getEyes() {
    const {
      bodyCenter: { x },
      options,
    } = this;
    const { floor } = Math;

    const eyes = [
      (grid: string[][], y: number) => {
        this.eye(grid, floor(x - 2), y);
        this.eye(grid, floor(x + 2), y);
      },
      (grid: string[][], y: number) => {
        this.eye(grid, floor(x - 2), y);
        this.eye(grid, floor(x), y);
        this.eye(grid, floor(x + 2), y);
      },
      (grid: string[][], y: number) => {
        this.eye(grid, floor(x - 2), y);
        this.eye(grid, floor(x + 2), y);
        this.paint(grid, floor(x - 1), y, 'o');
        this.paint(grid, floor(x + 1), y, 'o');
      },
    ];

    const index = random(0, eyes.length - 1, options.eyesRng, 0);

    return eyes[index];
  }

  // ----- Tentacles ----- //

  baseLineToFatLine(baseLine: Vec[], width: number): { fatLine: Vec[]; line: Vec[] }[] {
    const { options } = this;

    const line = splitLine(baseLine, options.split);
    const fatLine = getFatLine(line, width, options.lineThicknessEasing);

    return [
      {
        fatLine,
        line,
      },
      {
        fatLine: this.mirror(fatLine),
        line: this.mirror(line),
      },
    ];
  }

  getSideTentacles(start: Vec): HornTentacle[] {
    let baseLine: Vec[] = [start];
    const length = random(1, 6, null, 0);

    for (let i = 0; i < length; i++) {
      const angle = random(-1, 1) * Math.PI * 0.5 + Math.PI * 0.5;
      const d = random(1, 3, null, 0);
      const x = baseLine[i].x + d * Math.cos(angle);
      const y = baseLine[i].y + d * Math.sin(angle);
      baseLine.push(new Vec(x, y));
    }

    return this.baseLineToFatLine(baseLine, 0.3);
  }

  getSideTentaclesAnimation(baseLine: Vec[]): HornTentacle[] {
    const pointsToReplace = baseLine.length > 3 ? 2 : 1;
    const baseLineAnimation = baseLine.slice(0, baseLine.length - pointsToReplace);

    for (let i = 0; i < pointsToReplace; i++) {
      const angle = random(-1, 1) * Math.PI * 0.5 + Math.PI * 0.5;
      const d = random(1, 3, null, 0);
      const x = baseLineAnimation[i].x + d * Math.cos(angle);
      const y = baseLineAnimation[i].y + d * Math.sin(angle);
      baseLineAnimation.push(new Vec(x, y));
    }

    return this.baseLineToFatLine(baseLineAnimation, 0.3);
  }

  getMiddleTentacles(bottom: Vec, tentacle: Vec[]): HornTentacle[] {
    let baseLine: Vec[] = [bottom];

    const length = random(2, 4, null, 0);

    for (let i = 0; i < length; i++) {
      const angle = random(-1, 0, null, 0) * Math.PI * 0.25 + Math.PI * 0.5;
      const d = random(1, 2, null, 0);
      const x = baseLine[i].x + d * Math.cos(angle);
      const y = baseLine[i].y + d * Math.sin(angle);

      const point = new Vec(x, y);

      let stop = false;

      // TODO play with making the distance random and relative to the invader size
      const MIN_DISTANCE = 4;

      for (const p of tentacle) {
        if (point.distance(p) < MIN_DISTANCE) {
          stop = true;
          break;
        }
      }

      if (stop) {
        break;
      }

      baseLine.push(point);
    }

    if (baseLine.length > 2) {
      return this.baseLineToFatLine(baseLine, 0.2);
    }

    return [];
  }

  // ----- Horns ----- //

  getHorns(): HornTentacle[] {
    const {
      bodyCenter: { x, y },
    } = this;

    const getNext = (current: Vec, angle: number, r: number) => {
      return new Vec(current.x + r * Math.cos(angle), current.y + r * Math.sin(angle));
    };

    let angle = random(0.1, 0.35) * Math.PI + Math.PI;
    let r = y * random(0.5, 0.7);
    let current = new Vec(x, y - 0.5);

    const length = 2 + random(0, 1, null, 0);

    const baseLine: Vec[] = [current];

    for (let i = 0; i < length; i++) {
      const next = getNext(current, angle, r);
      baseLine.push(next);

      current = next;
      angle = random(-1, 0, null, 0) * Math.PI * 0.5 + Math.PI * 0.25;
      r = random(1, 2, null, 0);
    }

    return this.baseLineToFatLine(baseLine, 0.3);
  }

  getHornsAnimation(leftHorn: Vec[]): HornTentacle[] {
    const horn = leftHorn.map((p, i) => {
      // Move last point
      if (i === leftHorn.length - 1) {
        return p.add(new Vec(-1, 0));
      }

      return p;
    });

    return this.baseLineToFatLine(horn, 0.3);
  }

  // ----- Utils ----- //

  mirror(points: Vec[]) {
    const { width } = this;

    return points.map((p) => new Vec(width - p.x, p.y)).reverse();
  }

  // ----- Paint ----- //
  //
  paint(grid: string[][], x: number, y: number, char: string) {
    grid[x][y] = char;
  }

  paint4(grid: string[][], x: number, y: number, char: string) {
    const neighbors = this.findNeighbors4(x, y);
    neighbors.forEach((neighbor) => {
      this.paint(grid, neighbor.x, neighbor.y, char);
    });
  }

  paint8(grid: string[][], x: number, y: number, char: string) {
    const neighbors = this.findNeighbors8(x, y);
    neighbors.forEach((neighbor) => {
      this.paint(grid, neighbor.x, neighbor.y, char);
    });
  }

  // ----- Neighbors ----- //
  findNeighbors(x: number, y: number, offsets: Vec[]): Vec[] {
    const { width, height } = this;

    return offsets
      .map((d) => new Vec(x + d.x, y + d.y))
      .filter((p) => {
        return p.x >= 0 && p.x < width && p.y >= 0 && p.y < height;
      });
  }

  findNeighbors4(x: number, y: number): Vec[] {
    const offsets = [
      { x: 0, y: 1 },
      { x: 1, y: 0 },
      { x: 0, y: -1 },
      { x: -1, y: 0 },
    ].map((p) => new Vec(p.x, p.y));
    return this.findNeighbors(x, y, offsets);
  }

  findNeighbors8(x: number, y: number): Vec[] {
    const offsets = [
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 1, y: 0 },
      { x: 1, y: -1 },
      { x: 0, y: -1 },
      { x: -1, y: -1 },
      { x: -1, y: 0 },
      { x: -1, y: 1 },
    ].map((p) => new Vec(p.x, p.y));
    return this.findNeighbors(x, y, offsets);
  }

  // ----- toString ----- //
  toString() {
    const string = [];

    for (let y = 0; y < this.height; y++) {
      const row = [];
      for (let x = 0; x < this.width; x++) {
        const char = this.grid[x][y];
        if (char === ' ') {
          row.push(' . ');
        } else {
          row.push(`[${char}]`);
        }
      }
      string.push(row.join(''));
    }

    return string.join('\n');
  }
}
