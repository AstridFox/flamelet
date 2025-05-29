export interface VariationMap {
  [name: string]: number;
}

export type AffineMatrix = [number, number, number, number, number, number];

export interface FlameFunction {
  affine: AffineMatrix;
  variations: VariationMap;
  /** Optional per-variation numeric parameters */
  parameters?: Record<string, Record<string, number>>;
  color?: number;
  probability: number;
}

export interface FlamePreset {
  width: number;
  height: number;
  functions: FlameFunction[];
  gamma?: number;
  /** Number of sample iterations to accumulate into the histogram. */
  iterations?: number;
  /** Optional number of initial iterations to skip (burn-in) before sampling. */
  burnIn?: number;
  /** Optional palette of hex color strings (e.g., "#ff0000") to use instead of the default rainbow palette */
  palette?: string[];
  /**
   * Optional supersampling factor; internally render at width*supersample x height*supersample then downscale for antialiasing.
   */
  supersample?: number;
  /** Optional coloring strategy options */
  coloring?: ColoringOptions;
}

export interface ColoringOptions {
  /** The coloring strategy to use: 'histogram', 'orbit-distance', etc. */
  mode?: string;
  /** Strategy-specific options for coloring (e.g., distanceScale for orbit-distance). */
  distanceScale?: number;
}
