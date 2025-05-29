// variations.ts

export type VariationFunction = (
  x: number,
  y: number,
  params?: Record<string, number>
) => [number, number];

// --- Core Variations ---

export const linear: VariationFunction = (x, y) => [x, y];

export const swirl: VariationFunction = (x, y) => {
  // Bound r2 to avoid huge arguments in sin/cos (prevent overflow/NaN)
  const raw = x * x + y * y;
  const r2 = Number.isFinite(raw) ? raw % (2 * Math.PI) : 0;
  const sinr2 = Math.sin(r2);
  const cosr2 = Math.cos(r2);
  return [x * sinr2 - y * cosr2, x * cosr2 + y * sinr2];
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

/**
 * Bubble variation: compresses coordinates inward based on radius.
 * Formula: factor = 4/(r^2 + 4)
 */
export const bubble: VariationFunction = (x, y) => {
  const r2 = x * x + y * y;
  const factor = 4 / (r2 + 4);
  return [x * factor, y * factor];
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

/**
 * Diamond variation: angular twist with radial modulation.
 */
export const diamond: VariationFunction = (x, y) => {
  const r = Math.hypot(x, y);
  const theta = Math.atan2(y, x);
  return [Math.sin(theta) * r, Math.cos(theta) * r];
};

/**
 * EX variation: warping explosion effect, breaks radial symmetry.
 */
export const ex: VariationFunction = (x, y) => {
  const r = Math.sqrt(x * x + y * y) + 1e-6;
  const theta = Math.atan2(y, x);
  const factor = Math.sin(theta + r);
  return [x * factor, y * factor];
};

export const waves: VariationFunction = (x, y) => [
  x + 0.5 * Math.sin(y / (y * y + 1)),
  y + 0.5 * Math.sin(x / (x * x + 1)),
];

export const fisheye: VariationFunction = (x, y) => {
  const r = 2 / (Math.hypot(x, y) + 1e-6);
  return [r * y, r * x];
};

export const popcorn: VariationFunction = (x, y) => [
  x + 0.05 * Math.sin(3 * y),
  y + 0.05 * Math.sin(3 * x),
];

/**
 * Eyefish variation: lens-like effect, similar to bubble with vertical pinch.
 */
export const eyefish: VariationFunction = (x, y) => {
  const r2 = x * x + y * y + 1e-6;
  return [(2 * x) / (r2 + 1), y / (r2 + 1)];
};

// --- Exotic Variations ---

/**
 * Blur variation: introduces chaos/randomness in a soft circular pattern.
 */
export const blur: VariationFunction = (x, y) => {
  void x;
  void y;
  const theta = Math.random() * 2 * Math.PI;
  const r = Math.random();
  return [r * Math.cos(theta), r * Math.sin(theta)];
};

/**
 * Hyperbolic variation: nests radial arcs with angular twist.
 */
export const hyperbolic: VariationFunction = (x, y) => {
  const r = Math.sqrt(x * x + y * y);
  const theta = Math.atan2(y, x);
  return [Math.sin(theta) / r, Math.cos(theta) * r];
};

/**
 * MirrorX variation: reflects point across the vertical axis.
 */
export const mirrorx: VariationFunction = (x, y) => [Math.abs(x), y];

/**
 * MirrorY variation: reflects point across the horizontal axis.
 */
export const mirrory: VariationFunction = (x, y) => [x, Math.abs(y)];

/**
 * Noise variation: adds subtle randomness to coordinates.
 */
export const noise: VariationFunction = (x, y) => [
  x + (Math.random() - 0.5) * 0.01,
  y + (Math.random() - 0.5) * 0.01,
];

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

export const curl: VariationFunction = (x, y, params = {}) => {
  const a = params.a ?? 0.5;
  const b = params.b ?? 0.5;
  const r2 = x * x + y * y;
  const sx = x * Math.sin(r2) - y * Math.cos(r2);
  const sy = x * Math.cos(r2) + y * Math.sin(r2);
  return [x + a * sx, y + b * sy];
};

export const pdj: VariationFunction = (x, y, params = {}) => {
  const a = params.a ?? 1.0;
  const b = params.b ?? 0.5;
  const c = params.c ?? 0.5;
  const d = params.d ?? 1.0;
  return [Math.sin(a * y) - Math.cos(b * x), Math.sin(c * x) - Math.cos(d * y)];
};

export const juliaN: VariationFunction = (x, y, params = {}) => {
  const n = params.n ?? 4;
  const power = params.power ?? 1;
  const theta = Math.atan2(y, x);
  const r = Math.hypot(x, y) ** power;
  const angle = theta * n;
  return [r * Math.cos(angle), r * Math.sin(angle)];
};

export const fan2: VariationFunction = (x, y, params = {}) => {
  const freq = params.freq ?? 3.0;
  const spread = params.spread ?? 0.5;
  const theta = Math.atan2(y, x);
  const r = Math.hypot(x, y);
  const t = theta + spread * Math.sin(freq * theta);
  return [r * Math.cos(t), r * Math.sin(t)];
};

export const popcorn2: VariationFunction = (x, y, params = {}) => {
  const c = params.c ?? 0.3;
  const f = params.f ?? 3.0;
  return [x + c * Math.sin(Math.tan(f * y)), y + f * Math.sin(Math.tan(c * x))];
};

// --- Fractal Warp Variations ---

/**
 * Mandelbrot warp: escape-time fractal warp using Mandelbrot iteration.
 * zₙ₊₁ = zₙ² + c, where z₀ = (x, y) and c = (x, y).
 * Parameters:
 *   - iterations: max iterations (default 15)
 *   - escapeRadius: bail-out radius (default 2)
 */
export const mandelbrotWarp: VariationFunction = (x, y, params = {}) => {
  const iterations = params.iterations ?? 15;
  const escapeRadius = params.escapeRadius ?? 2;
  // Prevent overflow by clamping initial point and stopping on non-finite
  let zx = Number.isFinite(x) ? x : 0;
  let zy = Number.isFinite(y) ? y : 0;
  const cx = zx;
  const cy = zy;
  for (let i = 0; i < iterations; i++) {
    const x2 = zx * zx - zy * zy + cx;
    const y2 = 2 * zx * zy + cy;
    zx = x2;
    zy = y2;
    if (
      !Number.isFinite(zx) ||
      !Number.isFinite(zy) ||
      zx * zx + zy * zy > escapeRadius * escapeRadius
    )
      break;
  }
  return [zx, zy];
};

/**
 * Julia warp: escape-time fractal warp using Julia set iteration.
 * zₙ₊₁ = zₙ² + c, where z₀ = (x, y) and c = (cx, cy).
 * Parameters:
 *   - cx, cy: constant c components (default -0.4, 0.6)
 *   - iterations: max iterations (default 15)
 *   - escapeRadius: bail-out radius (default 2)
 */
export const juliaWarp: VariationFunction = (x, y, params = {}) => {
  const iterations = params.iterations ?? 15;
  const escapeRadius = params.escapeRadius ?? 2;
  const cx = params.cx ?? -0.4;
  const cy = params.cy ?? 0.6;
  // Prevent starting with huge or non-finite values to limit overflow
  let zx = Number.isFinite(x) ? x : 0;
  let zy = Number.isFinite(y) ? y : 0;
  for (let i = 0; i < iterations; i++) {
    const x2 = zx * zx - zy * zy + cx;
    const y2 = 2 * zx * zy + cy;
    zx = x2;
    zy = y2;
    // stop on overflow or escape
    if (
      !Number.isFinite(zx) ||
      !Number.isFinite(zy) ||
      zx * zx + zy * zy > escapeRadius * escapeRadius
    ) {
      break;
    }
  }
  return [zx, zy];
};

/**
 * Burning ship warp: escape-time fractal warp using burning ship iteration.
 * zₙ₊₁ = (|Re(zₙ)| + i·|Im(zₙ)|)² + c, where z₀ = (x, y) and c = (x, y).
 * Parameters:
 *   - iterations: max iterations (default 15)
 *   - escapeRadius: bail-out radius (default 2)
 */
export const burningShipWarp: VariationFunction = (x, y, params = {}) => {
  const iterations = params.iterations ?? 15;
  const escapeRadius = params.escapeRadius ?? 2;
  // Prevent overflow by clamping initial point and stopping on non-finite
  let zx = Number.isFinite(x) ? x : 0;
  let zy = Number.isFinite(y) ? y : 0;
  const cx = zx;
  const cy = zy;
  for (let i = 0; i < iterations; i++) {
    const absX = Math.abs(zx);
    const absY = Math.abs(zy);
    const x2 = absX * absX - absY * absY + cx;
    const y2 = 2 * absX * absY + cy;
    zx = x2;
    zy = y2;
    if (
      !Number.isFinite(zx) ||
      !Number.isFinite(zy) ||
      zx * zx + zy * zy > escapeRadius * escapeRadius
    )
      break;
  }
  return [zx, zy];
};

// --- Registry ---

/** Wrap a variation function to guard against NaN or infinite outputs. */
function safeVariation(fn: VariationFunction, name: string): VariationFunction {
  return (x, y, params) => {
    try {
      const [vx, vy] = fn(x, y, params);
      if (!Number.isFinite(vx) || !Number.isFinite(vy)) {
        console.warn(`variation '${name}' returned invalid coords`, {
          vx,
          vy,
          x,
          y,
          params,
        });
        return [0, 0];
      }
      return [vx, vy];
    } catch (err) {
      console.error(`variation '${name}' threw error`, err);
      return [0, 0];
    }
  };
}

const rawVariations: Record<string, VariationFunction> = {
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
  curl,
  pdj,
  juliaN,
  fan2,
  popcorn2,
  mandelbrotWarp,
  juliaWarp,
  burningShipWarp,
  blur,
  hyperbolic,
  mirrorx,
  mirrory,
  noise,
};

/** Variations registry with safety wrapping. */
export const variations: Record<string, VariationFunction> = {};
for (const [name, fn] of Object.entries(rawVariations)) {
  variations[name] = safeVariation(fn, name);
}

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
