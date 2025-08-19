import { Invader } from './invader';
import type { Options } from '../utils/options-type';
import { getKey } from '../utils/get-key';

const MAX_CACHE = 20;
const cache: Record<string, Invader> = {};

export default async function getDrawingData(options: Options) {
  const { size } = options;

  const width = size * 2 + 1;

  const key = getKey(options);

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
