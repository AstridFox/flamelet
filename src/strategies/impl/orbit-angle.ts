import { orbitFactory } from '../base/factories';
import type { Orbit } from '../base/orbit';

/**
 * Color by orbit angle (normalized to [0,1]).
 */
export const orbitAngle = orbitFactory(
  (o: Orbit) => (Math.atan2(o.y, o.x) + Math.PI) / (2 * Math.PI)
);
