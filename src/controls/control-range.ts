import random from '../utils/random';

import type { Control, ControlChangeHandler, ControlConfig, ControlType } from './controls';

export type RangeControlOptions = {
  min: number;
  max: number;
  step?: number;
};

// TODO
// Add a span with the current value
export class RangeControl implements Control<number> {
  type: ControlType = 'range';
  name: string;
  label: string;
  value: number;
  isRandomizationDisabled: boolean;
  onChange: ControlChangeHandler<number>;
  min: number;
  max: number;
  step: number;
  element: HTMLElement;
  input: HTMLInputElement;

  constructor(config: ControlConfig<number>, onChange: ControlChangeHandler<number>) {
    this.name = config.name;
    this.label = config.label || config.name;
    this.value = config.defaultValue === undefined ? this.getDefaultValue() : config.defaultValue;
    this.isRandomizationDisabled = config.isRandomizationDisabled || false;
    this.onChange = onChange;

    const options = config.options as RangeControlOptions;

    this.min = options.min;
    this.max = options.max;
    this.step = options.step || 1;

    const { input, element } = this.buildUI();
    this.input = input;
    this.element = element;

    this.update(this.value);
  }

  parse = (string: string) => {
    return parseFloat(string);
  };

  getRandomValue = () => {
    const { min, max, step } = this;
    const value = random(min, max);

    return value - (value % step);
  };

  getDefaultValue = () => {
    return this.min;
  };

  valueToString = (value: number = this.value) => {
    return value.toString();
  };

  buildUI = () => {
    const { min, max, step, value } = this;

    const input = document.createElement('input');
    input.classList.add('range-input');
    input.setAttribute('type', 'range');
    input.setAttribute('min', min.toString());
    input.setAttribute('max', max.toString());
    input.setAttribute('step', step.toString());
    input.setAttribute('value', value.toString());

    input.addEventListener('change', () => {
      this.value = this.parse(input.value);
      this.onChange(this.name, this.value);
    });

    input.addEventListener('input', () => {
      const value = this.parse(input.value);
      const percentage = ((value - min) / (max - min)) * 100;
      this.element.style.setProperty('--gradient-position', `${percentage.toFixed(2)}%`);
    });

    const right = document.createElement('div');
    right.classList.add('control-right');
    right.append(input);

    const label = document.createElement('span');
    label.textContent = this.label;
    label.classList.add('control-label');

    const element = document.createElement('label');
    element.classList.add('control', 'control--range');
    element.appendChild(label);
    element.appendChild(right);

    return {
      element,
      input,
    };
  };

  update = (value: number) => {
    const { min, max } = this;
    this.value = value;

    this.input.value = value.toString();
    const percentage = ((this.value - min) / (max - min)) * 100;
    this.element.style.setProperty('--gradient-position', `${percentage.toFixed(2)}%`);
  };
}
