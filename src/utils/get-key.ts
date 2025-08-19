import type { Options } from './options-type';

// All other options are used only for render
export const KEY_FIELDS: (keyof Options)[] = ['size', 'mainSeed', 'split', 'lineThickness', 'color', 'eyes'];

export const getKey = (options: Options) => {
  return KEY_FIELDS.map((field) => {
    return options[field];
  }).join('__');
};
