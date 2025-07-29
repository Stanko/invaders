import random from '../utils/random';

import type { Control, ControlChangeHandler, ControlConfig, ControlType } from './controls';

type Option = {
  label: string;
  value: string;
};

export type RadioControlOptions = {
  items: Option[];
};

export class RadioControl implements Control<string> {
  type: ControlType = 'radio';
  name: string;
  label: string;
  value: string;
  isRandomizationDisabled: boolean;
  onChange: ControlChangeHandler<string>;
  items: Option[];
  element: HTMLElement;

  constructor(config: ControlConfig<string>, onChange: ControlChangeHandler<string>) {
    const options = config.options as RadioControlOptions;
    this.items = options.items;

    this.name = config.name;
    this.label = config.label || config.name;

    const defaultValue = this.items.find((item) => item.value === config.defaultValue);
    this.value = defaultValue?.value || this.getDefaultValue();
    this.isRandomizationDisabled = config.isRandomizationDisabled || false;
    this.onChange = onChange;

    this.element = this.buildUI();
  }

  parse = (string: string) => {
    const item = this.items.find((item) => item.value === string);
    return item?.value || this.getDefaultValue();
  };

  getRandomValue = () => {
    const index = random(0, this.items.length - 1, null, 0);

    return this.items[index].value;
  };

  getDefaultValue = () => {
    return this.items[0].value;
  };

  valueToString = (value: string = this.value) => {
    return value;
  };

  buildUI = () => {
    const { items, value } = this;

    const inputs = items.map((item) => {
      const input = document.createElement('input');
      input.setAttribute('type', 'radio');
      input.setAttribute('name', this.name);
      input.setAttribute('value', item.value);
      input.checked = item.value === value;

      input.addEventListener('change', () => {
        this.value = this.parse(input.value);
        this.onChange(this.name, this.value);
      });

      const label = document.createElement('span');
      label.textContent = item.label;

      const option = document.createElement('label');
      option.classList.add('radio-label');

      option.appendChild(input);
      option.appendChild(label);

      return option;
    });

    const right = document.createElement('div');
    right.classList.add('control-right');
    right.append(...inputs);

    const label = document.createElement('span');
    label.textContent = this.label;
    label.classList.add('control-label');

    const element = document.createElement('div');
    element.classList.add('control', 'control--radio');
    element.appendChild(label);
    element.appendChild(right);

    return element;
  };

  update = (value: string) => {
    const item = this.items.find((item) => item.value === value);
    this.value = item?.value || this.getDefaultValue();

    // This felt easier than storing inputs and checking and unchecking them
    const input = this.element.querySelector(`[value="${this.value}"]`) as HTMLInputElement;
    input.click();
  };
}
