import type { Options } from '../utils/options-type';
import random from './random';

const setTitle = (options: Options, title = '') => {
  if (title) {
    title += ' • ';
  }

  const rng = options.colorRng;

  const l = random(0.55, 0.65, rng, 2).toString();
  const c = random(0.2, 0.4, rng, 2).toString();
  const h = (random(130, 410, rng, 0) % 360).toString(); // skip brownish tones 50 - 130

  document.documentElement.style.setProperty('--theme-l', l);
  document.documentElement.style.setProperty('--theme-c', c);
  document.documentElement.style.setProperty('--theme-h', h);

  const color = `oklch(${l} ${c} ${h})`;

  console.log('%c  ', `background: ${color}`, options.mainSeed);

  document.title = title + options.mainSeed;
};

export default setTitle;
