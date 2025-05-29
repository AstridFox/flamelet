import {
  StrategyContext,
  StrategyFactory,
  StrategyOptions,
  ColoringStrategy,
  Sample,
} from '../base/context';
import { getPalette } from '../base/palette';

/**
 * Options for the radial-flux coloring strategy.
 */
export interface RadialFluxOptions extends StrategyOptions {
  /** Number of samples to accumulate into an orbit before flushing. */
  orbitLength?: number;
  /** Scale factor for normalizing flux count to t ∈ [0,1]. */
  fluxScale?: number;
}

/**
 * Color each orbit by how much it rotates about the origin.
 * This is approximated by counting sign changes in angular position.
 */
export const radialFlux: StrategyFactory<RadialFluxOptions> = {
  create(options) {
    const { orbitLength = 16, fluxScale } = options;
    const paletteFn = getPalette(options.paletteDef);
    const context = new StrategyContext(options);

    const orbits: { xs: number[]; ys: number[]; flux: number }[] = [];
    let xs: number[] = [];
    let ys: number[] = [];

    const pushOrbit = () => {
      let flux = 0;
      let lastAngle = Math.atan2(ys[0], xs[0]);
      for (let i = 1; i < xs.length; i++) {
        const angle = Math.atan2(ys[i], xs[i]);
        let delta = angle - lastAngle;
        if (delta > Math.PI) delta -= 2 * Math.PI;
        if (delta < -Math.PI) delta += 2 * Math.PI;
        flux += delta;
        lastAngle = angle;
      }
      orbits.push({ xs, ys, flux });
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
        const maxFlux =
          orbits.length > 0
            ? orbits.reduce((m, o) => Math.max(m, Math.abs(o.flux)), 0)
            : 0;
        const scale = fluxScale != null ? fluxScale : maxFlux || 1;

        console.log(`Radial flux scale: ${scale}, max flux: ${maxFlux}`);

        for (const orbit of orbits) {
          let t = Math.abs(orbit.flux) / scale;
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