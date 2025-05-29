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
    let idx = Math.floor(pos);
    let f = pos - idx;
    if (idx < 0) {
      idx = 0;
      f = 0;
    } else if (idx >= n - 1) {
      idx = n - 1;
      f = 0;
    }
    const next = idx < n - 1 ? idx + 1 : idx;
    const c1 = rgbColors[idx];
    const c2 = rgbColors[next];
    if (!c1 || !c2) {
      // Fallback to first color if indices are out-of-bounds or undefined
      return rgbColors[0];
    }
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

export function getAllPaletteKeys(): string[] {
  return Array.from(registry.keys());
}

// Named palette definitions
const namedPalettes: Record<string, string[]> = {
  fire: [
    '#000000',
    '#220000',
    '#440000',
    '#660000',
    '#882200',
    '#aa2200',
    '#cc3300',
    '#ff4400',
    '#ff5500',
    '#ff6600',
    '#ff7700',
    '#ff8800',
    '#ffaa00',
    '#ffcc00',
    '#ffee00',
    '#ffff66',
    '#ffff99',
    '#ffffcc',
    '#ffffee',
    '#ffffff',
  ],
  ice: [
    '#000000',
    '#001122',
    '#002244',
    '#003366',
    '#004488',
    '#0055aa',
    '#0066cc',
    '#0077ee',
    '#0099ff',
    '#33bbff',
    '#66ccff',
    '#99ddff',
    '#bbeeff',
    '#ddf5ff',
    '#eeffff',
    '#ffffff',
    '#ccffff',
    '#99ffff',
    '#66ffff',
    '#33ffff',
  ],
  forest: [
    '#001f00',
    '#003300',
    '#004d00',
    '#006600',
    '#007f00',
    '#009900',
    '#00b300',
    '#00cc00',
    '#00e600',
    '#00ff00',
    '#33ff33',
    '#66ff66',
    '#99ff99',
    '#bbffbb',
    '#ddffdd',
    '#eeffee',
    '#f2fff2',
    '#ccffcc',
    '#aaffaa',
    '#88ff88',
  ],
  sunset: [
    '#33001a',
    '#4d0026',
    '#660033',
    '#800040',
    '#99004d',
    '#b30059',
    '#cc0066',
    '#e60073',
    '#ff0080',
    '#ff3399',
    '#ff66b2',
    '#ff99cc',
    '#ffcce5',
    '#ffe6f2',
    '#fff0f5',
    '#ffdddd',
    '#ffbbbb',
    '#ffaaaa',
    '#ffaaff',
    '#ffccff',
  ],
  ocean: [
    '#000033',
    '#000044',
    '#001155',
    '#002266',
    '#003377',
    '#004488',
    '#005599',
    '#0066aa',
    '#0077bb',
    '#0088cc',
    '#0099dd',
    '#00aaee',
    '#00bbff',
    '#33ccff',
    '#66ddff',
    '#99eeff',
    '#ccf7ff',
    '#e6fbff',
    '#f0fdff',
    '#ffffff',
  ],
  neon: [
    '#ff00ff',
    '#ff33ff',
    '#ff66ff',
    '#ff99ff',
    '#ffccff',
    '#cc00ff',
    '#9900ff',
    '#6600ff',
    '#3300ff',
    '#0000ff',
    '#00ffff',
    '#00ffcc',
    '#00ff99',
    '#00ff66',
    '#00ff33',
    '#00ff00',
    '#66ff00',
    '#ccff00',
    '#ffff00',
    '#ffcc00',
  ],
  grayscale: [
    '#000000',
    '#111111',
    '#222222',
    '#333333',
    '#444444',
    '#555555',
    '#666666',
    '#777777',
    '#888888',
    '#999999',
    '#aaaaaa',
    '#bbbbbb',
    '#cccccc',
    '#dddddd',
    '#eeeeee',
    '#f0f0f0',
    '#f5f5f5',
    '#fafafa',
    '#fefefe',
    '#ffffff',
  ],
  candy: [
    '#ff99cc',
    '#ffb3d9',
    '#ffccff',
    '#ffb3ff',
    '#e6ccff',
    '#ccccff',
    '#b3e6ff',
    '#99ffff',
    '#b3ffe6',
    '#ccffcc',
    '#e6ffb3',
    '#ffff99',
    '#ffe699',
    '#ffc299',
    '#ffa3a3',
    '#ff8cb3',
    '#ff9acc',
    '#ffbce6',
    '#ffdfff',
    '#ffffff',
  ],
  lava: [
    '#000000',
    '#1a0000',
    '#330000',
    '#4d0000',
    '#660000',
    '#800000',
    '#990000',
    '#b30000',
    '#cc0000',
    '#e60000',
    '#ff0000',
    '#ff3300',
    '#ff6600',
    '#ff9900',
    '#ffcc00',
    '#ffff00',
    '#ffff66',
    '#ffff99',
    '#fff2cc',
    '#ffffff',
  ],
  aurora: [
    '#001f33',
    '#00264d',
    '#003366',
    '#004080',
    '#004d99',
    '#005ab3',
    '#0066cc',
    '#0073e6',
    '#0080ff',
    '#3399ff',
    '#66b2ff',
    '#99ccff',
    '#cce5ff',
    '#ffffff',
    '#ccffe6',
    '#99ffcc',
    '#66ffb3',
    '#33ff99',
    '#00ff80',
    '#00ff66',
  ],

  // Pride flag palettes
  trans: ['#5BCEFA', '#F5A9B8', '#FFFFFF'],
  bi: ['#D60270', '#9B4F96', '#0038A8'],
  pan: ['#FF218C', '#FFD800', '#21B1FF'],

  rgb: ['#FF0000', '#00FF00', '#0000FF'],
};

// Register all named palettes
for (const [name, colors] of Object.entries(namedPalettes)) {
  registerPalette(name, createPaletteFromArray(colors));
}
