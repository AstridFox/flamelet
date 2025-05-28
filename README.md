# Flamelet

> A lightweight, browser-based fractal flame renderer built with TypeScript, Vite, and Canvas.

---


## 📚 Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [Roadmap](#roadmap)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## ✨ Features

- 🌈 **Colorful Fractal Flames** – Implements iterated function systems with palette-driven coloring.
- ⚡ **High Performance** – Leverages log-density normalization and optimized sampling in TypeScript.
- 🔧 **JSON Presets** – Define and load flame configurations via easy-to-edit JSON files.
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

| Field        | Description                                    |
| ------------ | ---------------------------------------------- |
| `width`      | Canvas width in pixels                         |
| `height`     | Canvas height in pixels                        |
| `iterations` | Number of sampling iterations                  |
| `burnIn`     | Initial iterations to skip before sampling     |
| `gamma`      | Gamma correction factor                        |
| `palette`    | Array of hex color strings for palette shading |
| `functions`  | Array of affine/variation function definitions |

See [project-design.md](project-design.md) for full details on the preset format.

---

## 🗈️ Screenshots

| Preview                                    | Render Output                |
| ------------------------------------------ | ---------------------------- |
| ![App Preview](docs/img/app_preview.png)   | Flamelet UI in the browser   |
| ![Sample Flame](docs/img/sample_flame.png) | Example fractal flame render |

_(Add your own screenshots to `docs/img` or update the above paths.)_

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

- Based on the fractal flame algorithm by Scott Draves.
- Variations inspired by implementations in Apophysis, Flam3, and JWildfire.
