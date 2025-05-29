import { FlamePreset } from './types';
import { applyFlameFunction } from './flame';
import './strategies/histogram';
import './strategies/orbit-distance';
import { getStrategyFactory } from './strategies';

/**
 * Render a fractal flame onto a 2D canvas using HDR color accumulation,
 * tone mapping, gamma correction, and optional supersampling.
 */
export function renderFlame(
  preset: FlamePreset,
  canvas: HTMLCanvasElement
): void {
  const {
    width,
    height,
    supersample = 1,
    functions,
    iterations = 100000,
    burnIn = 20,
    gamma = 1,
    palette: paletteDef,
  } = preset;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('2D rendering context not available');
  }

  const cumProbs: number[] = [];
  let totalProb = 0;
  for (const fn of functions) {
    totalProb += fn.probability;
    cumProbs.push(totalProb);
  }

  const strategyFactory = getStrategyFactory(
    preset.coloring?.mode ?? 'histogram'
  );
  const strategy = strategyFactory.create({
    width,
    height,
    supersample,
    functions,
    paletteDef,
    gamma,
    distanceScale: preset.coloring?.distanceScale,
  });

  let x = Math.random() * 2 - 1;
  let y = Math.random() * 2 - 1;
  for (let i = 0; i < burnIn; i++) {
    const r = Math.random() * totalProb;
    const fnIdx = cumProbs.findIndex((p) => r < p);
    const index = fnIdx >= 0 ? fnIdx : functions.length - 1;
    const fn = functions[index];
    [x, y] = applyFlameFunction(fn, x, y);
  }
  for (let i = 0; i < iterations; i++) {
    const r = Math.random() * totalProb;
    const fnIdx = cumProbs.findIndex((p) => r < p);
    const index = fnIdx >= 0 ? fnIdx : functions.length - 1;
    const fn = functions[index];
    [x, y] = applyFlameFunction(fn, x, y);
    strategy.accumulate({ x, y, funcIndex: index });
  }

  const imageData = ctx.createImageData(width, height);
  strategy.finalize(imageData.data);
  ctx.putImageData(imageData, 0, 0);
}
