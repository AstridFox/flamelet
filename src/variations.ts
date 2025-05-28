// variations.ts

export type VariationFunction = (x: number, y: number) => [number, number];

// --- Core Variations ---

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

export const spherical: VariationFunction = (x, y) => {
    const r2 = x * x + y * y || 1e-6;
    return [x / r2, y / r2];
};

export const bubble: VariationFunction = (x, y) => {
    const r2 = x * x + y * y;
    return [x / (r2 + 1), y / (r2 + 1)];
};

export const polar: VariationFunction = (x, y) => {
    const r = Math.hypot(x, y);
    const theta = Math.atan2(y, x);
    return [theta / Math.PI, r - 1];
};

export const handkerchief: VariationFunction = (x, y) => {
    const r = Math.hypot(x, y);
    const theta = Math.atan2(y, x);
    return [Math.sin(theta + r), Math.cos(theta - r)];
};

export const heart: VariationFunction = (x, y) => {
    const r = Math.hypot(x, y);
    const theta = Math.atan2(y, x);
    return [r * Math.sin(theta * r), -r * Math.cos(theta * r)];
};

export const disc: VariationFunction = (x, y) => {
    const r = Math.hypot(x, y);
    const theta = Math.atan2(y, x);
    return [
        (theta / Math.PI) * Math.sin(Math.PI * r),
        (theta / Math.PI) * Math.cos(Math.PI * r),
    ];
};

export const rings: VariationFunction = (x, y) => {
    const r = Math.hypot(x, y);
    const theta = Math.atan2(y, x);
    return [Math.sin(r * r), Math.cos(theta)];
};

export const rings2: VariationFunction = (x, y) => {
    const r = Math.hypot(x, y) % 1.0;
    const theta = Math.atan2(y, x);
    return [r * Math.cos(theta), r * Math.sin(theta)];
};

export const fan: VariationFunction = (x, y) => {
    const theta = Math.atan2(y, x);
    const r = Math.hypot(x, y);
    const t = theta + Math.PI * (Math.floor(theta / Math.PI) % 2);
    return [r * Math.sin(t), r * Math.cos(t)];
};

export const spiral: VariationFunction = (x, y) => {
    const r = Math.hypot(x, y);
    const theta = Math.atan2(y, x);
    return [Math.cos(theta) / r, Math.sin(theta) / r];
};

export const diamond: VariationFunction = (x, y) => {
    const r = Math.hypot(x, y);
    const theta = Math.atan2(y, x);
    return [Math.sin(theta) * Math.cos(r), Math.cos(theta) * Math.sin(r)];
};

export const ex: VariationFunction = (x, y) => {
    const r = Math.hypot(x, y);
    const theta = Math.atan2(y, x);
    return [
        r * Math.pow(Math.sin(theta + r), 3),
        r * Math.pow(Math.cos(theta - r), 3),
    ];
};

export const waves: VariationFunction = (x, y) => [
    x + 0.5 * Math.sin(y / ((y * y) + 1)),
    y + 0.5 * Math.sin(x / ((x * x) + 1)),
];

export const fisheye: VariationFunction = (x, y) => {
    const r = 2 / (Math.hypot(x, y) + 1e-6);
    return [r * y, r * x];
};

export const popcorn: VariationFunction = (x, y) => [
    x + 0.05 * Math.sin(3 * y),
    y + 0.05 * Math.sin(3 * x),
];

export const eyefish: VariationFunction = (x, y) => {
    const r = 2 / (Math.hypot(x, y) + 1e-6);
    return [r * x, r * y];
};

export const blade: VariationFunction = (x, y) => {
    const r = Math.hypot(x, y);
    const theta = Math.atan2(y, x);
    return [r * Math.cos(theta), r * Math.sin(2 * theta)];
};

export const bent: VariationFunction = (x, y) => [
    x < 0 ? x * 2 : x,
    y < 0 ? y / 2 : y,
];

export const cross: VariationFunction = (x, y) => [
    x / (x * x - y * y + 1e-6),
    y / (y * y - x * x + 1e-6),
];

export const cosine: VariationFunction = (x, y) => [
    Math.cos(Math.PI * x) * Math.cosh(y),
    -Math.sin(Math.PI * x) * Math.sinh(y),
];

// --- Registry ---

export const variations: Record<string, VariationFunction> = {
    linear,
    swirl,
    horseshoe,
    sinusoidal,
    spherical,
    bubble,
    polar,
    handkerchief,
    heart,
    disc,
    rings,
    rings2,
    fan,
    spiral,
    diamond,
    ex,
    waves,
    fisheye,
    popcorn,
    eyefish,
    blade,
    bent,
    cross,
    cosine,
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
