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
  iterations?: number;
  /** Optional palette of hex color strings (e.g., "#ff0000") to use instead of the default rainbow palette */
  palette?: string[];
  /**
   * Optional supersampling factor; internally render at width*supersample x height*supersample then downscale for antialiasing.
   */
  supersample?: number;
}
