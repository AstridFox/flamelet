**Flamelet MVP Design Document**

---

### 📌 Project Overview

**Flamelet** is a lightweight, browser-based fractal flame renderer built with TypeScript and modern frontend tooling. It supports dynamic, decorative visualizations for creative applications, interactive art, or VJ tooling. It uses Iterated Function Systems (IFS) with affine transformations and nonlinear variation functions to render complex, colorful flame patterns.

This MVP aims to produce static grayscale flame renders with JSON-based preset support and log-density brightness normalization, using a 2D canvas.

---

### 🔧 Core Technologies

- **Language:** TypeScript
- **Bundler & Dev Server:** Vite
- **Package Manager:** Yarn
- **Version Control:** Git
- **Linting:** ESLint
- **Code Formatting:** Prettier
- **Hot Reloading:** Vite’s built-in hot module replacement (HMR)

---

### 🧱 MVP Feature Set

#### 1. **Fractal Flame Presets**

- JSON-serializable format
- Preset contains canvas size, number of iterations, gamma, and list of FlameFunctions

#### 2. **FlameFunction Format**

Each function includes:

- `affine`: 6-number array for 2D linear transform
- `variations`: map of variation names to weights
- `color`: optional value \[0–1] for future extension
- `probability`: selection weight

#### 3. **Variation Functions**

Implemented variations include:

- `linear`
- `swirl`
- `horseshoe`
- `sinusoidal`
  Each variation is a function `(x, y) => [x', y']`

#### 4. **Affine Transformations**

- Apply 2D affine transform to input point
- Combine with variation results based on weights

#### 5. **Renderer**

- Runs IFS sampling loop
- Maintains 2D histogram of point hits
- Applies log-density normalization
- Renders to `<canvas>` using grayscale shading
- Gamma correction for brightness smoothing

#### 6. **Preset Loader**

- Imports JSON flame preset from `presets/`
- Applies the preset at runtime to render output

#### 7. **Output**

- Displays grayscale flame in canvas
- Designed for future color + dynamic extensions

---

### 🛠 File Layout (MVP)

```
flamelet/
├── index.html
├── src/
│   ├── main.ts
│   ├── types.ts
│   ├── variations.ts
│   ├── flame.ts
│   └── renderer.ts
├── presets/
│   └── basic.json
├── .gitignore
├── .eslintrc
├── .eslintignore
├── .prettierrc
├── .prettierignore
├── README.md
└── tsconfig.json
```

---

### 🧪 Development Best Practices

- Use strict typing throughout
- Run `yarn lint` and `yarn prettier` before each commit
- Ignore generated files (`node_modules`, `dist`, etc.) in all relevant ignore files
- Use functional decomposition for clarity and testability

---

### 🔄 Future Extensions (Post-MVP)

- Flame coloring using palette interpolation
- UI controls to live-tweak flame parameters
- Export rendered images
- Dynamic/animated flame rendering
- WebGL support for speed
- Flamelet VJ mode for real-time visuals

---

This design doc serves as a blueprint for implementing the MVP described in the prompt sequence. Each prompt builds incrementally toward this complete system.

Let me know if you want this version pushed to the README too, or want to add roadmap tags like `[0.1.0]`! 🌟
