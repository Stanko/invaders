import type { TypedControlConfig } from '../controls/controls';

export const config = [
  {
    type: 'boolean',
    name: 'debug',
    defaultValue: false,
    isRandomizationDisabled: true,
  },
  {
    type: 'range',
    name: 'size',
    defaultValue: 7,
    options: {
      min: 5,
      max: 15,
      step: 1,
    },
  },
  {
    type: 'seed',
    name: 'mainSeed',
  },
  {
    type: 'range',
    name: 'gap',
    defaultValue: 0,
    isRandomizationDisabled: true,
    options: {
      min: 0,
      max: 0.05,
      step: 0.025,
    },
  },
  {
    type: 'range',
    name: 'split',
    label: 'line splitting',
    defaultValue: 0,
    options: {
      min: 0,
      max: 3,
      step: 0.25,
    },
  },
  {
    type: 'easing',
    name: 'lineThickness',
  },
  {
    type: 'seed',
    name: 'color',
  },
  {
    type: 'seed',
    name: 'eyes',
  },
  {
    type: 'boolean',
    name: 'flip',
    isRandomizationDisabled: true,
  },
  {
    type: 'boolean',
    name: 'showGrid',
    isRandomizationDisabled: true,
  },
] as const satisfies readonly TypedControlConfig[];
