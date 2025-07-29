interface Point {
  x: number;
  y: number;
}

export const SCALE = 20;

const getCircle = (center: Point, r: number, props: Record<string, any> = {}) => {
  const attributes = [];

  for (const key in props) {
    const value = props[key];
    attributes.push(`${key}="${value}"`);
  }

  return `<circle cx="${(center.x * SCALE).toFixed(2)}" cy="${(center.y * SCALE).toFixed(2)}" r="${r * SCALE}" ${attributes.join(' ')} />`;
};

const getRect = (topLeft: Point, size: Point, props: Record<string, any> = {}) => {
  const attributes = [];

  for (const key in props) {
    const value = props[key];
    attributes.push(`${key}="${value}"`);
  }

  return `<rect x="${(topLeft.x * SCALE).toFixed(2)}" y="${(topLeft.y * SCALE).toFixed(2)}" width="${(size.x * SCALE).toFixed(2)}" height="${(size.y * SCALE).toFixed(2)}" ${attributes.join(' ')} />`;
};

const getPath = (path: Point[], isClosed = true, props: Record<string, any> = {}) => {
  const points = path.map((p) => `${(p.x * SCALE).toFixed(2)} ${(p.y * SCALE).toFixed(2)}`).join(' L ');

  const d = `M ${points} ${isClosed ? 'Z' : ''}`;
  const attributes = [];

  for (const key in props) {
    const value = props[key];
    attributes.push(`${key}="${value}"`);
  }

  return `<path d="${d}" ${attributes.join(' ')} />`;
};

const svgUtils = {
  getCircle,
  getRect,
  getPath,
};

export default svgUtils;
