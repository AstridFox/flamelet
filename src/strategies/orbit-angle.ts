import { createOrbitStrategy } from './orbit-base';
import { registerStrategy } from './index';

registerStrategy(
  'orbit-angle',
  createOrbitStrategy((s) => (Math.atan2(s.y, s.x) + Math.PI) / (2 * Math.PI))
);
