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

  bodyCenter: Vec;
  body: Vec[] = [];
  // eyes: TODO
  horns: HornTentacle[] = [];
  tentacles: HornTentacle[] = [];

  options: Options;

  constructor(width: number = 15, height: number = 15, options: Options) {
    if (width % 2 === 0) {
      throw new Error('Width must be odd');
    }

    this.width = width;
    this.height = height;
    this.options = options;

    this.bodyCenter = new Vec(width / 2, Math.round(height * 0.4));

    this.grid = this.initGrid();

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

  fillGrid() {
    const { grid, body, horns, tentacles } = this;

    const bodyArray: [number, number][] = body.map((p) => [p.x, p.y]);

    const INSIDE = -1;
    const EDGE = 0;

    const extremities = [
      ...tentacles.map((t) => t.fatLine), //
      ...horns.map((h) => h.fatLine),
    ];

    const EXTREMITIES_SEARCH_RADIUS = 0.5;

    grid.forEach((col, x) => {
      col.forEach((_, y) => {
        const isInBody = isInPolygon(bodyArray, [x + 0.5, y + 0.5]);

        if (isInBody === INSIDE || isInBody === EDGE) {
          this.paint(x, y, 'x');
        } else if (grid[x][y] === ' ') {
          for (const polygon of extremities) {
            const polygonArray: [number, number][] = polygon.map((p) => [p.x, p.y]);
            let painted = false;

            for (const point of polygon) {
              const d = point.distance(new Vec(x + 0.5, y + 0.5));
              const isIn = isInPolygon(polygonArray, [x + 0.5, y + 0.5]);

              if (d < EXTREMITIES_SEARCH_RADIUS || isIn === INSIDE || isIn === EDGE) {
                this.paint(x, y, 'l');
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

  // ----- Body ----- //

  generate() {
    const {
      width,
      height,
      bodyCenter: { x, y },
      options,
    } = this;

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

    // Tentacles
    // Use the most bottom side point as the start point for the tentacle
    const startLeftTentacle = pointsLeft[pointsLeft.length - 1];
    const sideTentacles = this.getSideTentacles(startLeftTentacle);
    const midTentacles = this.getMiddleTentacles(bodyBottomPoint, sideTentacles[0].line);

    this.tentacles = [...sideTentacles, ...midTentacles];

    // Horns
    this.horns = this.getHorns();

    // Fill grid
    this.fillGrid();

    // Eyes
    const mid = top + (bottom - top) / 2;
    this.fillEyes(random(mid - 1, mid + 1, options.eyesRng, 0));
  }

  // ----- Eyes ----- //

  eye(x: number, y: number) {
    this.paint(x, y, 'o');
    this.paint4(x, y, 'x');
  }

  fillEyes(y: number) {
    const {
      bodyCenter: { x },
      options,
    } = this;
    const { floor } = Math;

    const eyes = [
      () => {
        this.eye(floor(x - 2), y);
        this.eye(floor(x + 2), y);
      },
      () => {
        this.eye(floor(x - 2), y);
        this.eye(floor(x), y);
        this.eye(floor(x + 2), y);
      },
      () => {
        this.eye(floor(x - 2), y);
        this.eye(floor(x + 2), y);
        this.paint(floor(x - 1), y, 'o');
        this.paint(floor(x + 1), y, 'o');
      },
    ];

    const index = random(0, eyes.length - 1, options.eyesRng, 0);

    eyes[index]();
  }

  // ----- Tentacles ----- //

  getSideTentacles(start: Vec): HornTentacle[] {
    const { options } = this;

    let baseLine: Vec[] = [start];
    const length = random(1, 6, null, 0);

    for (let i = 0; i < length; i++) {
      const angle = random(-1, 1) * Math.PI * 0.5 + Math.PI * 0.5;
      const d = random(1, 3, null, 0);
      const x = baseLine[i].x + d * Math.cos(angle);
      const y = baseLine[i].y + d * Math.sin(angle);
      baseLine.push(new Vec(x, y));
    }

    const line = splitLine(baseLine, options.split);

    const fatLine = getFatLine(line, 0.3, options.lineThicknessEasing);

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

  getMiddleTentacles(bottom: Vec, tentacle: Vec[]): HornTentacle[] {
    const { options } = this;

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
      const line = splitLine(baseLine, options.split);
      const fatLine = getFatLine(line, 0.2, options.lineThicknessEasing);

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

    return [];
  }

  // ----- Horns ----- //

  getHorns(): HornTentacle[] {
    const {
      options,
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

    const line = splitLine(baseLine, options.split);

    const fatLine = getFatLine(line, 0.3, options.lineThicknessEasing);

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

  // ----- Utils ----- //

  mirror(points: Vec[]) {
    const { width } = this;

    return points.map((p) => new Vec(width - p.x, p.y)).reverse();
  }

  // ----- Paint ----- //
  //
  paint(x: number, y: number, char: string) {
    this.grid[x][y] = char;
  }

  paint4(x: number, y: number, char: string) {
    const neighbors = this.findNeighbors4(x, y);
    neighbors.forEach((neighbor) => {
      this.paint(neighbor.x, neighbor.y, char);
    });
  }

  paint8(x: number, y: number, char: string) {
    const neighbors = this.findNeighbors8(x, y);
    neighbors.forEach((neighbor) => {
      this.paint(neighbor.x, neighbor.y, char);
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

// // ----- Head ----- //
// getInvader() {
//   const { width, height, grid } = this;
//   const { floor, round } = Math;

//   const center = {
//     x: width / 2,
//     y: round(height * 0.4),
//   };

//   const { polygon, limbs } = this.polygon(center.x, center.y);
//   const polygonArray: [number, number][] = polygon.map((p) => [p.x, p.y]);

//   grid.forEach((col, x) => {
//     col.forEach((_, y) => {
//       const isIn = isInPolygon(polygonArray, [x + 0.5, y + 0.5]);

//       if (isIn === 0 || isIn === -1) {
//         this.paint(x, y, 'x');
//       } else {
//         for (const limb of limbs) {
//           const limbArray: [number, number][] = limb.map((p) => [p.x, p.y]);
//           for (const point of limb) {
//             // const d = distance({ x: x + 0.5, y: y + 0.5 }, point);
//             const d = point.distance(new Vec(x + 0.5, y + 0.5));
//             const isIn = isInPolygon(limbArray, [x + 0.5, y + 0.5]);

//             if (d < 0.5 || isIn === 0 || isIn === -1) {
//               this.paint(x, y, 'l');
//               break;
//             }
//           }
//         }
//       }
//     });
//   });

//   this.paint(floor(center.x), center.y, '*');

//   // Eyes
//   this.paint8(floor(center.x), center.y, 'x');
//   const e = random(1, 3, null, 0);
//   if (e === 1) {
//     this.eye(floor(center.x - 2), center.y);
//     this.eye(floor(center.x + 2), center.y);
//   } else if (e === 2) {
//     this.eye(floor(center.x - 2), center.y);
//     this.eye(floor(center.x), center.y);
//     this.eye(floor(center.x + 2), center.y);
//   } else {
//     this.eye(floor(center.x - 2), center.y);
//     this.eye(floor(center.x + 2), center.y);
//     this.paint(floor(center.x - 1), center.y, 'o');
//     this.paint(floor(center.x + 1), center.y, 'o');
//   }

//   console.log(this.toString());

//   const svg = this.svg(polygon, limbs);

//   return svg;
// }

// polygon(
//   x: number,
//   y: number,
// ): {
//   polygon: Vec[];
//   limbs: Vec[][];
// } {
//   const { width, height } = this;

//   const half = height * 0.3;
//   // Adding 1 to top and bottom to ensure minimum of 3 pixels for the head
//   const bottom = y + 1 + random(0, half, null, 0);
//   const top = bottom - random(3, height * 0.4, null, 0); // y - 1 - random(0, half);

//   const count = random(1, 5, null, 0);
//   const corners: Vec[] = [];

//   while (corners.length < count) {
//     const point = new Vec(random(width * 0.1, x - 1, null, 0), random(height * 0.2, height * 0.6, null, 0));

//     if (!corners.find((p) => p.x === point.x && p.y === point.y)) {
//       corners.push(point);
//     }
//   }

//   corners.sort((a, b) => a.y - b.y);

//   const mirror = (points: Vec[]) => points.map((p) => new Vec(width - p.x, p.y)).reverse();

//   const cornersRight = mirror(corners);

//   // Limbs

//   let limb: Vec[] = [corners[corners.length - 1]];
//   const l = random(1, 6, null, 0);

//   for (let i = 0; i < l; i++) {
//     const angle = random(-1, 1) * Math.PI * 0.5 + Math.PI * 0.5;
//     const d = random(1, 3, null, 0);
//     const x = limb[i].x + d * Math.cos(angle);
//     const y = limb[i].y + d * Math.sin(angle);
//     limb.push(new Vec(x, y));
//   }

//   limb = getFatLine(limb, 0.75);

//   let midLimb: Vec[] = [];
//   if (random(0, 10) > 3) {
//     midLimb[0] = new Vec(x, bottom);
//     const midLimbLength = random(2, 4, null, 0);

//     for (let i = 0; i < midLimbLength; i++) {
//       const angle = random(-1, 0, null, 0) * Math.PI * 0.25 + Math.PI * 0.5;
//       const d = random(1, 2, null, 0);
//       const x = midLimb[i].x + d * Math.cos(angle);
//       const y = midLimb[i].y + d * Math.sin(angle);

//       const point = new Vec(x, y);

//       let stop = false;

//       for (const p of limb) {
//         if (point.distance(p) < 4) {
//           stop = true;
//           break;
//         }
//       }

//       if (stop) {
//         break;
//       }

//       midLimb.push(point);
//     }

//     if (midLimb.length > 2) {
//       midLimb = getFatLine(midLimb, 0.5);
//     }
//   }

//   const limbs = [limb, midLimb, mirror(limb), mirror(midLimb)];

//   // Horns

//   this.horns = this.getHorns();

//   this.horns.forEach((horn) => {
//     limbs.push(horn.fatLine);
//   });

//   return {
//     polygon: [
//       ...corners, //
//       new Vec(x, bottom),
//       ...cornersRight,
//       new Vec(x, top),
//     ],
//     limbs,
//   };
// }
