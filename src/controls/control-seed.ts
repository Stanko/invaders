import generateSeed from '../utils/generate-seed';
import { createElement, RefreshCw } from 'lucide';

import type { Control, ControlChangeHandler, ControlConfig, ControlType } from './controls';

export class SeedControl implements Control<string> {
  type: ControlType = 'seed';
  name: string;
  label: string;
  value: string;
  isRandomizationDisabled: boolean;
  onChange: ControlChangeHandler<string>;
  element: HTMLElement;
  input: HTMLInputElement;

  constructor(config: ControlConfig<string>, onChange: ControlChangeHandler<string>) {
    this.name = config.name;
    this.label = config.label || config.name;
    this.value = config.defaultValue === undefined ? this.getDefaultValue() : config.defaultValue;
    this.isRandomizationDisabled = config.isRandomizationDisabled || false;
    this.onChange = onChange;

    const { input, element } = this.buildUI();
    this.input = input;
    this.element = element;
  }

  parse = (string: string) => {
    return string;
  };

  getRandomValue = () => {
    return generateSeed();
  };

  getDefaultValue = () => {
    return generateSeed();
  };

  valueToString = (value: string = this.value) => {
    if (value.trim() === '') {
      return this.getRandomValue();
    }
    return value;
  };

  buildUI = () => {
    const { value } = this;

    const id = `control-${this.name}`;

    const input = document.createElement('input');
    input.classList.add('seed-input');
    input.setAttribute('type', 'text');
    input.setAttribute('value', value.toString());
    input.setAttribute('id', id);

    input.addEventListener('change', () => {
      this.value = this.parse(input.value);
      this.onChange(this.name, this.value);
    });

    const reload = document.createElement('button');
    reload.append(createElement(RefreshCw));
    reload.classList.add('seed-new-button', 'controls-btn');
    reload.addEventListener('click', () => {
      this.value = this.getRandomValue();
      this.update();
      this.onChange(this.name, this.getRandomValue());
    });

    const right = document.createElement('div');
    right.classList.add('control-right');
    right.append(input);
    right.append(reload);

    const label = document.createElement('label');
    label.textContent = this.label;
    label.setAttribute('for', id);
    label.classList.add('control-label');

    const element = document.createElement('div');
    element.classList.add('control', 'control--seed');
    element.appendChild(label);
    element.appendChild(right);

    return {
      element,
      input,
    };
  };

  update = (value: string = this.value) => {
    this.value = value;

    this.input.value = value;
  };
}
