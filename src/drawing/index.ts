import { Invader } from './invader';
import type { Options } from '../utils/options-type';

const MAX_CACHE = 20;
const cache: Record<string, Invader> = {};

export default async function getDrawingData(options: Options) {
  const { size } = options;

  const width = size * 2 + 1;

  // All other options are used only for render
  const key = [options.size, options.mainSeed, options.split, options.lineThickness, options.color, options.eyes].join(
    '-',
  );

  // Get from cache
  if (cache[key]) {
    console.log('invader already generated, pulling from cache');
    return cache[key];
  }

  const invader = new Invader(width, width, options);

  // Cache it
  cache[key] = invader;
  const cacheKeys = Object.keys(cache);
  if (cacheKeys.length > MAX_CACHE) {
    delete cache[cacheKeys[0]];
  }

  return invader;
}
