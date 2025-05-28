/**
 * Maps a normalized value [0,1] to an RGB color using a rainbow HSV palette.
 * @param t - normalized position on the palette [0,1]
 * @returns [r, g, b] with each component in [0,1]
 */
export function palette(t: number): [number, number, number] {
  const h = ((t % 1) + 1) % 1;
  const s = 1;
  const v = 1;
  const sector = h * 6;
  const i = Math.floor(sector);
  const f = sector - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const T = v * (1 - (1 - f) * s);
  let r: number, g: number, b: number;
  switch (i % 6) {
    case 0:
      r = v;
      g = T;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = T;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = T;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
    default:
      r = 0;
      g = 0;
      b = 0;
  }
  return [r, g, b];
}

/**
 * Parse a hex color string (#rrggbb or #rgb) into normalized [r, g, b].
 * @param hex - color string in "#RRGGBB" or "#RGB" format
 * @returns [r, g, b] with each component in [0,1]
 */
function parseHexColor(hex: string): [number, number, number] {
  const h = hex.startsWith('#') ? hex.slice(1) : hex;
  const len = h.length;
  let r: number, g: number, b: number;
  if (len === 3) {
    r = parseInt(h[0] + h[0], 16);
    g = parseInt(h[1] + h[1], 16);
    b = parseInt(h[2] + h[2], 16);
  } else if (len === 6) {
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
 * @param colors - array of hex color strings (e.g., ["#ff0000", "#00ff00", "#0000ff"])
 * @returns function mapping t in [0,1] to interpolated RGB [r, g, b]
 */
export function createPaletteFromArray(
  colors: string[]
): (t: number) => [number, number, number] {
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
