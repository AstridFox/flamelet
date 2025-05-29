import { orbitFactory } from '../base/factories';
import type { Orbit } from '../base/orbit';

/**
 * Color by orbit distance (normalized to [0,1]).
 */
export const orbitDistance = orbitFactory((o: Orbit) => {
  const d = Math.hypot(o.x, o.y);
  return d / (1 + d);
});
