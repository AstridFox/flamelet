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
  /**
   * Optional palette of hex color strings to use instead of the default rainbow palette.
   * Can be a single hex string (e.g., "#ff0000") or an array of hex strings.
   */
  palette?: string | string[];
  /**
   * Optional supersampling factor; internally render at width*supersample x height*supersample then downscale for antialiasing.
   */
  supersample?: number;
  /** Optional coloring strategy options */
  coloring?: ColoringOptions;
  /** Internal cache of fractal-space bounds for domain-scaling transforms (minX, minY, maxX, maxY). */
  /** Internal cache of full iterations count for domain-bound dry-run (for drag/interactive use). */
  _origIterations?: number;
  domainBounds?: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };

  /** Optional affine transform applied to fractal-space sample coordinates before mapping to the pixel grid.
   * rotation in radians, uniform scale, and translation offsets (in pixel units).
   */
  finalTransform?: {
    rotation?: number;
    scale?: number;
    translateX?: number;
    translateY?: number;
  };
}

export interface ColoringOptions {
  /** The coloring strategy to use: 'histogram', 'orbit-distance', etc. */
  mode?: string;
  /** Strategy-specific options for coloring (e.g., distanceScale for orbit-distance). */
  distanceScale?: number;
  /** For orbit-based strategies: number of samples to accumulate before flushing. */
  orbitLength?: number;
  /** For angular-momentum strategy: scale to normalize total angular momentum to [0,1]. */
  momentumScale?: number;
}
