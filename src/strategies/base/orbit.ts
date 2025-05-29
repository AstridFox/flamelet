/**
 * Represents a group of temporally contiguous sample values—
 * used for orbit-based coloring strategies.
 */
export interface Orbit {
  /** The sequence of X coordinates in this orbit */
  xs: number[];
  /** The sequence of Y coordinates in this orbit */
  ys: number[];
  /** A single normalized t ∈ [0, 1] value associated with the orbit for coloring */
  t: number;
}
