import { FlamePreset } from './types';
import { applyFlameFunction } from './flame';
import './strategies';
import { getStrategyFactory } from './strategies';

/**
 * Render a fractal flame onto a 2D canvas using HDR color accumulation,
 * tone mapping, gamma correction, and optional supersampling.
 */

export function renderFlame(
  preset: FlamePreset,
  canvas: HTMLCanvasElement
): void {
  const {
    width,
    height,
    supersample = 1,
    functions,
    iterations = 100000,
    burnIn = 20,
    gamma = 1,
    palette: paletteDef,
    finalTransform,
    domainBounds,
  } = preset;
  const rot = finalTransform?.rotation ?? 0;
  const scl = finalTransform?.scale ?? 1;
  const trX = finalTransform?.translateX ?? 0;
  const trY = finalTransform?.translateY ?? 0;
  const hasFinalTransform = rot !== 0 || scl !== 1 || trX !== 0 || trY !== 0;
  let origMinX: number, origMinY: number, origMaxX: number, origMaxY: number;
  origMinX = Infinity;
  origMinY = Infinity;
  origMaxX = -Infinity;
  origMaxY = -Infinity;
  const cosF = Math.cos(rot);
  const sinF = Math.sin(rot);
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('2D rendering context not available');
  }

  const cumProbs: number[] = [];
  let totalProb = 0;
  for (const fn of functions) {
    totalProb += fn.probability;
    cumProbs.push(totalProb);
  }

  const strategyFactory = getStrategyFactory(
    preset.coloring?.mode ?? 'histogram'
  );
  const strategy = strategyFactory.create({
    width,
    height,
    supersample,
    functions,
    paletteDef,
    gamma,
    distanceScale: preset.coloring?.distanceScale,
    orbitLength: preset.coloring?.orbitLength,
    momentumScale: preset.coloring?.momentumScale,
  });

  let x = Math.random() * 2 - 1;
  let y = Math.random() * 2 - 1;
  for (let i = 0; i < burnIn; i++) {
    const r = Math.random() * totalProb;
    const fnIdx = cumProbs.findIndex((p) => r < p);
    const index = fnIdx >= 0 ? fnIdx : functions.length - 1;
    const fn = functions[index];
    [x, y] = applyFlameFunction(fn, x, y);
  }
  if (hasFinalTransform) {
    if (domainBounds) {
      origMinX = domainBounds.minX;
      origMinY = domainBounds.minY;
      origMaxX = domainBounds.maxX;
      origMaxY = domainBounds.maxY;
      if ((strategy as any).setDomainBounds) {
        (strategy as any).setDomainBounds(origMinX, origMinY, origMaxX, origMaxY);
      }
    } else {
      let tx = x, ty = y;
      const dryRunIterations = preset._origIterations ?? iterations;
      for (let i = 0; i < dryRunIterations; i++) {
        const r = Math.random() * totalProb;
        const fnIdx = cumProbs.findIndex((p) => r < p);
        const idx = fnIdx >= 0 ? fnIdx : functions.length - 1;
        const fn = functions[idx];
        [tx, ty] = applyFlameFunction(fn, tx, ty);
        if (tx < origMinX) origMinX = tx;
        if (tx > origMaxX) origMaxX = tx;
        if (ty < origMinY) origMinY = ty;
        if (ty > origMaxY) origMaxY = ty;
      }
      preset.domainBounds = { minX: origMinX, minY: origMinY, maxX: origMaxX, maxY: origMaxY };
      if ((strategy as any).setDomainBounds) {
        (strategy as any).setDomainBounds(origMinX, origMinY, origMaxX, origMaxY);
      }
    }
  }
  for (let i = 0; i < iterations; i++) {
    const r = Math.random() * totalProb;
    const fnIdx = cumProbs.findIndex((p) => r < p);
    const index = fnIdx >= 0 ? fnIdx : functions.length - 1;
    const fn = functions[index];
    [x, y] = applyFlameFunction(fn, x, y);
    if (hasFinalTransform) {
      const cxF = (origMinX + origMaxX) / 2;
      const cyF = (origMinY + origMaxY) / 2;
      const dxF = x - cxF;
      const dyF = y - cyF;
      const sxF = dxF * scl;
      const syF = dyF * scl;
      const rxF = sxF * cosF - syF * sinF;
      const ryF = sxF * sinF + syF * cosF;
      const fx = rxF + cxF + trX * (origMaxX - origMinX) / width;
      const fy = ryF + cyF + trY * (origMaxY - origMinY) / height;
      strategy.accumulate({ x: fx, y: fy, funcIndex: index });
    } else {
      strategy.accumulate({ x, y, funcIndex: index });
    }
  }

  const imageData = ctx.createImageData(width, height);
  strategy.finalize(imageData.data);

  ctx.putImageData(imageData, 0, 0);
}
