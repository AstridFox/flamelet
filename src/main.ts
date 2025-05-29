import './style.css';
import { renderFlame } from './renderer';
import type { FlamePreset } from './types';
import basicPreset from '../presets/orbit-distance.json';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) {
  throw new Error('Failed to find #app element');
}

app.innerHTML = '';
const canvas = document.createElement('canvas');
app.appendChild(canvas);

const preset = basicPreset as unknown as FlamePreset;
renderFlame(preset, canvas);
