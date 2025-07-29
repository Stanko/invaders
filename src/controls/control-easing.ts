import random from '../utils/random';
import BezierEasing from 'bezier-easing';

import type { Control, ControlChangeHandler, ControlConfig, ControlType } from './controls';

type Easing = [number, number, number, number];

const easings: Record<string, Easing> = {
  EASE: [0.25, 0.1, 0.25, 1],
  LINEAR: [0, 0, 1, 1],
  EASE_IN: [0.42, 0, 1, 1],
  EASE_OUT: [0, 0, 0.58, 1],
  EASE_IN_OUT: [0.42, 0, 0.58, 1],
};

const w = 100;
const h = 40;

const getPath = (x1: number, y1: number, x2: number, y2: number) => {
  return `M 0 ${h} C ${x1} ${y1} ${x2} ${y2} ${w} 0`;
};

export class EasingControl implements Control<Easing> {
  type: ControlType = 'easing';
  name: string;
  label: string;
  value: Easing;
  isRandomizationDisabled: boolean;
  onChange: ControlChangeHandler<Easing>;
  element: HTMLElement;
  ticks: SVGLineElement[];
  control: HTMLDivElement;
  handles: HTMLButtonElement[];
  lines: SVGLineElement[];
  path: SVGPathElement;

  constructor(config: ControlConfig<Easing>, onChange: ControlChangeHandler<Easing>) {
    this.name = config.name;
    this.label = config.label || config.name;
    this.value = config.defaultValue === undefined ? this.getDefaultValue() : config.defaultValue;
    this.isRandomizationDisabled = config.isRandomizationDisabled || false;
    this.onChange = onChange;

    const { element, ticks, control, handles, lines, path } = this.buildUI();
    this.element = element;
    this.ticks = ticks;
    this.control = control;
    this.handles = handles;
    this.lines = lines;
    this.path = path;
  }

  parse = (string: string) => {
    return string.split(',').map(Number) as Easing;
  };

  getRandomValue = () => {
    const min = 0;
    const max = 1;
    const value: Easing = [
      random(min, max, null, 2),
      random(min, max, null, 2),
      random(min, max, null, 2),
      random(min, max, null, 2),
    ];
    return value;
  };

  getDefaultValue = () => {
    return easings.LINEAR;
  };

  valueToString = (value: Easing = this.value) => {
    return value.join(',');
  };

  getRelativeValues = (value: Easing = this.value) => {
    let [x1, y1, x2, y2] = value;

    // Cap x values
    x1 = Math.max(Math.min(x1, 1), 0);
    x2 = Math.max(Math.min(x2, 1), 0);

    const px: Easing = [x1 * w, h - y1 * h, x2 * w, h - y2 * h];

    const percentage: Easing = [x1 * 100, 100 - y1 * 100, x2 * 100, 100 - y2 * 100];

    return { px, percentage };
  };

  buildUI = () => {
    const { value } = this;

    const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line1.setAttribute('class', 'easing-line easing-line--1');
    line1.setAttribute('x1', '0');
    line1.setAttribute('y1', `${h}`);

    const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line2.setAttribute('class', 'easing-line easing-line--2');
    line2.setAttribute('x1', `${w}`);
    line2.setAttribute('y1', '0');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('class', 'easing-path');

    const borders = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    borders.classList.add('easing-borders');
    borders.setAttribute('d', `M 0 0 h ${w} M 0 ${h} h ${w}`);

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svg.appendChild(borders);
    svg.appendChild(path);
    svg.appendChild(line1);
    svg.appendChild(line2);

    const handle1 = document.createElement('button');
    handle1.className = 'easing-handle easing-handle--1';
    handle1.innerHTML = '';

    const handle2 = document.createElement('button');
    handle2.className = 'easing-handle easing-handle--2';
    handle2.innerHTML = '';

    const control = document.createElement('div');
    control.className = 'easing';
    control.appendChild(svg);
    control.appendChild(handle1);
    control.appendChild(handle2);

    const addListeners = (handle: HTMLSpanElement, index: number) => {
      let dragging = false;
      let dragStart = { x: 0, y: 0 };
      let positionStart = { x: 0, y: 0 };

      const getNewValue = (clientX: number, clientY: number) => {
        const ratio = w / this.control.clientWidth;

        const leftOffset = clientX - dragStart.x;
        const topOffset = clientY - dragStart.y;

        const x = positionStart.x + leftOffset * ratio;
        const y = positionStart.y + topOffset * ratio;

        const attr = (element.getAttribute('data-value') as string).split(',');
        const newValue = attr.map(Number) as Easing;
        newValue[index] = parseFloat((x / w).toFixed(2));
        newValue[index + 1] = parseFloat((1 - y / h).toFixed(2));

        // Cap x values
        newValue[index] = Math.max(Math.min(newValue[index], 1), 0);

        return newValue;
      };

      // Mouse dragging

      handle.addEventListener('mousedown', (e: MouseEvent) => {
        dragStart = { x: e.clientX, y: e.clientY };
        positionStart = {
          x: (parseFloat(handle.style.left) * w) / 100,
          y: (parseFloat(handle.style.top) * h) / 100,
        };

        dragging = true;
        document.body.style.userSelect = 'none';
      });

      document.addEventListener('mouseup', (e) => {
        if (dragging) {
          document.body.style.userSelect = '';
          dragging = false;

          const newValue = getNewValue(e.clientX, e.clientY);

          this.value = newValue;
          this.onChange(this.name, this.value);
          this.update();
        }
      });

      document.addEventListener('mousemove', (e) => {
        if (dragging) {
          const newValue = getNewValue(e.clientX, e.clientY);

          this.updateUI(newValue);
        }
      });

      // Touch dragging

      handle.addEventListener('touchstart', (e) => {
        if (e.touches.length > 1) {
          return;
        }

        dragStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        positionStart = {
          x: (parseFloat(handle.style.left) * w) / 100,
          y: (parseFloat(handle.style.top) * h) / 100,
        };

        dragging = true;
        document.body.style.userSelect = 'none';
      });

      document.addEventListener('touchmove', (e) => {
        if (dragging) {
          e.preventDefault();
          const newValue = getNewValue(e.touches[0].clientX, e.touches[0].clientY);

          this.updateUI(newValue);
        }
      });

      document.addEventListener('touchend', (e) => {
        if (dragging) {
          document.body.style.userSelect = '';
          dragging = false;

          const newValue = getNewValue(e.changedTouches[0].clientX, e.changedTouches[0].clientY);

          this.value = newValue;
          this.onChange(this.name, this.value);
          this.update();
        }
      });

      // Arrow keys
      handle.addEventListener('keydown', (e: KeyboardEvent) => {
        const offsets: Record<string, [number, number]> = {
          ArrowLeft: [-0.03, 0],
          ArrowRight: [0.03, 0],
          ArrowUp: [0, 0.03],
          ArrowDown: [0, -0.03],
        };

        if (offsets[e.key]) {
          e.preventDefault();

          const newValue: Easing = [...this.value];
          newValue[index] = parseFloat((newValue[index] + offsets[e.key][0]).toFixed(2));
          newValue[index + 1] = parseFloat((newValue[index + 1] + offsets[e.key][1]).toFixed(2));

          // Cap x values
          newValue[index] = Math.max(Math.min(newValue[index], 1), 0);

          this.value = newValue;
          this.onChange(this.name, this.value);
          this.update();
        }
      });
    };

    addListeners(handle1, 0);
    addListeners(handle2, 2);

    // Predefined easings

    const predefinedButtons = document.createElement('div');
    predefinedButtons.classList.add('easing-buttons');
    Object.keys(easings).forEach((key) => {
      const button = document.createElement('button');
      button.textContent = key.replace('EASE_', '').toLowerCase();

      button.addEventListener('click', () => {
        this.value = easings[key];
        this.onChange(this.name, this.value);
      });

      predefinedButtons.appendChild(button);
    });

    const ticks = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    ticks.classList.add('easing-ticks');
    ticks.setAttribute('viewBox', `0 0 ${w} 5`);
    ticks.setAttribute('preserveAspectRatio', 'none');
    const tickCount = 30;

    const ticksElements = [];
    for (let i = 0; i < tickCount; i++) {
      const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      tick.setAttribute('y1', '0');
      tick.setAttribute('y2', '5');

      ticksElements.push(tick);
      ticks.appendChild(tick);
    }

    const right = document.createElement('div');
    right.classList.add('control-right');
    right.appendChild(ticks);
    right.appendChild(control);
    right.appendChild(predefinedButtons);

    const label = document.createElement('span');
    label.textContent = this.label;
    label.classList.add('control-label');

    const element = document.createElement('div');
    element.classList.add('control', 'control--easing');
    element.setAttribute('data-value', value.join(','));
    element.appendChild(label);
    element.appendChild(right);

    return {
      element,
      ticks: ticksElements,
      control,
      handles: [handle1, handle2],
      lines: [line1, line2],
      path,
    };
  };

  updateUI = (value: Easing = this.value) => {
    const { handles, lines, path, ticks } = this;
    const { px, percentage } = this.getRelativeValues(value);

    // Helper lines
    lines[0].setAttribute('x2', px[0].toString());
    lines[0].setAttribute('y2', px[1].toString());

    lines[1].setAttribute('x2', px[2].toString());
    lines[1].setAttribute('y2', px[3].toString());

    // Handles
    handles[0].style.left = `${percentage[0]}%`;
    handles[0].style.top = `${percentage[1]}%`;

    handles[1].style.left = `${percentage[2]}%`;
    handles[1].style.top = `${percentage[3]}%`;

    // Path
    path.setAttribute('d', getPath(...px));

    // Ticks
    const e = BezierEasing(...value);

    ticks.forEach((tick, i) => {
      // Subtracting 1 to get 0-1 range (including 1)
      const x = i / (ticks.length - 1);
      const t = (e(x) * w).toString();

      tick.setAttribute('x1', t);
      tick.setAttribute('x2', t);
    });
  };

  update = (value: Easing = this.value) => {
    this.value = value;

    this.updateUI();

    this.element.setAttribute('data-value', value.join(','));
  };
}
