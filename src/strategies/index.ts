import type { FlameFunction } from '../types';

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
  /** Canvas width in pixels */
  width: number;
  /** Canvas height in pixels */
  height: number;
  /** Supersampling factor for high-res accumulation */
  supersample: number;
  /** Preset flame functions for computing base colors */
  functions: FlameFunction[];
  /** Optional palette of hex color strings */
  paletteDef?: string[];
  /** Gamma correction factor */
  gamma: number;
  /** Optional strategy-specific distance scale parameter */
  distanceScale?: number;
}

/**
 * A pluggable coloring strategy handles sample accumulation and final image output.
 */
export interface ColoringStrategy {
  /** Accumulate data for a single sample */
  accumulate(sample: Sample): void;
  /** Finalize and write RGBA pixel data into the output buffer */
  finalize(outputBuffer: Uint8ClampedArray): void;
}

/**
 * Factory for creating ColoringStrategy instances with shared options/state.
 */
export interface StrategyFactory {
  create(options: StrategyOptions): ColoringStrategy;
}

const registry = new Map<string, StrategyFactory>();

/**
 * Register a coloring strategy factory under the given name.
 */
export function registerStrategy(name: string, factory: StrategyFactory): void {
  registry.set(name, factory);
}

/**
 * Retrieve a registered coloring strategy factory by name.
 */
export function getStrategyFactory(name: string): StrategyFactory {
  const factory = registry.get(name);
  if (!factory) {
    throw new Error(`Unknown coloring strategy: ${name}`);
  }
  return factory;
}
