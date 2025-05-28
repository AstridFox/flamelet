import { FlamePreset } from './types';
import { applyFlameFunction } from './flame';

/**
 * Render a fractal flame onto a 2D canvas using histogram accumulation,
 * log-density normalization, and gamma correction.
 */
export function renderFlame(
  preset: FlamePreset,
  canvas: HTMLCanvasElement
): void {
  const { width, height, functions, iterations = 100000, gamma = 1 } = preset;
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

  let x = 0;
  let y = 0;
  const xs: number[] = [];
  const ys: number[] = [];
  for (let i = 0; i < iterations; i++) {
    const r = Math.random() * totalProb;
    const idx = cumProbs.findIndex((p) => r < p);
    const fn = functions[idx >= 0 ? idx : functions.length - 1];
    [x, y] = applyFlameFunction(fn, x, y);
    xs.push(x);
    ys.push(y);
  }

    const minX = xs.reduce((a, b) => Math.min(a, b), Infinity);
    const maxX = xs.reduce((a, b) => Math.max(a, b), -Infinity);
    const minY = ys.reduce((a, b) => Math.min(a, b), Infinity);
    const maxY = ys.reduce((a, b) => Math.max(a, b), -Infinity);
    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;

  const histogram = new Uint32Array(width * height);
  for (let i = 0; i < xs.length; i++) {
    const px = Math.floor(((xs[i] - minX) / rangeX) * (width - 1));
    const py = Math.floor((1 - (ys[i] - minY) / rangeY) * (height - 1));
    if (px >= 0 && px < width && py >= 0 && py < height) {
      histogram[py * width + px]++;
    }
  }

  let maxCount = 0;
  for (const count of histogram) {
    if (count > maxCount) {
      maxCount = count;
    }
  }
  const logMax = Math.log(maxCount + 1);

  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;
  for (let i = 0; i < histogram.length; i++) {
    const count = histogram[i];
    if (count > 0) {
      const intensity = Math.pow(Math.log(count + 1) / logMax, 1 / gamma);
      const c = Math.floor(intensity * 255);
      const off = i * 4;
      data[off] = c;
      data[off + 1] = c;
      data[off + 2] = c;
      data[off + 3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);
}
