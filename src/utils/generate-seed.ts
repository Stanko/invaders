import random from './random';
import { words } from './words';

// Backup reference to the browser's Math.random method
export const originalRandom = Math.random;

export default function generateSeed() {
  return [1, 2, 3]
    .map(() => {
      const index = random(0, words.length - 1, originalRandom, 0);
      return words[index];
    })
    .join('-');
}
