import { registerStrategy } from './base/factories';

import { histogram } from './impl/histogram';
import { orbitAngle } from './impl/orbit-angle';
import { orbitDistance } from './impl/orbit-distance';
import { angularMomentum } from './impl/angular-momentum';

// register all strategies centrally
registerStrategy('histogram', histogram);
registerStrategy('orbit-angle', orbitAngle);
registerStrategy('orbit-distance', orbitDistance);
registerStrategy('angular-momentum', angularMomentum);

export { getStrategyFactory, registerStrategy } from './base/factories';
export {
  registerPalette,
  getPalette,
  createPaletteFromArray,
} from './base/palette';
