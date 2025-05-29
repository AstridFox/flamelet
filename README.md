# Flamelet

> A lightweight, browser-based fractal flame renderer built with TypeScript, Vite, and Canvas.

---


## 📚 Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [Roadmap](#roadmap)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## ✨ Features

- 🌈 **Colorful Fractal Flames** – Palette-driven coloring with customizable gamma correction.
- 🔄 **Rich Variation Functions** – Includes a wide range of classic and exotic IFS variations (linear, swirl, horseshoe, sinusoidal, spherical, bubble, polar, handkerchief, heart, disc, rings, rings2, fan, spiral, diamond, ex, waves, fisheye, popcorn, eyefish, blade, bent, cross, cosine, curl, pdj, juliaN, fan2, popcorn2, blur, hyperbolic, mirrorx, mirrory, noise) for stunning visual complexity.
- 🔥 **Burn-In & Density Control** – Optional initial skip to reach the attractor, plus log-density normalization for smooth gradients.
- ⚡ **High Performance** – Optimized in TypeScript with efficient sampling, runs entirely in the browser canvas.
- 🔧 **JSON Presets** – Define, share, and reuse flame configurations via easy-to-edit JSON files.
- 🌐 **Browser-Based** – No dependencies other than a modern web browser.

---

## 🔧 Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (>=14)
- [Yarn](https://yarnpkg.com/) (optional, or use npm)
- [Git](https://git-scm.com/)

### Clone and Install

```bash
git clone https://github.com/AstridFox/flamelet.git
cd flamelet
yarn install       # or: npm install
```

---

## 🚀 Usage

Start the development server:

```bash
yarn dev           # or: npm run dev
```

Open <http://localhost:5173> in your browser to view the flame render.

For a production build:

```bash
yarn build         # or: npm run build
yarn preview       # or: npm run preview
```

---

## ⚙️ Configuration

Flame presets are defined as JSON files in the `presets/` directory. See `presets/basic.json` for an example.

Key configuration fields:

| Field         | Description                                           |
| ------------- | ----------------------------------------------------- |
| `width`       | Canvas width in pixels                                |
| `height`      | Canvas height in pixels                               |
| `supersample` | Optional supersampling factor (antialiasing)          |
| `iterations`  | Number of sampling iterations                         |
| `burnIn`      | Initial iterations to skip before sampling            |
| `gamma`       | Gamma correction factor                               |
| `palette`     | Array of hex color strings for palette shading        |
| `functions`   | Array of FlameFunction objects (see structure below)  |

Key FlameFunction fields:

| Field        | Description                                                                 |
| ------------ | --------------------------------------------------------------------------- |
| `affine`     | 6-number array `[a, b, c, d, e, f]` for affine transform                    |
| `variations` | Map of variation names to weights                                           |
| `parameters` | Optional per-variation numeric parameters                                   |
| `probability`| Selection weight for randomly choosing this function in the IFS sampling loop |
| `color`      | Optional normalized palette index (0.0–1.0) for color mapping                |

See [project-design.md](project-design.md) for full details on the preset format.

---


## 🛠️ Contributing

Contributions are welcome! Please open issues and submit pull requests on GitHub.

Before submitting:

- Fork the repo and create a feature branch.
- Run `yarn lint` and `yarn format` (or `npm run lint` / `npm run format`) to meet code style.
- Ensure TypeScript types and existing tests (if any) pass.

---

## 🛣️ Roadmap

- ✅ MVP: Static color fractal flame rendering with JSON presets
- ✅ Classic and exotic IFS variation functions (full list in project-design.md)
- 🔲 Interactive preset selection UI
- 🔲 Export images (PNG, SVG)
- 🔲 Live parameter tweaking UI
- 🔲 WebGL accelerator & multi-threading

Have ideas or requests? [Open an issue!](https://github.com/AstridFox/flamelet/issues)

---

## 📜 License

This project is licensed under the GNU Lesser General Public License v3.0.
See the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Designed and maintained by Astrid Fox ([@AstridFox](https://github.com/AstridFox)).
- Based on the fractal flame algorithm by Scott Draves.
- Variations inspired by implementations in Apophysis, Flam3, and JWildfire.
- Special thanks to Nikki Fox, without whom I would be lost.
