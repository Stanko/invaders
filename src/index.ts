import { createElement, ImageDown } from 'lucide';
import { Controls } from './controls/controls';
import { config } from './drawing/options-config';
import render from './drawing/render';
import { downloadSVG } from './utils/download-svg';
import setTitle from './utils/set-title';

import '@stanko/dual-range-input/dist/index.css';
import './scss/index.scss';
import seedrandom from 'seedrandom';
import { updateStars } from './utils/generate-stars';
import { initDialog } from './utils/dialog';

// Initialize options controls
export const controls = new Controls(config);

// Get title from the HTML
const title = document.querySelector('title')?.textContent || '';

// UI elements
const controlsDiv = document.querySelector('.controls') as HTMLDivElement;
const drawingDiv = document.querySelector('.drawing') as HTMLDivElement;
const aboutDialog = document.querySelector('.dialog') as HTMLDialogElement;
const aboutButton = document.querySelector('nav button') as HTMLDialogElement;

const buildUI = (controls: Controls<typeof config>) => {
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
    const options = controls.getOptions();
    const rng = seedrandom(window.location.hash);
    const id = rng().toString(36).substring(2, 8);

    downloadSVG(svg, `invader_${options.mainSeed}_${id}.svg`);
  });
  controlsDiv.appendChild(saveButton);

  // Add global keyboard shortcuts
  document.addEventListener('keypress', (e: KeyboardEvent) => {
    // Check if document.activeElement is not an input
    const inputs = ['input', 'select', 'button', 'textarea'];

    if (document.activeElement && inputs.indexOf(document.activeElement.tagName.toLowerCase()) === -1) {
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

  // Generate stars first, to keep the same positions
  // (same values of the RNG)
  updateStars(options.mainSeedRng);

  // Render the image
  const svg = await render(options);

  drawingDiv.replaceChildren(svg);
  // Grid of invaders
  // drawingDiv.append(svg);
};

// Redraw on options change
controls.onChange = draw;

// About dialog
const { open } = initDialog(aboutDialog);
aboutButton.addEventListener('click', open);

// Initialize
buildUI(controls);
draw();
