import type { Control, ControlType, ControlChangeHandler, ControlConfig } from './controls';
import { createElement, Check } from 'lucide';

export class BooleanControl implements Control<boolean> {
  type: ControlType = 'boolean';
  name: string;
  label: string;
  value: boolean;
  isRandomizationDisabled: boolean;
  onChange: ControlChangeHandler<boolean>;
  element: HTMLElement;
  input: HTMLInputElement;

  constructor(config: ControlConfig<boolean>, onChange: ControlChangeHandler<boolean>) {
    this.type = 'boolean';
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
    return string === 'true';
  };

  getRandomValue = () => {
    return Math.random() > 0.5;
  };

  getDefaultValue = () => {
    return true;
  };

  valueToString = (value: boolean = this.value) => {
    return value.toString();
  };

  buildUI = () => {
    const input = document.createElement('input');
    input.classList.add('boolean-input');
    input.setAttribute('type', 'checkbox');
    input.checked = this.value;
    input.addEventListener('change', () => {
      this.value = input.checked;
      this.onChange(this.name, this.value);
    });

    const checkmark = document.createElement('span');
    checkmark.classList.add('boolean-checkmark');
    checkmark.appendChild(createElement(Check));

    const right = document.createElement('div');
    right.classList.add('control-right');
    right.appendChild(input);
    right.appendChild(checkmark);

    const label = document.createElement('span');
    label.textContent = this.label;
    label.classList.add('control-label');

    const element = document.createElement('label');
    element.classList.add('control', 'control--boolean');
    element.appendChild(label);
    element.appendChild(right);

    return {
      element,
      input,
    };
  };

  update = (value: boolean) => {
    this.value = value;
    this.input.checked = this.value;
  };
}
