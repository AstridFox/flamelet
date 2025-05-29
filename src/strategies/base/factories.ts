import {
  StrategyContext,
  StrategyFactory,
  StrategyOptions,
  ColoringStrategy,
  Sample,
} from './context';
import { getPalette } from './palette';
import type { Orbit } from './orbit';

// Registry for coloring strategy factories.
const strategyRegistry = new Map<string, StrategyFactory>();

/**
 * Register a coloring strategy factory under a name.
 * @param name Unique name for the strategy.
 * @param factory StrategyFactory instance to register.
 */
export function registerStrategy(name: string, factory: StrategyFactory): void {
  strategyRegistry.set(name, factory);
}

/**
 * Retrieve a coloring strategy factory by name.
 * @param name Name of the registered strategy.
 * @throws Error if no strategy is found for the given name.
 */
export function getStrategyFactory(name: string): StrategyFactory {
  const factory = strategyRegistry.get(name);
  if (!factory) {
    throw new Error(`Unknown coloring strategy: ${name}`);
  }
  return factory;
}

/**
 * Factory for sample-based strategies.
 * Applies getT on each sample to compute a palette index t.
 */
export function sampleFactory(
  getT: (sample: Sample) => number
): StrategyFactory {
  return {
    create(options: StrategyOptions) {
      const paletteFn = getPalette(options.paletteDef);
      const context = new StrategyContext(options);
      const strategy: ColoringStrategy = {
        requiresOrbits: false,
        accumulate(sample: Sample) {
          const t = Math.min(Math.max(getT(sample), 0), 1);
          const color = paletteFn(t);
          context.commitSample(sample.x, sample.y, color);
        },
        finalize(outputBuffer: Uint8ClampedArray) {
          context.finalize(outputBuffer);
        },
      };
      return strategy;
    },
  };
}

/**
 * Factory for true orbit-based coloring strategies.
 * Accumulates sample points into orbits, applies getT to compute a single palette index t,
 * and applies that color to every sample in the orbit.
 */
export function orbitFactory(getT: (orbit: Orbit) => number): StrategyFactory {
  return {
    create(options: StrategyOptions) {
      const paletteFn = getPalette(options.paletteDef);
      const context = new StrategyContext(options);
      const orbitLength = options.orbitLength ?? 20;

      const orbits: Orbit[] = [];
      let current: Orbit = { xs: [], ys: [], t: 0 };

      const strategy: ColoringStrategy = {
        requiresOrbits: true,

        accumulate(sample: Sample) {
          current.xs.push(sample.x);
          current.ys.push(sample.y);

          if (current.xs.length >= orbitLength) {
            flushOrbit();
          }
        },

        finalize(outputBuffer: Uint8ClampedArray) {
          if (current.xs.length > 0) {
            flushOrbit();
          }

          for (const orbit of orbits) {
            const color = paletteFn(clamp(orbit.t, 0, 1));
            for (let i = 0; i < orbit.xs.length; i++) {
              context.commitSample(orbit.xs[i], orbit.ys[i], color);
            }
          }

          context.finalize(outputBuffer);
        },
      };

      function flushOrbit() {
        const rawT = getT(current);
        current.t = clamp(rawT, 0, 1);
        orbits.push(current);
        current = { xs: [], ys: [], t: 0 };
      }

      return strategy;
    },
  };
}

function clamp(t: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, t));
}

/**
 * Factory for pseudo-orbit strategies.
 * Uses orbit-style rendering logic per individual sample.
 */
export function pseudoOrbitFactory(
  getT: (sample: Sample) => number
): StrategyFactory {
  return {
    create(options: StrategyOptions) {
      const paletteFn = getPalette(options.paletteDef);
      const context = new StrategyContext(options);
      const strategy: ColoringStrategy = {
        requiresOrbits: true,
        accumulate(sample: Sample) {
          const t = Math.min(Math.max(getT(sample), 0), 1);
          const color = paletteFn(t);
          context.commitSample(sample.x, sample.y, color);
        },
        finalize(outputBuffer: Uint8ClampedArray) {
          context.finalize(outputBuffer);
        },
      };
      return strategy;
    },
  };
}

/**
 * Factory for histogram-based strategies.
 * Maps each function index to its palette color before accumulation.
 */
export function histogramFactory(): StrategyFactory {
  return {
    create(options: StrategyOptions) {
      const paletteFn = getPalette(options.paletteDef);
      const context = new StrategyContext(options);
      const { functions } = options;
      const funcColors = functions.map((fn, i) => {
        const t =
          typeof fn.color === 'number'
            ? Math.min(Math.max(fn.color, 0), 1)
            : functions.length > 1
            ? i / (functions.length - 1)
            : 0;
        return paletteFn(t);
      });
      const strategy: ColoringStrategy = {
        requiresOrbits: false,
        accumulate(sample: Sample) {
          const color = funcColors[sample.funcIndex];
          context.commitSample(sample.x, sample.y, color);
        },
        finalize(outputBuffer: Uint8ClampedArray) {
          context.finalize(outputBuffer);
        },
      };
      return strategy;
    },
  };
}
