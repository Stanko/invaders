declare module 'robust-point-in-polygon' {
  /**
   * A 2D point represented as a tuple `[x, y]`.
   */
  export type Point = [number, number];

  /**
   * Determines if a point is inside, outside, or on the boundary of a polygon.
   *
   * @param vs - The polygon vertices, given as an array of `[x, y]` points.
   *             The polygon should be closed (first and last vertex connected implicitly).
   * @param point - The point to test, given as `[x, y]`.
   * @returns
   *   - `1` if the point is inside the polygon
   *   - `-1` if the point is outside the polygon
   *   - `0` if the point is on the boundary of the polygon
   */
  export default function robustPointInPolygon(vs: Point[], point: Point): -1 | 0 | 1;
}

declare module 'robust-orientation' {
  import { Point } from 'robust-point-in-polygon';

  /**
   * Computes the orientation of three points.
   *
   * @returns
   *   - A negative value if counter-clockwise
   *   - A positive value if clockwise
   *   - Zero if collinear
   */
  export default function orient(a: Point, b: Point, c: Point): number;
}
