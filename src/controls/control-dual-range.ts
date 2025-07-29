import random from '../utils/random';
import DualRangeInput from '@stanko/dual-range-input';

import type { Control, ControlChangeHandler, ControlConfig, ControlType } from './controls';

export type DualRangeControlOptions = {
  min: number;
  max: number;
  step?: number;
};

export type DualRangeValue = {
  min: number;
  max: number;
};

// TODO
// Add a span with the current value
export class DualRangeControl implements Control<DualRangeValue> {
  type: ControlType = 'dual-range';
  name: string;
  label: string;
  value: DualRangeValue;
  isRandomizationDisabled: boolean;
  onChange: ControlChangeHandler<DualRangeValue>;
  min: number;
  max: number;
  step: number;
  element: HTMLElement;
  minInput: HTMLInputElement;
  maxInput: HTMLInputElement;
  dualRange: DualRangeInput;

  constructor(config: ControlConfig<DualRangeValue>, onChange: ControlChangeHandler<DualRangeValue>) {
    this.name = config.name;
    this.label = config.label || config.name;
    this.value = config.defaultValue === undefined ? this.getDefaultValue() : config.defaultValue;
    this.isRandomizationDisabled = config.isRandomizationDisabled || false;
    this.onChange = onChange;

    const options = config.options as DualRangeControlOptions;

    this.min = options.min;
    this.max = options.max;
    this.step = options.step || 1;

    const { minInput, maxInput, element } = this.buildUI();
    this.minInput = minInput;
    this.maxInput = maxInput;
    this.element = element;

    this.dualRange = new DualRangeInput(this.minInput, this.maxInput);
  }

  parse = (string: string) => {
    const [min, max] = string.split(',').map(parseFloat);

    return { min, max };
  };

  getRandomValue = () => {
    const { step } = this;
    const min = random(this.min, this.max - step);
    const max = random(min + step, this.max);

    return {
      min: min - (min % step),
      max: max - (max % step),
    };
  };

  getDefaultValue = () => {
    return {
      min: this.min,
      max: this.max,
    };
  };

  valueToString = (value: DualRangeValue = this.value) => {
    return `${value.min},${value.max}`;
  };

  buildUI = () => {
    const { min, max, step, value } = this;

    const minInput = document.createElement('input');
    minInput.setAttribute('type', 'range');
    minInput.setAttribute('min', min.toString());
    minInput.setAttribute('max', max.toString());
    minInput.setAttribute('step', step.toString());
    minInput.setAttribute('value', value.min.toString());

    minInput.addEventListener('change', () => {
      this.value = {
        min: parseFloat(minInput.value),
        max: parseFloat(maxInput.value),
      };
      this.onChange(this.name, this.value);
    });

    const maxInput = document.createElement('input');
    maxInput.setAttribute('type', 'range');
    maxInput.setAttribute('min', min.toString());
    maxInput.setAttribute('max', max.toString());
    maxInput.setAttribute('step', step.toString());
    maxInput.setAttribute('value', value.max.toString());
    maxInput.addEventListener('change', () => {
      this.value = {
        min: parseFloat(minInput.value),
        max: parseFloat(maxInput.value),
      };
      this.onChange(this.name, this.value);
    });

    const inputWrapper = document.createElement('div');
    inputWrapper.classList.add('dual-range-input');
    inputWrapper.appendChild(minInput);
    inputWrapper.appendChild(maxInput);

    const right = document.createElement('div');
    right.classList.add('control-right');
    right.appendChild(inputWrapper);

    const label = document.createElement('span');
    label.textContent = this.label;
    label.classList.add('control-label');

    const element = document.createElement('div');
    element.classList.add('control', 'control--dual-range');
    element.appendChild(label);
    element.appendChild(right);

    return {
      element,
      minInput,
      maxInput,
    };
  };

  update = (value: DualRangeValue) => {
    const { min, max } = value;
    this.value = value;

    this.minInput.setAttribute('max', max.toString());
    this.maxInput.setAttribute('min', min.toString());

    this.minInput.value = value.min.toString();
    this.maxInput.value = value.max.toString();

    this.dualRange.update();
  };
}
