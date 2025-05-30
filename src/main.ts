import './style.css';
import { renderFlame } from './renderer';
import { randomFlamePreset } from './random-flame';
import { FlamePreset } from './types';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) {
  throw new Error('Failed to find #app element');
}

app.innerHTML = '';
const canvas = document.createElement('canvas');
app.appendChild(canvas);

const preset = randomFlamePreset(800, 600);
preset.finalTransform = preset.finalTransform ?? {
  rotation: 0,
  scale: 1,
  translateX: 0,
  translateY: 0,
};
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

// Create UI controls for adjusting finalTransform parameters
const controlsDiv = document.createElement('div');
controlsDiv.id = 'controls';

// Control to adjust number of iterations for sampling
const iterLabel = document.createElement('label');
iterLabel.textContent = 'Iterations: ';
const iterInput = document.createElement('input');
iterInput.type = 'number';
iterInput.min = '0';
iterInput.step = '10000';
iterInput.value = String(preset.iterations);
iterInput.addEventListener('input', () => {
  preset.iterations = parseInt(iterInput.value, 10) || 0;
  renderFlame(preset, canvas);
});
iterLabel.appendChild(iterInput);
controlsDiv.appendChild(iterLabel);

function addControl<K extends keyof NonNullable<FlamePreset['finalTransform']>>(
  key: K,
  labelText: string,
  step = 0.01
) {
  const label = document.createElement('label');
  label.textContent = `${labelText} `;
  const input = document.createElement('input');
  input.type = 'number';
  input.step = step.toString();
  input.value = String(preset.finalTransform![key]);
  input.addEventListener('input', () => {
    preset.finalTransform![key] = parseFloat(input.value) || 0;
    renderFlame(preset, canvas);
  });
  label.appendChild(input);
  controlsDiv.appendChild(label);
}

addControl('rotation', 'Rotation (rad):', 0.01);
addControl('scale', 'Scale:', 0.1);
addControl('translateX', 'Translate X:', 0.1);
addControl('translateY', 'Translate Y:', 0.1);

app.appendChild(controlsDiv);
