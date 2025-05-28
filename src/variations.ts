type VariationFunction = (x: number, y: number) => [number, number];

export const linear: VariationFunction = (x, y) => [x, y];

export const swirl: VariationFunction = (x, y) => {
  const r2 = x * x + y * y;
  return [
    x * Math.sin(r2) - y * Math.cos(r2),
    x * Math.cos(r2) + y * Math.sin(r2),
  ];
};

export const horseshoe: VariationFunction = (x, y) => {
  const r = Math.hypot(x, y) || 1;
  return [((x - y) * (x + y)) / r, (2 * x * y) / r];
};

export const sinusoidal: VariationFunction = (x, y) => [
  Math.sin(x),
  Math.sin(y),
];

export const variations: Record<string, VariationFunction> = {
  linear,
  swirl,
  horseshoe,
  sinusoidal,
};

const assert = (cond: boolean, msg: string): void => {
  if (!cond) throw new Error(msg);
};

const eps = 1e-6;

assert(
  JSON.stringify(linear(3, 4)) === JSON.stringify([3, 4]),
  'linear failed'
);
{
  const [sx, sy] = sinusoidal(Math.PI / 2, 0);
  assert(Math.abs(sx - 1) < eps, 'sinusoidal x failed');
  assert(Math.abs(sy - 0) < eps, 'sinusoidal y failed');
}
{
  const [wx, wy] = swirl(1, 0);
  assert(Number.isFinite(wx) && Number.isFinite(wy), 'swirl not finite');
  assert(Math.abs(Math.hypot(wx, wy) - 1) < eps, 'swirl radius changed');
}
{
  const [hx, hy] = horseshoe(1, 1);
  const r0 = Math.hypot(1, 1);
  assert(Number.isFinite(hx) && Number.isFinite(hy), 'horseshoe not finite');
  assert(Math.abs(Math.hypot(hx, hy) - r0) < eps, 'horseshoe radius changed');
}
