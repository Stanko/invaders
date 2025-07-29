import BezierEasing from 'bezier-easing';
import type { PRNG } from 'seedrandom';
import { toCamelCase, toKebabCase, toSpaceCase } from '../utils/string-utils';
import { BooleanControl } from './control-boolean';
import { DualRangeControl, type DualRangeValue } from './control-dual-range';
import { EasingControl } from './control-easing';
import { RadioControl } from './control-radio';
import { RangeControl } from './control-range';
import { SeedControl } from './control-seed';
import { createElement, Dice5 } from 'lucide';
import seedrandom from 'seedrandom';

export type ControlType = 'boolean' | 'range' | 'radio' | 'seed' | 'easing' | 'dual-range';

export type ControlChangeHandler<T> = (name: string, value: T) => void;

export type ControlConfig<T = unknown, O = unknown> = {
  type: ControlType;
  name: string;
  label?: string;
  defaultValue?: T;
  isRandomizationDisabled?: boolean;
  onChange?: ControlChangeHandler<T>;
  options?: O;
};

export interface Control<T> {
  name: string;
  label: string;
  type: ControlType;
  isRandomizationDisabled: boolean;
  onChange: ControlChangeHandler<T>;
  parse: (value: string) => T;
  getRandomValue: () => T;
  getDefaultValue: () => T;
  buildUI: () => unknown;
  valueToString: (value?: T) => string;
  update: (value: T) => void;
  element: HTMLElement;
}

export type ControlComponent =
  | BooleanControl
  | RangeControl
  | RadioControl
  | SeedControl
  | EasingControl
  | DualRangeControl;
export type ControlConstructor<T> = new (...args: any[]) => T;

const controlMap: Record<ControlType, ControlConstructor<ControlComponent>> = {
  boolean: BooleanControl,
  range: RangeControl,
  radio: RadioControl,
  seed: SeedControl,
  easing: EasingControl,
  'dual-range': DualRangeControl,
};

interface ControlTypeRegistry {
  boolean: {
    config: ControlConfig<boolean>;
    instance: BooleanControl;
    value: boolean;
  };
  range: {
    config: ControlConfig<number>;
    instance: RangeControl;
    value: number;
  };
  radio: {
    config: ControlConfig<string>;
    instance: RadioControl;
    value: string;
  };
  seed: {
    config: ControlConfig<string>;
    instance: SeedControl;
    value: string;
  };
  easing: {
    config: ControlConfig<string>;
    instance: EasingControl;
    value: string;
  };
  'dual-range': {
    config: ControlConfig<DualRangeValue>;
    instance: DualRangeControl;
    value: DualRangeValue;
  };
}

export type TypedControlConfig = ControlTypeRegistry[keyof ControlTypeRegistry]['config'];

type OptionsMap<Configs extends readonly TypedControlConfig[]> =
  // Base mapping: control name → value
  {
    [C in Configs[number] as C['name']]: ControlTypeRegistry[C['type']]['value'];
  } & {
    // Extra mapping: easing → nameEasing
    [C in Extract<Configs[number], { type: 'easing' }> as `${C['name']}Easing`]: ReturnType<typeof BezierEasing>;
  } & {
    // Extra mapping: seed → nameRng
    [C in Extract<Configs[number], { type: 'seed' }> as `${C['name']}Rng`]: PRNG;
  };

type HashItem = { name: string; value: unknown };

export class Controls<Configs extends readonly TypedControlConfig[]> {
  controls: ControlTypeRegistry[keyof ControlTypeRegistry]['instance'][];
  controlsMap: Record<string, ControlTypeRegistry[keyof ControlTypeRegistry]['instance']> = {};

  onChange?: () => void;

  constructor(controls: Configs) {
    this.controls = controls.map((config) => {
      const onChange = () =>
        // name: string, value: unknown
        {
          this.setHash();
        };

      // TODO
      // Document this behaviour
      // This might counter-intuitive for some people,
      // but it is my personal preference to have properties named in camel case
      // when using them in code
      //
      // However, they are going to be converted to kebab case when used in the hash,
      // because it is nicer that URL be all lowercase
      config.name = toCamelCase(config.name);

      // TODO
      // Again, document as it is my personal preference
      if (!config.label) {
        config.label = toSpaceCase(config.name);
      }

      const ControlComponent = controlMap[config.type];

      const control = new ControlComponent(config, onChange);

      this.controlsMap[control.name] = control;

      return control;
    });

    this.addListeners();
  }

  addToContainer = (container: HTMLElement) => {
    this.controls.forEach((control) => {
      container.appendChild(control.element);
    });

    const randomizeButton = document.createElement('button');
    randomizeButton.classList.add('controls-randomize', 'controls-btn');
    randomizeButton.textContent = 'Randomize';
    randomizeButton.appendChild(createElement(Dice5));
    randomizeButton.addEventListener('click', this.randomize);
    container.appendChild(randomizeButton);
  };

  addListeners = () => {
    window.addEventListener('hashchange', () => {
      this.updateFromHash();
    });

    // Update all inputs using initial values from the hash
    this.updateFromHash();
    // Update the hash to make sure all values are reflected in the URL
    // TODO this might not be mandatory, but I think it is a nicer UX
    this.setHash();
  };

  getHash = () => {
    const values = this.controls
      .map((control) => {
        return `${toKebabCase(control.name)}:${control.valueToString()}`;
      })
      .join('/');

    return `#/${values}`;
  };

  setHash = () => {
    window.location.hash = this.getHash();
  };

  // TODO
  //
  // I separated parseHash from updateFromHash with an idea to use it to
  // set values in the constuctor, before the UI is built.
  // But because parseHash depends on the controlsMap which is not yet initialized,
  // I decided to just call updateFromHash after the controlsMap is initialized.
  //
  // I'll leave parseHash and updateFromHash separated for now,
  // but if it doesn't find it mandatory I'll merge them again for simplicity.
  parseHash = (): HashItem[] => {
    const hash = window.location.hash.slice(2); // Remove the leading '#/'
    const pairs = hash.split('/');

    const items: HashItem[] = [];

    pairs.forEach((pair) => {
      const [kebabCaseName, value] = pair.split(':');
      const name = toCamelCase(kebabCaseName);
      const control = this.controlsMap[name];

      if (control) {
        const parsed = control.parse(value);

        items.push({
          name,
          value: parsed,
        });
      }
    });

    return items;
  };

  updateFromHash = () => {
    const items = this.parseHash();

    console.log('update from hash', this.getOptions());

    items.forEach((item) => {
      const { name, value } = item;
      const control = this.controlsMap[name];

      if (control && value !== control.value) {
        control.update(value as never);
      }
    });

    this.onChange?.();
  };

  getOptions(): OptionsMap<Configs> {
    const options = {} as any;

    this.controls.forEach((control) => {
      options[control.name] = control.value;

      if (control.type === 'easing') {
        options[control.name + 'Easing'] = BezierEasing(...(control as EasingControl).value);
      } else if (control.type === 'seed') {
        options[control.name + 'Rng'] = seedrandom((control as SeedControl).value);
      }
    });

    return options;
  }

  randomize = () => {
    this.controls.forEach((control) => {
      if (control.isRandomizationDisabled) {
        return;
      }

      control.value = control.getRandomValue();
      control.update(control.value as never);
    });

    this.setHash();
  };
}
