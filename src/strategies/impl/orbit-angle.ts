import { orbitFactory } from '../base/factories';
import type { Orbit } from '../base/orbit';

/**
 * Color by orbit angle (normalized to [0,1]).
 */
export const orbitAngle = orbitFactory((o: Orbit) => {
  const x = o.xs[0];
  const y = o.ys[0];
  return (Math.atan2(y, x) + Math.PI) / (2 * Math.PI);
});
