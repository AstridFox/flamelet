import { palette, createPaletteFromArray } from '../palette';
import type { StrategyFactory, Sample, StrategyOptions } from './index';

/**
 * A factory to generate orbit-aware coloring strategies by providing a function
 * that maps each sample to a t ∈ [0, 1] for palette lookup.
 */
export function createOrbitStrategy(
  getT: (sample: Sample) => number
): StrategyFactory {
  return {
    create(options: StrategyOptions) {
      const { width, height, supersample, paletteDef, gamma } = options;
      const scale = Math.max(1, Math.floor(supersample));
      const getColor =
        Array.isArray(paletteDef) && paletteDef.length > 0
          ? createPaletteFromArray(paletteDef)
          : palette;

      const xs: number[] = [];
      const ys: number[] = [];
      const ts: number[] = [];

      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      return {
        accumulate(sample: Sample) {
          const { x, y } = sample;
          const t = Math.max(0, Math.min(1, getT(sample))); // clamp to [0,1]
          xs.push(x);
          ys.push(y);
          ts.push(t);

          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        },

        finalize(outputBuffer: Uint8ClampedArray) {
          const rangeX = maxX - minX || 1;
          const rangeY = maxY - minY || 1;
          const highWidth = width * scale;
          const highHeight = height * scale;

          const histogramHS = new Uint32Array(highWidth * highHeight);
          const colorBufferHS = new Float32Array(highWidth * highHeight * 3);

          for (let i = 0; i < xs.length; i++) {
            const x = xs[i];
            const y = ys[i];
            const t = ts[i];

            const px = Math.floor(((x - minX) / rangeX) * (highWidth - 1));
            const py = Math.floor((1 - (y - minY) / rangeY) * (highHeight - 1));
            if (px < 0 || px >= highWidth || py < 0 || py >= highHeight)
              continue;

            const idx = py * highWidth + px;
            histogramHS[idx]++;
            const col = getColor(t);
            const off = idx * 3;
            colorBufferHS[off] += col[0];
            colorBufferHS[off + 1] += col[1];
            colorBufferHS[off + 2] += col[2];
          }

          for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
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

              const off = (y * width + x) * 4;
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
}
