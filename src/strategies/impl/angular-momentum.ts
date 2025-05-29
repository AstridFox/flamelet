import {
  StrategyContext,
  StrategyFactory,
  StrategyOptions,
  ColoringStrategy,
  Sample,
} from '../base/context';
import { getPalette } from '../base/palette';

/**
 * Options for the angular-momentum coloring strategy.
 */
export interface AngularMomentumOptions extends StrategyOptions {
  /** Number of samples to accumulate into an orbit before flushing. */
  orbitLength?: number;
  /** Scale factor for normalizing angular momentum L to t ∈ [0,1]. */
  momentumScale?: number;
}

/**
 * Color each orbit by its total angular momentum:
 *   L = Σ_i (Δx_i * y_i - Δy_i * x_i)
 * t is normalized as clamp(abs(L) / momentumScale, 0, 1).
 */
export const angularMomentum: StrategyFactory<AngularMomentumOptions> = {
  create(options) {
    const { orbitLength = 16, momentumScale } = options;
    const paletteFn = getPalette(options.paletteDef);
    const context = new StrategyContext(options);

    const orbits: { xs: number[]; ys: number[]; total: number }[] = [];
    let xs: number[] = [];
    let ys: number[] = [];

    const pushOrbit = () => {
      let total = 0;
      for (let i = 1; i < xs.length; i++) {
        const dx = xs[i] - xs[i - 1];
        const dy = ys[i] - ys[i - 1];
        total += dx * ys[i] - dy * xs[i];
      }
      orbits.push({ xs, ys, total });
      xs = [];
      ys = [];
    };

    const strategy: ColoringStrategy = {
      requiresOrbits: true,
      accumulate(sample: Sample) {
        xs.push(sample.x);
        ys.push(sample.y);
        if (xs.length >= orbitLength) {
          pushOrbit();
        }
      },
      finalize(outputBuffer: Uint8ClampedArray) {
        if (xs.length > 1) {
          pushOrbit();
        }
        // Auto-detect scale if not provided: max abs(total) across all orbits (fallback to 1)
        const maxTotal =
          orbits.length > 0
            ? orbits.reduce((m, o) => Math.max(m, Math.abs(o.total)), 0)
            : 0;
        const scale = momentumScale != null ? momentumScale : maxTotal || 1;

        console.log(
          `Angular momentum scale: ${scale}, max total: ${maxTotal}`);

        for (const orbit of orbits) {
          let t = Math.abs(orbit.total) / scale;
          //console.log(`Orbit total: ${orbit.total}, t: ${t}`);
          t = t < 0 ? 0 : t > 1 ? 1 : t;
          const color = paletteFn(t);
          for (let i = 0; i < orbit.xs.length; i++) {
            context.commitSample(orbit.xs[i], orbit.ys[i], color);
          }
        }
        context.finalize(outputBuffer);
      },
    };

    return strategy;
  },
};
