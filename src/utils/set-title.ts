import type { Options } from '../utils/options-type';
import random from './random';

const getIcon = (color: string) => {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const context = canvas.getContext('2d') as CanvasRenderingContext2D;
  context.fillStyle = color;
  context.roundRect(0, 0, 64, 64, 32);
  context.fill();
  return canvas.toDataURL();
};

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
  const icon = getIcon(color);

  console.log('%c  ', `background: ${color}`, options.mainSeed);

  const iconElement = document.querySelector('link[rel="icon"]') as HTMLLinkElement;

  iconElement.setAttribute('href', icon);

  document.title = title + options.mainSeed;
};

export default setTitle;
