import { FlamePreset, FlameFunction, AffineMatrix } from './types';
import { getAllPaletteKeys } from './strategies/base/palette';
import { getAllStrategyKeys } from './strategies/base/factories';
import { variations } from './variations';

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomAffine(range = 1.0): AffineMatrix {
  const a = randomFloat(-range, range);
  const b = randomFloat(-range, range);
  const c = randomFloat(-range, range);
  const d = randomFloat(-range, range);
  const e = randomFloat(-range, range);
  const f = randomFloat(-range, range);
  return [a, b, c, d, e, f];
}

function shuffle<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; --i) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function randomFlameFunctions(): FlameFunction[] {
  const varKeys = Object.keys(variations);
  const fnCount = randomInt(2, 6);
  const funcs: FlameFunction[] = [];
  for (let i = 0; i < fnCount; i++) {
    const keys = varKeys.slice();
    shuffle(keys);
    const take = randomInt(1, 3);
    const variationNames = keys.slice(0, take);
    const variationMap: Record<string, number> = {};
    variationNames.forEach((name) => {
      variationMap[name] = Math.random();
    });
    funcs.push({
      affine: randomAffine(),
      variations: variationMap,
      probability: 1 / fnCount,
    });
  }
  return funcs;
}

/**
 * Generate a random flame preset, with optional fixed dimensions.
 * @param width  optional image width override (random if omitted)
 * @param height optional image height override (random if omitted)
 */
export function randomFlamePreset(
  width?: number,
  height?: number
): FlamePreset {
  const paletteKeys = getAllPaletteKeys();
  const strategyKeys = getAllStrategyKeys();

  const palette = pickRandom(paletteKeys);
  const mode = pickRandom(strategyKeys);

  const coloring: Record<string, unknown> = { mode };
  if (mode.includes('distance') || mode.includes('flux')) {
    coloring.distanceScale = randomFloat(0.1, 2.0);
  }
  if (mode.includes('orbit')) {
    coloring.orbitLength = randomInt(10, 50);
  }

  const preset: FlamePreset = {
    width: width ?? randomInt(400, 1200),
    height: height ?? randomInt(300, 900),
    functions: randomFlameFunctions(),
    gamma: randomFloat(0.5, 2.0),
    iterations: randomInt(50000, 200000),
    burnIn: randomInt(10, 100),
    palette: palette,
    supersample: randomInt(1, 3),
    coloring,
  };
  return preset;
}
