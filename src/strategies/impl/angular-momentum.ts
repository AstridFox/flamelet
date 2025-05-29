import { orbitFactory } from '../base/factories';
import type { Orbit } from '../base/orbit';

/**
 * Color by angular momentum proxy (angle * radius modulo 1).
 */
export const angularMomentum = orbitFactory((o: Orbit) => {
  const angle = (Math.atan2(o.y, o.x) + Math.PI) / (2 * Math.PI);
  const radius = Math.hypot(o.x, o.y);
  return (angle * radius) % 1;
});
