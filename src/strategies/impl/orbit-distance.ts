import { orbitFactory } from '../base/factories';
import type { Orbit } from '../base/orbit';

/**
 * Color by orbit distance (normalized to [0,1]).
 */
export const orbitDistance = orbitFactory((o: Orbit) => {
  const x = o.xs[0];
  const y = o.ys[0];
  const d = Math.hypot(x, y);
  return d / (1 + d);
});
