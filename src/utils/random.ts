export default function random(min: number = 0, max: number = 1, rng?: (() => number) | null, decimalPlaces = 16) {
  const value = (rng || Math.random)() * (max - min) + min;

  if (decimalPlaces) {
    return parseFloat(value.toFixed(decimalPlaces));
  }

  return Math.round(value);
}
