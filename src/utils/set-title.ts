import type { Options } from '../utils/options-type';
import random from './random';

const setTitle = (options: Options, title = '') => {
  if (title) {
    title += ' • ';
  }

  const rng = options.colorRng;

  const l = random(0.55, 0.8, rng, 2).toString();
  const c = random(0.2, 0.5, rng, 2).toString();
  const h = (random(120, 420, rng, 0) % 360).toString(); // skip brownish tones 60 - 120

  document.documentElement.style.setProperty('--theme-l', l);
  document.documentElement.style.setProperty('--theme-c', c);
  document.documentElement.style.setProperty('--theme-h', h);

  const color = `oklch(${l} ${c} ${h})`;

  console.log('%c  ', `background: ${color}`, options.mainSeed);

  document.title = title + options.mainSeed;
};

export default setTitle;
