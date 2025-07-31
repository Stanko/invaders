import random from './random';

const starsDiv = [...document.querySelectorAll('.star')] as HTMLDivElement[];

export const updateStars = (rng: () => number) => {
  for (let i = 0; i < starsDiv.length; i++) {
    const star = starsDiv[i];

    // Minimum radius of 20% to avoid position where invader is rendered
    // This avoids a half of the pixel weirdly peaking behind the invader
    const r = random(20, 70, rng);
    const angle = random(0, Math.PI * 2, rng);

    const x = 50 + Math.cos(angle) * r;
    const y = 50 + Math.sin(angle) * r;

    star.style.left = `${x.toFixed(2)}%`;
    star.style.top = `${y.toFixed(2)}%`;
  }
};
