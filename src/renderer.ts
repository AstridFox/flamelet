import { FlamePreset } from './types';
import { applyFlameFunction } from './flame';
import { palette, createPaletteFromArray } from './palette';

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

  const scale = Math.max(1, Math.floor(supersample));
  const highWidth = width * scale;
  const highHeight = height * scale;
  const histogramHS = new Uint32Array(highWidth * highHeight);
  const colorBufferHS = new Float32Array(highWidth * highHeight * 3);
  for (let i = 0, n = xs.length; i < n; i++) {
    const px = Math.floor(((xs[i] - minX) / rangeX) * (highWidth - 1));
    const py = Math.floor((1 - (ys[i] - minY) / rangeY) * (highHeight - 1));
    if (px >= 0 && px < highWidth && py >= 0 && py < highHeight) {
      const idx = py * highWidth + px;
      histogramHS[idx]++;
      const bufOff = idx * 3;
      const col = funcColors[idxs[i]];
      colorBufferHS[bufOff] += col[0];
      colorBufferHS[bufOff + 1] += col[1];
      colorBufferHS[bufOff + 2] += col[2];
    }
  }

  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sumR = 0,
        sumG = 0,
        sumB = 0,
        count = 0;
      const baseY = y * scale;
      const baseX = x * scale;
      for (let j = 0; j < scale; j++) {
        for (let i = 0; i < scale; i++) {
          const idxHS = (baseY + j) * highWidth + (baseX + i);
          sumR += colorBufferHS[idxHS * 3];
          sumG += colorBufferHS[idxHS * 3 + 1];
          sumB += colorBufferHS[idxHS * 3 + 2];
          count += histogramHS[idxHS];
        }
      }
      const off = (y * width + x) * 4;
      if (count > 0) {
        const inv = 1 / (scale * scale);
        const hdrR = sumR * inv;
        const hdrG = sumG * inv;
        const hdrB = sumB * inv;
        const mappedR = hdrR / (1 + hdrR);
        const mappedG = hdrG / (1 + hdrG);
        const mappedB = hdrB / (1 + hdrB);
        data[off] = Math.floor(Math.pow(mappedR, 1 / gamma) * 255);
        data[off + 1] = Math.floor(Math.pow(mappedG, 1 / gamma) * 255);
        data[off + 2] = Math.floor(Math.pow(mappedB, 1 / gamma) * 255);
        data[off + 3] = 255;
      }
    }
  }
  ctx.putImageData(imageData, 0, 0);
}
