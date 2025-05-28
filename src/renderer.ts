import { FlamePreset } from './types';
import { applyFlameFunction } from './flame';
import { palette, createPaletteFromArray } from './palette';

/**
 * Render a fractal flame onto a 2D canvas using histogram accumulation,
 * log-density normalization, and gamma correction.
 */
export function renderFlame(
  preset: FlamePreset,
  canvas: HTMLCanvasElement
): void {
  const {
    width,
    height,
    functions,
    iterations = 100000,
    gamma = 1,
    palette: paletteDef,
  } = preset;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('2D rendering context not available');
  }

  const getColor =
    Array.isArray(paletteDef) && paletteDef.length > 0
      ? createPaletteFromArray(paletteDef)
      : palette;
  const funcColors: [number, number, number][] = functions.map((fn, i) => {
    const t =
      typeof fn.color === 'number'
        ? Math.min(Math.max(fn.color, 0), 1)
        : functions.length > 1
        ? i / (functions.length - 1)
        : 0;
    return getColor(t);
  });
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
  const idxs: number[] = [];
  for (let i = 0; i < iterations; i++) {
    const r = Math.random() * totalProb;
    const fnIdx = cumProbs.findIndex((p) => r < p);
    const index = fnIdx >= 0 ? fnIdx : functions.length - 1;
    const fn = functions[index];
    [x, y] = applyFlameFunction(fn, x, y);
    xs.push(x);
    ys.push(y);
    idxs.push(index);
  }

  const minX = xs.reduce((a, b) => Math.min(a, b), Infinity);
  const maxX = xs.reduce((a, b) => Math.max(a, b), -Infinity);
  const minY = ys.reduce((a, b) => Math.min(a, b), Infinity);
  const maxY = ys.reduce((a, b) => Math.max(a, b), -Infinity);
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;

  const histogram = new Uint32Array(width * height);
  const colorBuffer = new Float32Array(width * height * 3);
  for (let i = 0; i < xs.length; i++) {
    const px = Math.floor(((xs[i] - minX) / rangeX) * (width - 1));
    const py = Math.floor((1 - (ys[i] - minY) / rangeY) * (height - 1));
    if (px >= 0 && px < width && py >= 0 && py < height) {
      const idx = py * width + px;
      histogram[idx]++;
      const col = funcColors[idxs[i]];
      const bufOff = idx * 3;
      colorBuffer[bufOff] += col[0];
      colorBuffer[bufOff + 1] += col[1];
      colorBuffer[bufOff + 2] += col[2];
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
      const off = i * 4;
      const bufOff = i * 3;
      const rAvg = colorBuffer[bufOff] / count;
      const gAvg = colorBuffer[bufOff + 1] / count;
      const bAvg = colorBuffer[bufOff + 2] / count;
      data[off] = Math.floor(rAvg * intensity * 255);
      data[off + 1] = Math.floor(gAvg * intensity * 255);
      data[off + 2] = Math.floor(bAvg * intensity * 255);
      data[off + 3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);
}
