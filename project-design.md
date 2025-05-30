**Flamelet MVP Design Document**

---

### 📌 Project Overview

**Flamelet** is a lightweight, browser-based fractal flame renderer built with TypeScript and modern frontend tooling. It supports dynamic, decorative visualizations for creative applications, interactive art, or VJ tooling. It uses Iterated Function Systems (IFS) with affine transformations and nonlinear variation functions to render complex, colorful flame patterns.

This MVP aims to produce static color flame renders with JSON-based preset support, palette-driven coloring, and log-density brightness normalization, using a 2D canvas.

---

### 🔧 Core Technologies

- **Language:** TypeScript
- **Bundler & Dev Server:** Vite
- **Package Manager:** Yarn (or npm)
- **Version Control:** Git
- **Linting:** ESLint
- **Code Formatting:** Prettier
- **Hot Reloading:** Vite’s built-in hot module replacement (HMR)

---

### 🧱 MVP Feature Set

#### 1. **Fractal Flame Presets**

A flame preset JSON file defines the parameters for rendering a fractal flame. It must conform to the following schema:

```ts
interface FlamePreset {
  width: number;
  height: number;
  supersample?: number;
  iterations?: number;
  burnIn?: number;
  gamma?: number;
  palette?: string[];
  coloring?: { mode?: string; distanceScale?: number };
  /** Internal cache of fractal-space bounds for domain-scaling transforms (minX, minY, maxX, maxY). */
  domainBounds?: { minX: number; minY: number; maxX: number; maxY: number; };

  /** Optional affine transform applied to fractal-space coordinates before pixel mapping (rotation in radians, scale, translateX, translateY) */
  finalTransform?: {
    rotation?: number;
    scale?: number;
    translateX?: number;
    translateY?: number;
  };
  functions: FlameFunction[];
}

interface FlameFunction {
  affine: [number, number, number, number, number, number];
  variations: Record<string, number>;
  parameters?: Record<string, Record<string, number>>;
  probability: number;
  color?: number;
}
```

See `src/types.ts` for the full TypeScript definitions.

#### 2. **FlameFunction Format**

A `FlameFunction` is an element of the `functions` array in a preset, describing one step of the iterated function system. Each function includes:

| Field         | Description                                                                   |
| ------------- | ----------------------------------------------------------------------------- |
| `affine`      | 6-number array `[a, b, c, d, e, f]` for affine transform                      |
| `variations`  | Map of variation names (from `src/variations.ts`) to weights                  |
| `parameters`  | Optional per-variation numeric parameters                                     |
| `probability` | Selection weight for randomly choosing this function in the IFS sampling loop |
| `color`       | Optional normalized palette index (0.0–1.0) for color mapping                 |

#### 3. **Variation Functions**

All supported variation functions are exported from `src/variations.ts` and registered under their function name. The complete list is:

- `linear`, `swirl`, `horseshoe`, `sinusoidal`, `spherical`, `bubble`, `polar`, `handkerchief`, `heart`, `disc`, `rings`, `rings2`, `fan`, `spiral`, `diamond`, `ex`, `waves`, `fisheye`, `popcorn`, `eyefish`, `blade`, `bent`, `cross`, `cosine`, `curl`, `pdj`, `juliaN`, `fan2`, `popcorn2`, `blur`, `hyperbolic`, `mirrorx`, `mirrory`, `noise`, `mandelbrotWarp`, `juliaWarp`, `burningShipWarp`

Each variation is a function `(x, y, params?) => [x', y']`, where `params` is an optional numeric parameter map for parameterized variations (e.g. `curl`, `pdj`, `juliaN`, `fan2`, `popcorn2`).

#### 4. **Affine Transformations**

- Apply 2D affine transform to input point
- Combine with variation results based on weights
- Optionally apply a final affine transform (rotation, scale, translation) to each sample before coloring

#### 5. **Renderer**

- Performs initial burn-in iterations to reach the fractal attractor
- Runs IFS sampling loop
- Maintains 2D histogram of point hits
- Applies log-density normalization
- Renders to `<canvas>` using palette-based color shading with gamma correction

##### **Modular Coloring Strategy Architecture**

To enable flexible, pluggable coloring approaches, the renderer delegates all color accumulation and output logic to a modular strategy. Strategies manage their own state and buffers, and the renderer invokes them uniformly without branching on specific modes.

📦 **Strategy Interface (Pseudocode)**

```text
class ColoringStrategy {
  method accumulate(sample):
    # sample includes x, y, function index, and orbit step

  method finalize(outputBuffer):
    # Write final RGBA values into the output buffer
}

class StrategyFactory {
  method create(options) -> ColoringStrategy:
    # Options include canvas size, palette, gamma, function colors, etc.
}

// Registry for dynamic strategy lookup:
registerStrategy(name, factory)
getStrategyFactory(name) -> factory
```

🔁 **Render Loop (Pseudocode)**

````text
strategyFactory = getStrategyFactory(preset.coloring.mode or 'histogram')
strategy = strategyFactory.create(options)

for orbit in orbits:
  for sample in orbit:
    strategy.accumulate(sample)

strategy.finalize(outputBuffer)
drawToCanvas(outputBuffer)

##### **Palette Utilities (Pseudocode)**


```text
createPaletteFromArray(colors: string[]): (t: number) => [r, g, b]
registerPalette(name: string, fn: (t: number) => [r, g, b])
getPalette(nameOrArray?: string | string[]): (t: number) => [r, g, b]
````

##### **Final Transform (Domain-Scaling) Pseudocode**

```text
// First, sample the fractal to compute original fractal-space bounds:
origMinX = +∞; origMinY = +∞; origMaxX = -∞; origMaxY = -∞;
let x0, y0 = initial burn-in state;
for i from 1 to iterations:
  [x0, y0] = applyFlameFunction(fn_i, x0, y0)
  origMinX = min(origMinX, x0)
  origMinY = min(origMinY, y0)
  origMaxX = max(origMaxX, x0)
  origMaxY = max(origMaxY, y0)

// Then accumulate samples with transform baked in:
for i from 1 to iterations:
  [x0, y0] = applyFlameFunction(fn_i, x0, y0)
  // center about original bounds
  cx = (origMinX + origMaxX) / 2
  cy = (origMinY + origMaxY) / 2
  dx = x0 - cx
  dy = y0 - cy
  scaledX = dx * (transform.scale or 1)
  scaledY = dy * (transform.scale or 1)
  rx = scaledX * cos(transform.rotation or 0) - scaledY * sin(transform.rotation or 0)
  ry = scaledX * sin(transform.rotation or 0) + scaledY * cos(transform.rotation or 0)
  // apply translation in pixel units, converted to fractal-space:
  fx = rx + cx + (transform.translateX or 0) * (origMaxX - origMinX) / width
  fy = ry + cy + (transform.translateY or 0) * (origMaxY - origMinY) / height
  accumulateSample(fx, fy)
```

##### **Angular Momentum Strategy (Pseudocode)**

```text
getT(orbit):
  let total = 0
  for i from 1 to orbit.xs.length - 1:
    dx = orbit.xs[i] - orbit.xs[i-1]
    dy = orbit.ys[i] - orbit.ys[i-1]
    total += dx * orbit.ys[i] - dy * orbit.xs[i]
  # auto-detect scale if omitted: maximum |total| across all orbits
  scale = options.momentumScale ?? max(abs(total) for each orbit in orbitTotals)
  t = clamp(abs(total) / scale, 0, 1)
  return t
```

#### Strategy Factories and Structure

The strategies are now implemented in a modular, layered structure:

```
/src/strategies
  /base
    context.ts          Shared accumulation, downsampling, gamma correction
    palette.ts          Palette utilities and registry (createPaletteFromArray, registerPalette, getPalette)
    orbit.ts            Orbit data structs
    factories.ts        sampleFactory, orbitFactory, pseudoOrbitFactory, histogramFactory
  /impl
    histogram.ts        Density-based (histogram) strategy
    orbit-angle.ts      Angle-based orbit strategy
    orbit-distance.ts   Distance-based orbit strategy
    angular-momentum.ts Angular-momentum proxy strategy
  index.ts             Central registration of all strategies
```

```

#### 6. **Preset Loader**

- Imports JSON flame preset from `presets/`
- Applies the preset at runtime to render output

#### 7. **Output**

- Displays color flame in canvas
- Supports dynamic, interactive, and future extensions

---

### 🧪 Development Best Practices

- Use strict typing throughout
- Run `yarn lint` and `yarn format` before each commit
- Ignore generated files (`node_modules`, `dist`, etc.) in all relevant ignore files
- Use functional decomposition for clarity and testability

---

### 🔄 Future Extensions (Post-MVP)

- Flame coloring using palette interpolation
- JSON-loadable palettes: define and load palette arrays of hex color strings in JSON presets
- UI controls to live-tweak flame parameters
- Export rendered images
- Dynamic/animated flame rendering
- WebGL support for speed
- HDR color buffer and tone mapping (float-based accumulation, Reinhard/log/exposure strategies)
- Supersampling with downscale for smoother, high-detail output
- Flamelet VJ mode for real-time visuals
```
