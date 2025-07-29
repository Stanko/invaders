import Vec from './vec';

export const getBisectorVector = (v1: Vec, v2: Vec, v3: Vec): Vec => {
  const v21 = v1.sub(v2).normalize();
  const v23 = v3.sub(v2).normalize();

  // Calculate the bisector by summing the normalized vectors
  let bisectorVector = v21.add(v23);

  // If the vectors are parallel, return the vector perpendicular to v21
  if (bisectorVector.length() === 0) {
    bisectorVector = new Vec(-v21.y, v21.x);
  }

  return bisectorVector.normalize();
};

// Helper function to determine if three points make a left turn
function isLeftTurn(a: Vec, b: Vec, c: Vec): boolean {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x) > 0;
}

// Takes three points and returns two points.
// Points are located at the end of a vector which is bisector of the angle between these three points.
// The distance param is the distance from the v2 point to the returned points.
/*
                  • normal[0]
                 /
                /
     v1 •------• v2
              / \
             /   • v3
  normal[1] •
*/
export function getNormalPoints(v1: Vec, v2: Vec, v3: Vec, distance: number): [Vec, Vec] {
  // Calculate the bisector by summing the normalized vectors
  let bisectorVector = getBisectorVector(v1, v2, v3);

  const point1 = v2.add(bisectorVector.mulScalar(distance));
  const point2 = v2.add(bisectorVector.mulScalar(-distance));

  // Determine the correct order to ensure a convex shape when connected
  if (isLeftTurn(v1, v2, v3)) {
    return [point1, point2];
  } else {
    return [point2, point1];
  }
}
