export interface VariationMap {
  [name: string]: number;
}

export type AffineMatrix = [number, number, number, number, number, number];

export interface FlameFunction {
  affine: AffineMatrix;
  variations: VariationMap;
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
}
