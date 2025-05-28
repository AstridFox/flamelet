import { FlameFunction } from './types';
import { variations } from './variations';

export function applyFlameFunction(
  fn: FlameFunction,
  x: number,
  y: number
): [number, number] {
  const [a, b, c, d, e, f] = fn.affine;
  const x0 = a * x + b * y + c;
  const y0 = d * x + e * y + f;
  let newX = 0;
  let newY = 0;
  for (const [name, weight] of Object.entries(fn.variations)) {
    if (weight === 0) continue;
    const variationFn = variations[name];
    if (!variationFn) {
      throw new Error(`Unknown variation function: ${name}`);
    }
    const [vx, vy] = variationFn(x0, y0);
    newX += weight * vx;
    newY += weight * vy;
  }
  return [newX, newY];
}

const assert = (cond: boolean, msg: string): void => {
  if (!cond) throw new Error(msg);
};

{
  const fn: FlameFunction = {
    affine: [1, 0, 0, 0, 1, 0],
    variations: { linear: 1 },
    probability: 1,
  };
  const [x1, y1] = applyFlameFunction(fn, 3, 4);
  assert(x1 === 3 && y1 === 4, 'identity linear failed');
}

{
  const fn: FlameFunction = {
    affine: [2, 0, 1, 0, 3, 2],
    variations: { linear: 2 },
    probability: 1,
  };
  const [x2, y2] = applyFlameFunction(fn, 4, 5);
  assert(x2 === 18 && y2 === 34, 'affine linear weight failed');
}
