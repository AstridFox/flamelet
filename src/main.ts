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
    const newVal = parseFloat(input.value) || 0;
    if (key === 'scale') {
      const oldScale = preset.finalTransform!.scale!;
      if (oldScale !== 0) {
        const ratio = newVal / oldScale;
        preset.finalTransform!.translateX! *= ratio;
        preset.finalTransform!.translateY! *= ratio;
        const txInput = controlsDiv.querySelector<HTMLInputElement>('input[data-key="translateX"]')!;
        const tyInput = controlsDiv.querySelector<HTMLInputElement>('input[data-key="translateY"]')!;
        txInput.value = String(preset.finalTransform!.translateX);
        tyInput.value = String(preset.finalTransform!.translateY);
      }
    }
    preset.finalTransform![key] = newVal;
    renderFlame(preset, canvas);
  });
  label.appendChild(input);
  // tag input for lookup during drag updates
  input.setAttribute('data-key', key as string);
  controlsDiv.appendChild(label);
}

addControl('rotation', 'Rotation (rad):', 0.01);
addControl('scale', 'Scale:', 0.1);
addControl('translateX', 'Translate X:', 0.1);
addControl('translateY', 'Translate Y:', 0.1);

app.appendChild(controlsDiv);

// Enable canvas drag to pan (translateX/translateY) with reduced iterations during drag, and show crosshair
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
// track original translate values and iteration count for drag operations
let origTranslateX = preset.finalTransform!.translateX ?? 0;
let origTranslateY = preset.finalTransform!.translateY ?? 0;
let normalIterations = preset.iterations ?? 0;
const DRAG_ITERATIONS = 20000;

function drawCrosshair() {
  const ctx = canvas.getContext('2d')!;
  ctx.save();
  ctx.strokeStyle = 'white';
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.moveTo(0, canvas.height / 2);
  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.stroke();
  ctx.restore();
}

canvas.addEventListener('mousedown', (ev) => {
  isDragging = true;
  dragStartX = ev.offsetX;
  dragStartY = ev.offsetY;
  origTranslateX = preset.finalTransform!.translateX ?? 0;
  origTranslateY = preset.finalTransform!.translateY ?? 0;
  normalIterations = preset.iterations ?? normalIterations;
  preset._origIterations = normalIterations;
  preset.iterations = Math.min(normalIterations, DRAG_ITERATIONS);
  renderFlame(preset, canvas);
  drawCrosshair();
});

canvas.addEventListener('mousemove', (ev) => {
  if (!isDragging) return;
  const dx = ev.offsetX - dragStartX;
  const dy = ev.offsetY - dragStartY;
  preset.finalTransform!.translateX = origTranslateX + dx;
  preset.finalTransform!.translateY = origTranslateY - dy;
  // update translate inputs
  const txInput = controlsDiv.querySelector<HTMLInputElement>('input[data-key="translateX"]')!;
  const tyInput = controlsDiv.querySelector<HTMLInputElement>('input[data-key="translateY"]')!;
  txInput.value = String(preset.finalTransform!.translateX);
  tyInput.value = String(preset.finalTransform!.translateY);
  renderFlame(preset, canvas);
  drawCrosshair();
});

canvas.addEventListener('mouseup', () => {
  if (!isDragging) return;
  isDragging = false;
  preset.iterations = normalIterations;
  delete preset._origIterations;
  renderFlame(preset, canvas);
});

canvas.addEventListener('mouseleave', () => {
  if (!isDragging) return;
  isDragging = false;
  preset.iterations = normalIterations;
  delete preset._origIterations;
  renderFlame(preset, canvas);
});
