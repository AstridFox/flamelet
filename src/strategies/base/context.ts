import type { FlameFunction } from '../../types';

/**
 * Sample data for a single iteration of the IFS.
 */
export interface Sample {
  /** X coordinate in fractal space */
  x: number;
  /** Y coordinate in fractal space */
  y: number;
  /** Index of the FlameFunction used for this sample */
  funcIndex: number;
}

/**
 * Options passed to a coloring strategy factory when creating a strategy instance.
 */
export interface StrategyOptions {
  width: number;
  height: number;
  supersample: number;
  functions: FlameFunction[];
  paletteDef?: string[];
  gamma: number;
  distanceScale?: number;
  /** Number of samples to accumulate into an orbit before flushing (used by orbit-based strategies). */
  orbitLength?: number;
  /** Scale factor for normalizing angular momentum L to t ∈ [0,1] (used by angular-momentum strategy). */
  momentumScale?: number;
}

/**
 * A pluggable coloring strategy handles sample accumulation and final image output.
 */
export interface ColoringStrategy {
  /** Accumulate data for a single sample */
  accumulate(sample: Sample): void;
  /** Finalize and write RGBA pixel data into the output buffer */
  finalize(outputBuffer: Uint8ClampedArray): void;
  /** Optional metadata for introspection */
  requiresOrbits?: boolean;
}

/**
 * Factory for creating ColoringStrategy instances with shared options/state.
 */
export interface StrategyFactory<
  Opts extends StrategyOptions = StrategyOptions
> {
  /** Create a strategy instance with given options */
  create(options: Opts): ColoringStrategy;
}

/**
 * Shared strategy context for pixel accumulation and downsampling (supersampling-aware),
 * including tone mapping and gamma correction.
 */
export class StrategyContext {
  private width: number;
  private height: number;
  private scale: number;
  private gamma: number;

  private xs: number[] = [];
  private ys: number[] = [];
  private cols: [number, number, number][] = [];

  private minX = Infinity;
  private minY = Infinity;
  private maxX = -Infinity;
  private maxY = -Infinity;

  constructor(options: StrategyOptions) {
    this.width = options.width;
    this.height = options.height;
    this.scale = Math.max(1, Math.floor(options.supersample));
    this.gamma = options.gamma;
  }

  /**
   * Commit a single sample with its color.
   * @param x Fractal-space x coordinate.
   * @param y Fractal-space y coordinate.
   * @param color RGB color [r,g,b] in [0,1].
   */
  commitSample(x: number, y: number, color: [number, number, number]): void {
    this.xs.push(x);
    this.ys.push(y);
    this.cols.push(color);
    if (x < this.minX) this.minX = x;
    if (x > this.maxX) this.maxX = x;
    if (y < this.minY) this.minY = y;
    if (y > this.maxY) this.maxY = y;
  }

  /**
   * Finalize accumulation: downsample and apply tone mapping and gamma correction.
   * Writes RGBA [0-255] values into outputBuffer.
   */
  finalize(outputBuffer: Uint8ClampedArray): void {
    const {
      width,
      height,
      scale,
      gamma,
      xs,
      ys,
      cols,
      minX,
      minY,
      maxX,
      maxY,
    } = this;
    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;
    const highWidth = width * scale;
    const highHeight = height * scale;
    const hist = new Uint32Array(highWidth * highHeight);
    const colorBuf = new Float32Array(highWidth * highHeight * 3);

    for (let i = 0; i < xs.length; i++) {
      const x = xs[i];
      const y = ys[i];
      const px = Math.floor(((x - minX) / rangeX) * (highWidth - 1));
      const py = Math.floor((1 - (y - minY) / rangeY) * (highHeight - 1));
      if (px < 0 || px >= highWidth || py < 0 || py >= highHeight) continue;
      const idx = py * highWidth + px;
      hist[idx]++;
      const off = idx * 3;
      const col = cols[i];
      colorBuf[off] += col[0];
      colorBuf[off + 1] += col[1];
      colorBuf[off + 2] += col[2];
    }

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let sumR = 0,
          sumG = 0,
          sumB = 0,
          count = 0;
        const baseY = y * scale;
        const baseX = x * scale;
        for (let j = 0; j < scale; j++) {
          for (let i2 = 0; i2 < scale; i2++) {
            const idxHS = (baseY + j) * highWidth + (baseX + i2);
            sumR += colorBuf[idxHS * 3];
            sumG += colorBuf[idxHS * 3 + 1];
            sumB += colorBuf[idxHS * 3 + 2];
            count += hist[idxHS];
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
          outputBuffer[off] = Math.floor(Math.pow(mappedR, 1 / gamma) * 255);
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
  }
}
