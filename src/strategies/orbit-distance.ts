import { createOrbitStrategy } from './orbit-base';
import { registerStrategy } from './index';

registerStrategy(
  'orbit-distance',
  createOrbitStrategy((s) => {
    const d = Math.hypot(s.x, s.y);
    return d / (1 + d); // avoid needing external scale
  })
);
