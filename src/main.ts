import './style.css';
import { renderFlame } from './renderer';
import { randomFlamePreset } from './random-flame';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) {
  throw new Error('Failed to find #app element');
}

app.innerHTML = '';
const canvas = document.createElement('canvas');
app.appendChild(canvas);

const preset = randomFlamePreset(800, 600);
renderFlame(preset, canvas);

// Provide a button to export the generated flame preset as JSON
const downloadBtn = document.createElement('button');
downloadBtn.textContent = 'Download Preset JSON';
downloadBtn.addEventListener('click', () => {
  const json = JSON.stringify(preset, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'flame-preset.json';
  link.click();
  URL.revokeObjectURL(url);
});
app.appendChild(downloadBtn);
