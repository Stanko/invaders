import isInPolygon from 'robust-point-in-polygon';
import type { Options } from '../utils/options-type';
import svgUtils, { SCALE } from '../utils/svg-utils';
import { Invader, type HornTentacle } from './invader';
import { getGridLines } from './render';
import BezierEasing from 'bezier-easing';

import { createTimeline, svg, stagger, type AnimationParams } from 'animejs';
import Vec from '../utils/vec';

export { SCALE, Invader, BezierEasing };

const colors = {
  transparent: 'rgba(0,0,0,0)',
  whiteTransparent: 'rgba(255, 255, 255, 0.5)',
  outline1: 'rgba(100, 160, 250)',
  outline2: 'rgba(160, 200, 255)',
  outline3: 'rgba(60, 100, 200)',
  c1: 'rgb(53, 108, 222)',
  cTransparent1: 'rgba(50, 110, 210, 0.75)',
  cTransparent2: 'rgba(30, 80, 170, 0.75)',
  cTransparent3: 'rgba(100, 160, 250, 0.75)',
};

export const renderStepByStep = (options: Options, invader: Invader) => {
  const { size } = options;
  const width = size * 2 + 1;
  const height = width;

  let svgContent = getGridLines(width, height, 'rgba(255, 255, 255, 0.15)');

  // center
  svgContent += svgUtils.getCircle(invader.bodyCenter, 0.2, {
    fill: colors.transparent,
    stroke: 'rgb(255,255,255)',
    class: 'body-center',
  });

  // top
  const bottomIndex = Math.floor(invader.body.length / 2);
  svgContent += svgUtils.getCircle(invader.body[0], 0.2, {
    fill: colors.transparent,
    stroke: colors.outline1,
    class: 'body-point body-point--top-bottom',
  });
  // bottom
  svgContent += svgUtils.getCircle(invader.body[bottomIndex], 0.2, {
    fill: colors.transparent,
    stroke: colors.outline1,
    class: 'body-point body-point--top-bottom',
  });
  // left points
  for (let i = 1; i < bottomIndex; i++) {
    svgContent += svgUtils.getCircle(invader.body[i], 0.2, {
      fill: colors.transparent,
      stroke: colors.outline1,
      class: 'body-point body-point--left',
    });
  }
  // right points
  for (let i = bottomIndex + 1; i < invader.body.length; i++) {
    svgContent += svgUtils.getCircle(invader.body[i], 0.2, {
      fill: colors.transparent,
      stroke: colors.outline1,
      class: 'body-point body-point--right',
    });
  }
  // body outline
  svgContent += svgUtils.getPath(invader.body, true, {
    fill: colors.transparent,
    stroke: colors.outline1,
    class: 'body-path',
  });

  // left tentacle start
  svgContent += svgUtils.getCircle(invader.tentacles[0].line[0], 0.2, {
    fill: colors.transparent,
    stroke: colors.outline1,
    class: 'tentacle-point tentacle-point--start',
  });
  invader.tentacles[0].line.slice(1).forEach((point) => {
    svgContent += svgUtils.getCircle(point, 0.2, {
      fill: colors.transparent,
      stroke: colors.outline1,
      class: 'tentacle-point tentacle-point--rest',
    });
  });
  svgContent += svgUtils.getPath(invader.tentacles[0].line, false, {
    fill: colors.transparent,
    stroke: colors.outline2,
    class: 'tentacle-mid-path tentacle-mid-path--left',
  });

  const normals = (horn: HornTentacle) => {
    const { fatLine } = horn;

    for (let i = 0; i < fatLine.length / 2; i++) {
      svgContent += svgUtils.getPath([fatLine[i], fatLine[fatLine.length - i - 1]], false, {
        stroke: colors.outline1,
        class: 'normal-path',
      });
    }

    svgContent += svgUtils.getPath(fatLine, true, {
      fill: colors.transparent,
      stroke: colors.outline2,
      class: 'tentancle-path',
    });
  };

  normals(invader.tentacles[0]);

  invader.tentacles.slice(1).forEach((tentacle) => {
    svgContent += svgUtils.getPath(tentacle.fatLine, true, {
      fill: colors.transparent,
      stroke: colors.outline2,
      class: 'other-tentancle-path',
    });
  });

  invader.horns.forEach((horn) => {
    svgContent += svgUtils.getPath(horn.fatLine, true, {
      fill: colors.transparent,
      stroke: colors.outline2,
      class: 'horn-path',
    });
  });

  // body fill
  const INSIDE = -1;
  const EDGE = 0;
  const EXTREMITIES_SEARCH_RADIUS = 0.5;

  const bodyArray: [number, number][] = invader.body.map((p) => [p.x, p.y]);

  const hornTentacles = [
    ...invader.tentacles.map((t) => t.fatLine), //
    ...invader.horns.map((h) => h.fatLine),
  ];

  invader.grid.forEach((col, x) => {
    col.forEach((_, y) => {
      const isInBody = isInPolygon(bodyArray, [x + 0.5, y + 0.5]);
      if (isInBody === INSIDE || isInBody === EDGE) {
        svgContent += svgUtils.getRect(
          { x, y },
          { x: 1, y: 1 },
          {
            fill: colors.transparent,
            stroke: colors.c1,
            class: `body-rect body-rect--${invader.grid[x][y]}`,
          },
        );
        svgContent += svgUtils.getCircle({ x: x + 0.5, y: y + 0.5 }, 0.05, {
          fill: colors.transparent,
          class: 'body-rect-center',
          stroke: colors.outline2,
        });
      } else {
        for (const polygon of hornTentacles) {
          const polygonArray: [number, number][] = polygon.map((p) => [p.x, p.y]);
          let painted = false;

          for (const point of polygon) {
            const d = point.distance(new Vec(x + 0.5, y + 0.5));
            const isIn = isInPolygon(polygonArray, [x + 0.5, y + 0.5]);

            if (d < EXTREMITIES_SEARCH_RADIUS || isIn === INSIDE || isIn === EDGE) {
              svgContent += svgUtils.getRect(
                { x, y },
                { x: 1, y: 1 },
                {
                  fill: colors.transparent,
                  stroke: colors.c1,
                  class: `horn-tentacle-rect horn-tentacle-rect--${invader.grid[x][y]}`,
                },
              );
              painted = true;
              break;
            }
          }

          // If we painted the cell, skip the rest of the extremities
          if (painted) {
            break;
          }
        }
      }
    });
  });

  invader.grid.forEach((col, x) => {
    col.forEach((_, y) => {
      if (invader.grid[x][y] === 'z') {
        svgContent += svgUtils.getRect(
          { x, y },
          { x: 1, y: 1 },
          {
            fill: colors.transparent,
            stroke: colors.c1,
            class: 'around-eyes-rect',
          },
        );
      }
    });
  });

  return svgContent;
};

export const prepareStepByStepAnimation = (svgEl: SVGElement) => {
  const offsets: number[] = [0];

  let nextPauseIndex = -1;

  const getStateClass = (index: number) => {
    if (index < 0) {
      return '';
    }

    return new Array(index)
      .fill('')
      .map((_, index) => index)
      .join(' ');
  };

  const timeline = createTimeline({
    autoplay: false,
    onUpdate: (tl) => {
      svgEl.dataset.state = getStateClass(nextPauseIndex);

      if (!tl.paused && tl.currentTime >= offsets[nextPauseIndex]) {
        tl.pause();
        tl.seek(offsets[nextPauseIndex]);
        svgEl.dataset.state = `${getStateClass(nextPauseIndex)} ${nextPauseIndex - 1}--end`;
      }
    },
    onComplete: () => {
      svgEl.dataset.state = `${getStateClass(offsets.length + 1)} ${offsets.length}--end`;
    },
  });

  const addPoints = (
    selector: string,
    options: {
      addStop?: boolean;
      position?: number;
      duration?: number;
      fill?: string;
    },
  ) => {
    const { addStop, position = timeline.duration, duration = 300, fill = colors.cTransparent3 } = options;

    if (addStop) {
      offsets.push(timeline.duration);
    }

    timeline.add(
      svg.createDrawable(selector),
      {
        draw: '0 1',
        ease: 'inQuad',
        duration: duration,
        delay: stagger(duration * 0.75),
        fill: {
          to: fill,
          delay: stagger(duration * 0.75),
        },
      },
      position,
    );
  };

  const addPath = (
    selector: string,
    options: {
      addStop?: boolean;
      position?: number;
      duration?: number;
      fill?: string;
      draw?: string;
    },
  ) => {
    const { addStop, position = timeline.duration, duration = 1000, fill, draw = '0 1' } = options;

    if (addStop) {
      offsets.push(timeline.duration);
    }

    const o: AnimationParams = {
      draw,
      ease: 'outQuad',
      duration,
      delay: stagger(duration * 0.75),
    };
    if (fill) {
      o.fill = {
        to: fill,
        delay: stagger(duration * 0.75),
      };
    }

    timeline.add(svg.createDrawable(selector), o, position);
  };

  addPoints('.body-center', { fill: colors.whiteTransparent });
  addPoints('.body-point--top-bottom', { addStop: true });
  addPoints('.body-point--left', { addStop: true });
  addPoints('.body-point--right', { addStop: true });
  addPath('.body-path', { addStop: true });
  addPoints('.tentacle-point--start', { addStop: true });

  const tentaclePosition = timeline.duration;
  addPoints('.tentacle-point--rest', { addStop: true, position: tentaclePosition });
  addPath('.tentacle-mid-path', { position: tentaclePosition, duration: 2000 });

  addPath('.normal-path', { addStop: true, duration: 500 });
  addPath('.tentancle-path', { addStop: true });
  addPath('.other-tentancle-path', { addStop: true });
  addPath('.horn-path', { addStop: true });

  const bodyPaintPosition = timeline.duration;
  addPoints('.body-rect-center', {
    addStop: true,
    duration: 250,
    position: bodyPaintPosition,
    fill: colors.transparent,
  });
  addPath('.body-rect', { duration: 250, position: bodyPaintPosition + 500, fill: colors.cTransparent1 });
  addPath('.horn-tentacle-rect', { addStop: true, duration: 250, fill: colors.cTransparent2 });
  addPath('.around-eyes-rect', { addStop: true, duration: 250, fill: colors.cTransparent3 });

  const jumpTo = (index: number, play: boolean = true) => {
    timeline.seek(offsets[index]);

    if (play) {
      nextPauseIndex = index + 1;
    } else {
      nextPauseIndex = index;
    }

    if (play) {
      timeline.play();
    }
  };

  return {
    timeline,
    offsets,
    jumpTo,
  };
};
