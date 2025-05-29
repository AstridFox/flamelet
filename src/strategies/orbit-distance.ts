import { palette, createPaletteFromArray } from '../palette';
import type { StrategyFactory, Sample, StrategyOptions } from './index';
import { registerStrategy } from './index';

/**
 * Orbit-distance coloring: colors based on distance from origin normalized by scale.
 */
const orbitDistanceFactory: StrategyFactory = {
  create(options: StrategyOptions) {
    const { width, height, supersample, paletteDef, gamma, distanceScale } =
      options;
    const scale = Math.max(1, Math.floor(supersample));
    const getColor =
      Array.isArray(paletteDef) && paletteDef.length > 0
        ? createPaletteFromArray(paletteDef)
        : palette;

    const xs: number[] = [];
    const ys: number[] = [];
    const ds: number[] = [];
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let maxD = 0;

    return {
      accumulate(sample: Sample) {
        const { x, y } = sample;
        const d = Math.hypot(x, y);
        xs.push(x);
        ys.push(y);
        ds.push(d);
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        if (d > maxD) maxD = d;
      },
      finalize(outputBuffer: Uint8ClampedArray) {
        const rangeX = maxX - minX || 1;
        const rangeY = maxY - minY || 1;
        const highWidth = width * scale;
        const highHeight = height * scale;
        const histogramHS = new Uint32Array(highWidth * highHeight);
        const colorBufferHS = new Float32Array(highWidth * highHeight * 3);
        const normScale =
          distanceScale && distanceScale > 0 ? distanceScale : maxD || 1;

        for (let i = 0, n = xs.length; i < n; i++) {
          const px = Math.floor(((xs[i] - minX) / rangeX) * (highWidth - 1));
          const py = Math.floor(
            (1 - (ys[i] - minY) / rangeY) * (highHeight - 1)
          );
          if (px >= 0 && px < highWidth && py >= 0 && py < highHeight) {
            const idx = py * highWidth + px;
            histogramHS[idx]++;
            const t = ds[i] / normScale;
            const col = getColor(t);
            const off = idx * 3;
            colorBufferHS[off] += col[0];
            colorBufferHS[off + 1] += col[1];
            colorBufferHS[off + 2] += col[2];
          }
        }

        const widthPx = width;
        const heightPx = height;
        for (let y = 0; y < heightPx; y++) {
          for (let x = 0; x < widthPx; x++) {
            let sumR = 0,
              sumG = 0,
              sumB = 0;
            let count = 0;
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
            const off = (y * widthPx + x) * 4;
            if (count > 0) {
              const inv = 1 / (scale * scale);
              const hdrR = sumR * inv;
              const hdrG = sumG * inv;
              const hdrB = sumB * inv;
              const mappedR = hdrR / (1 + hdrR);
              const mappedG = hdrG / (1 + hdrG);
              const mappedB = hdrB / (1 + hdrB);
              outputBuffer[off] = Math.floor(
                Math.pow(mappedR, 1 / gamma) * 255
              );
              outputBuffer[off + 1] = Math.floor(
                Math.pow(mappedG, 1 / gamma) * 255
              );
              outputBuffer[off + 2] = Math.floor(
                Math.pow(mappedB, 1 / gamma) * 255
              );
              outputBuffer[off + 3] = 255;
            }
          }
        }
      },
    };
  },
};

registerStrategy('orbit-distance', orbitDistanceFactory);
