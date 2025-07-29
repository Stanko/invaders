import { createElement, ImageDown } from 'lucide';
import { Controls } from './controls/controls';
import { config } from './drawing/options-config';
import render from './drawing/render';
import { downloadSVG } from './utils/download-svg';
import setTitle from './utils/set-title';

import '@stanko/dual-range-input/dist/index.css';
import './scss/index.scss';

// Initialize options controls
export const controls = new Controls(config);

// Get title from the HTML
const title = document.querySelector('title')?.textContent || '';

// UI elements
const controlsDiv = document.querySelector('.controls') as HTMLDivElement;
const drawingDiv = document.querySelector('.drawing') as HTMLDivElement;

const buildUI = () => {
  controls.addToContainer(controlsDiv);

  // TODO
  // It would be nice to add a way to add elements to the controls div
  // and even group them together in one element with the randomize button
  const saveButton = document.createElement('button');
  saveButton.classList.add('controls-save', 'controls-btn');
  saveButton.textContent = 'Save';
  saveButton.appendChild(createElement(ImageDown));
  saveButton.addEventListener('click', () => {
    const svg = drawingDiv.querySelector('svg') as SVGElement;
    downloadSVG(svg, `drawing-${window.location.hash.replace('#/', '').replace(/(\/|,)/g, '_')}.svg`);
  });
  controlsDiv.appendChild(saveButton);

  // Add global keyboard shortcuts
  document.addEventListener('keypress', (e: KeyboardEvent) => {
    if (document.activeElement === document.body) {
      e.preventDefault();

      if (e.key === 's') {
        document.body.classList.toggle('hide-controls');
      } else if (e.key === 'r') {
        controls.randomize();
      }
    }
  });
};

const draw = async () => {
  const options = controls.getOptions();

  // Swap random method for a seeded RNG
  Math.random = options.mainSeedRng;

  // Set unique favicon and title
  setTitle(options, title);

  // Render the image
  const svg = await render(options);

  drawingDiv.replaceChildren(svg);
};

// Redraw on options change
controls.onChange = draw;

// Initialize
buildUI();
draw();
