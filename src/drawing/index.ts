import { Invader } from './invader';
import type { Options } from '../utils/options-type';
// import { initClipper } from '../utils/clipper';

export default async function getDrawingData(options: Options) {
  const { size } = options;

  const width = size * 2 + 1;

  // Init clipper
  // await initClipper();

  // --------- Main logic
  const invader = new Invader(width, width, options);

  return {
    invader,
  };
}
