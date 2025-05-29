/**
 * Palette utilities and registry: default rainbow palette,
 * palette creation from hex arrays, and named palette registry.
 */

type Color = [number, number, number];

const defaultPalette = (t: number): Color => {
  const h = ((t % 1) + 1) % 1;
  const s = 1;
  const v = 1;
  const sector = h * 6;
  const i = Math.floor(sector);
  const f = sector - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const T = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0:
      return [v, T, p];
    case 1:
      return [q, v, p];
    case 2:
      return [p, v, T];
    case 3:
      return [p, q, v];
    case 4:
      return [T, p, v];
    case 5:
      return [v, p, q];
    default:
      return [0, 0, 0];
  }
};

function parseHexColor(hex: string): Color {
  const h = hex.startsWith('#') ? hex.slice(1) : hex;
  let r: number, g: number, b: number;
  if (h.length === 3) {
    r = parseInt(h[0] + h[0], 16);
    g = parseInt(h[1] + h[1], 16);
    b = parseInt(h[2] + h[2], 16);
  } else if (h.length === 6) {
    r = parseInt(h.slice(0, 2), 16);
    g = parseInt(h.slice(2, 4), 16);
    b = parseInt(h.slice(4, 6), 16);
  } else {
    throw new Error(`Invalid hex color: "${hex}"`);
  }
  return [r / 255, g / 255, b / 255];
}

/**
 * Creates a palette function from an array of hex color strings.
 * @param colors Array of hex color strings, e.g. ["#ff0000", "#00ff00", "#0000ff"]
 */
export function createPaletteFromArray(colors: string[]): (t: number) => Color {
  const rgbColors = colors.map(parseHexColor);
  const n = rgbColors.length;
  return (t: number) => {
    const clamped = Math.min(Math.max(t, 0), 1);
    if (n === 0) {
      return [0, 0, 0];
    }
    if (n === 1) {
      return rgbColors[0];
    }
    const pos = clamped * (n - 1);
    const i = Math.floor(pos);
    const f = pos - i;
    const c1 = rgbColors[i];
    const c2 = rgbColors[Math.min(i + 1, n - 1)];
    return [
      c1[0] * (1 - f) + c2[0] * f,
      c1[1] * (1 - f) + c2[1] * f,
      c1[2] * (1 - f) + c2[2] * f,
    ];
  };
}

type PaletteFn = (t: number) => Color;

/**
 * Registry for named palettes.
 */
const registry = new Map<string, PaletteFn>();
registry.set('rainbow', defaultPalette);

/**
 * Register a named palette function.
 * @param name Name of the palette.
 * @param fn Function mapping t in [0,1] to RGB color.
 */
export function registerPalette(name: string, fn: PaletteFn): void {
  registry.set(name, fn);
}

/**
 * Retrieve a palette function by name or array of hex strings.
 * @param nameOrArray Name of registered palette or array of hex colors.
 */
export function getPalette(nameOrArray?: string | string[]): PaletteFn {
  if (typeof nameOrArray === 'string') {
    const fn = registry.get(nameOrArray);
    if (!fn) {
      throw new Error(`Unknown palette: ${nameOrArray}`);
    }
    return fn;
  } else if (Array.isArray(nameOrArray) && nameOrArray.length > 0) {
    return createPaletteFromArray(nameOrArray);
  }
  return defaultPalette;
}
