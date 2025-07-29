import type Vec from './vec';

export const splitLine = (line: Vec[], step: number): Vec[] => {
  if (step === 0) {
    return line;
  }

  const newLine: Vec[] = [];

  newLine.push(line[0]); // Always include the first point

  for (let i = 0; i < line.length - 1; i++) {
    const start = line[i];
    const end = line[i + 1];
    const d = start.distance(end);
    const vec = end.sub(start).normalize();

    let segments = d / step;
    const rest = segments % 1;

    // If
    if (rest < 0.5) {
      segments = Math.floor(segments);
    } else {
      segments = Math.ceil(segments);
    }

    for (let j = 1; j < segments; j++) {
      const point = start.add(vec.mulScalar((d / segments) * j));
      newLine.push(point);
    }

    newLine.push(end);
  }

  return newLine;
};
