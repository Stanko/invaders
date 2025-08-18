import Vec from './vec';

const getLength = (points: Vec[]): number => {
  let len = 0;
  for (let i = 1; i < points.length; i++) len += points[i].distance(points[i - 1]);
  return len;
};

const getCumulativeLengths = (points: Vec[]): number[] => {
  const lengths = [0];
  for (let i = 1; i < points.length; i++) {
    lengths.push(lengths[i - 1] + points[i].distance(points[i - 1]));
  }
  return lengths;
};

const DEFAULT_EASING = (t: number) => t;

function segmentNormal(a: Vec, b: Vec): Vec {
  const dir = b.sub(a).normalize();
  return new Vec(-dir.y, dir.x);
}

function averagedNormal(prev: Vec, current: Vec, next: Vec): Vec {
  const n1 = segmentNormal(prev, current);
  const n2 = segmentNormal(current, next);
  const avg = n1.add(n2).normalize();
  return avg.length() === 0 ? n1 : avg;
}

function computeOffsetPoint(prev: Vec, current: Vec, next: Vec, offset: number, miterLimit = 4): [Vec, Vec] {
  const normal = averagedNormal(prev, current, next);

  const dir1 = current.sub(prev).normalize();
  const dir2 = next.sub(current).normalize();
  const dot = Math.max(-1, Math.min(1, dir1.dot(dir2)));
  const angle = Math.acos(dot);
  const miterScale = 1 / Math.max(Math.sin(angle / 2), 1e-6);
  const scale = Math.min(miterScale, miterLimit) * offset;

  const left = current.add(normal.mulScalar(scale));
  const right = current.add(normal.mulScalar(-scale));
  return [left, right];
}

export const getFatLine = (line: Vec[], width: number, easing: (t: number) => number = DEFAULT_EASING): Vec[] => {
  if (line.length < 2) {
    return [];
  }

  const first = line[0];
  const last = line[line.length - 1];

  // Add prefix/postfix for smoother normals
  const prefix = first.add(first.sub(line[1]));
  const postfix = last.add(last.sub(line[line.length - 2]));
  const points = [prefix, ...line, postfix];

  const totalLength = getLength(line);
  const cumulativeLengths = getCumulativeLengths(line);

  const left: Vec[] = [];
  const right: Vec[] = [];

  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const current = points[i];
    const next = points[i + 1];

    // Map `i` in [1..line.length] to cumulative length index [0..line.length-1]
    const realIndex = Math.min(i - 1, cumulativeLengths.length - 1);
    const t = 1 - easing(cumulativeLengths[realIndex] / totalLength);

    const [l, r] = computeOffsetPoint(prev, current, next, t * width);
    left.push(l);
    right.push(r);
  }

  return [...right, ...left.reverse()];
};
