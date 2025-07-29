interface Point {
  x: number;
  y: number;
}

const getPath = (path: Point[], isClosed = true, props: Record<string, any> = {}): SVGPathElement => {
  const element = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  const points = path.map((p) => `${p.x} ${p.y}`).join(' L ');

  const d = `M ${points} ${isClosed ? 'Z' : ''}`;

  element.setAttribute('d', d);

  for (const key in props) {
    element.setAttribute(key, props[key]);
  }

  return element;
};

const getComplexPath = (paths: Point[][], isClosed = true, props: Record<string, any> = {}): SVGPathElement => {
  const element = document.createElementNS('http://www.w3.org/2000/svg', 'path');

  const d = paths
    .map((path) => {
      const points = path.map((p) => `${p.x} ${p.y}`).join(' L ');

      const d = `M ${points} ${isClosed ? 'Z' : ''}`;

      return d;
    })
    .join(' ');

  element.setAttribute('d', d);

  for (const key in props) {
    element.setAttribute(key, props[key]);
  }

  return element;
};

const getCircle = (center: Point, r: number, props: Record<string, any> = {}): SVGCircleElement => {
  const element = document.createElementNS('http://www.w3.org/2000/svg', 'circle');

  element.setAttribute('cx', center.x.toString());
  element.setAttribute('cy', center.y.toString());
  element.setAttribute('r', r.toString());

  for (const key in props) {
    element.setAttribute(key, props[key]);
  }

  return element;
};

const svgUtils = {
  getCircle,
  getPath,
  getComplexPath,
};

export default svgUtils;
