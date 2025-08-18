import { createElement, Download } from 'lucide';
import { Controls } from './controls/controls';
import { config } from './drawing/options-config';
import render from './drawing/render';
import { downloadPNG, downloadSVG } from './utils/download';
import setTitle from './utils/set-title';

import '@stanko/dual-range-input/dist/index.css';
import './scss/index.scss';
import seedrandom from 'seedrandom';
import { updateStars } from './utils/generate-stars';
import { initDialog } from './utils/dialog';
import { prepareStepByStepAnimation } from './drawing/step-by-step';
import { getTimelineElement } from './drawing/get-timeline-element';

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

  const saveRow = document.createElement('div');
  saveRow.classList.add('control');

  const saveLabel = document.createElement('span');
  saveLabel.classList.add('control-label');
  saveLabel.textContent = 'download';

  const saveRight = document.createElement('div');
  saveRight.classList.add('save-right');

  saveRow.appendChild(saveLabel);
  saveRow.appendChild(saveRight);

  const saveSVG = document.createElement('button');
  saveSVG.classList.add('controls-save', 'controls-btn');
  saveSVG.textContent = 'SVG';
  saveSVG.ariaLabel = 'Download SVG';
  saveSVG.appendChild(createElement(Download));
  saveSVG.addEventListener('click', () => {
    const svg = drawingDiv.querySelector('svg') as SVGElement;
    const options = controls.getOptions();
    const rng = seedrandom(window.location.hash);
    const id = rng().toString(36).substring(2, 8);

    downloadSVG(svg, `invader_${options.mainSeed}_${id}.svg`);
  });
  const savePNG = document.createElement('button');
  savePNG.classList.add('controls-save', 'controls-btn');
  savePNG.textContent = 'PNG';
  savePNG.ariaLabel = 'Download PNG';
  savePNG.appendChild(createElement(Download));
  savePNG.addEventListener('click', () => {
    const svg = drawingDiv.querySelector('svg') as SVGElement;
    const options = controls.getOptions();
    const rng = seedrandom(window.location.hash);
    const id = rng().toString(36).substring(2, 8);
    const size = parseInt(svg.style.getPropertyValue('--invader-width'));

    downloadPNG(svg, size, 40, `invader_${options.mainSeed}_${id}.png`);
  });
  saveRight.appendChild(saveSVG);
  saveRight.appendChild(savePNG);

  controlsDiv.appendChild(saveRow);

  // Add global keyboard shortcuts
  document.addEventListener('keypress', (e: KeyboardEvent) => {
    // Check if document.activeElement is not a text input
    const active = document.activeElement;
    const isTextInput = active && active instanceof HTMLInputElement && active.type === 'text';

    if (isTextInput) {
      return;
    }

    if (e.key === 'c') {
      e.preventDefault();
      document.body.classList.toggle('hide-controls');
    } else if (e.key === 'r') {
      e.preventDefault();
      controls.randomize();
    }
  });
};

const newButtonInNav = document.querySelector('.nav-new-button') as HTMLButtonElement;
newButtonInNav.addEventListener('click', () => {
  controls.randomize();
});

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

  // Step by step debug
  if (options.debug && new URLSearchParams(window.location.search).get('step') !== null) {
    const { offsets, jumpTo } = prepareStepByStepAnimation(svg);
    drawingDiv.appendChild(getTimelineElement(offsets, jumpTo));
  }
};

// Redraw on options change
controls.onChange = draw;

// About dialog
const { open } = initDialog(aboutDialog);
aboutButton.addEventListener('click', open);

// Initialize
buildUI(controls);
draw();

if (import.meta.env.PROD) {
  const gc = document.createElement('script');
  gc.setAttribute('data-goatcounter', 'https://muffinman_io.goatcounter.com/count');
  gc.setAttribute('async', '');
  gc.src = '//gc.zgo.at/count.js';

  document.body.appendChild(gc);
}
