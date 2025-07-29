import getDrawingData from './index';
import svgUtils, { SCALE } from '../utils/svg-utils';
import type { Options } from '../utils/options-type';
import type { HornTentacle } from './invader';
import Vec from '../utils/vec';

const getPixels = (grid: string[][], gap: number = 0) => {
  const size = 1 - gap * 2;
  const pixels = grid.map((row, x) => {
    return row
      .map((pixel, y) => {
        if (pixel !== ' ' && pixel !== 'o') {
          // return `<rect x="${x + gap}" y="${y + gap}" width="${size}" height="${size}" class="invader-pixel invader-pixel--${pixel}" />`;
          return svgUtils.getRect(new Vec(x + gap, y + gap), new Vec(size, size), {
            class: `invader-pixel invader-pixel--${pixel}`,
          });
        }
        return '';
      })
      .filter(Boolean)
      .join('\n');
  });

  const l = document.documentElement.style.getPropertyValue('--theme-l');
  const c = document.documentElement.style.getPropertyValue('--theme-c');
  const h = document.documentElement.style.getPropertyValue('--theme-h');

  const stroke = `oklch(${l} ${c} ${h})`;

  return [`<g class="invader-pixels" fill="${stroke}">`, pixels.join('\n'), '</g>'].join('\n');
};

const getHornTentacleContent = (items: HornTentacle[], name: string) => {
  let content = '';
  const plural = name + 's';

  // Outlines
  content += `<g class="invader-${plural}" stroke="black" fill="none">`;
  items.forEach((item) => {
    content += svgUtils.getPath(item.fatLine, true, {
      class: `invader-${name}`,
    });
  });
  content += '</g>';

  // Lines
  content += `<g class="invader-${name}-lines" stroke="blue" fill="none">`;
  items.forEach((item) => {
    content += svgUtils.getPath(item.line, false, {
      class: `invader-${name}-line`,
    });
  });
  content += '</g>';

  // Points
  content += `<g class="invader-${name}-points" fill="blue">`;
  items.forEach((item) => {
    item.line.forEach((point) => {
      content += svgUtils.getCircle(point, 0.12, {
        class: `invader-${name}-point`,
      });
    });
  });
  content += '</g>';

  return content;
};

const getGridLines = (width: number, height: number) => {
  const d = [];

  for (let i = 0; i <= width; i++) {
    d.push(`M ${i * SCALE} 0 v ${height * SCALE}`);
  }

  for (let j = 0; j <= height; j++) {
    d.push(`M 0 ${j * SCALE} h ${width * SCALE}`);
  }

  return `<path d="${d.join(' ')}" class="invader-grid" stroke="#ddd" />`;
};

export default async function render(options: Options): Promise<SVGElement> {
  const { size, debug, gap, flip, showGrid } = options;

  const width = size * 2 + 1;
  const height = width;

  document.documentElement.style.setProperty('--invader-width', width.toString());

  // ----- SVG init ----- //
  const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svgElement.setAttribute('viewBox', `0 0 ${width * SCALE} ${height * SCALE}`);
  svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

  if (debug) {
    svgElement.classList.add('debug');
  }

  // ----- Main logic ----- //
  // TODO add default memoization for "getDrawingData"
  console.time('drawing data');
  const { invader } = await getDrawingData(options);
  console.timeEnd('drawing data');

  // ----- Render ----- //
  console.time('svg render');
  // Add current URL with parameters into the SVG
  let svgContent = `\n<!-- ${window.location.href} -->\n`;

  if (flip) {
    const grid = invader.grid.map((col) => {
      return [...col].reverse();
    });

    svgContent += getPixels(grid, gap);
  } else {
    svgContent += getPixels(invader.grid, gap);
  }

  // Debug
  if (debug) {
    svgContent += `<g class="invader-debug" stroke-linecap="round" stroke-linejoin="round">`;
    svgContent += svgUtils.getPath(invader.body, true, {
      class: 'invader-body',
      fill: 'none',
      stroke: 'black',
    });

    svgContent += getHornTentacleContent(invader.horns, 'horn');
    svgContent += getHornTentacleContent(invader.tentacles, 'tentacle');
    svgContent += `</g>`;
  }

  if (showGrid) {
    svgContent += getGridLines(width, height);
  }

  svgElement.innerHTML = svgContent;
  console.timeEnd('svg render');

  return svgElement;
}
