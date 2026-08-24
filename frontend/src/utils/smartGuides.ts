import type { BuilderComponent } from '../types/page';
import { CONTAINER_STYLE_DEFAULTS } from './container';

export const SMART_GUIDE_TOLERANCE = 5;
const GUIDE_MARGIN = 10;

export interface GuideLine {
  id: string;
  axis: 'x' | 'y';
  position: number;
  start: number;
  end: number;
  label?: string;
  type?: 'alignment' | 'dimension';
}

export interface Bounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
  centerX: number;
  centerY: number;
  width: number;
  height: number;
  id: string;
}

export interface DragSnapshot {
  activeId: string;
  parentOffsetX: number;
  parentOffsetY: number;
  parentInnerWidth: number;
  parentInnerHeight: number;
  initialBounds: Bounds;
  siblings: Bounds[];
}

export const getComponentCanvasOffset = (comp: BuilderComponent, allComponents: BuilderComponent[]): { x: number, y: number } => {
  let x = comp.layout?.x ?? 0;
  let y = comp.layout?.y ?? 0;
  let currentParentId = comp.parentId;
  
  while (currentParentId) {
    const parent = allComponents.find(c => c.id === currentParentId);
    if (!parent) break;
    const borderWidth = typeof parent.style?.borderWidth === 'number' ? Math.max(0, parent.style.borderWidth) : CONTAINER_STYLE_DEFAULTS.borderWidth;
    x += (parent.layout?.x ?? 0) + borderWidth;
    y += (parent.layout?.y ?? 0) + borderWidth;
    currentParentId = parent.parentId;
  }
  return { x, y };
};

export const getComponentCanvasRect = (comp: BuilderComponent, allComponents: BuilderComponent[]): Bounds => {
  const { x, y } = getComponentCanvasOffset(comp, allComponents);
  const width = comp.layout?.width ?? 300;
  const height = comp.layout?.height ?? 60;
  
  return {
    id: comp.id,
    left: x,
    right: x + width,
    top: y,
    bottom: y + height,
    centerX: x + width / 2,
    centerY: y + height / 2,
    width,
    height
  };
};

interface Candidate {
  value: number;
  deltaNeeded: number;
  guidePos: number;
  start: number;
  end: number;
  label?: string;
  type: 'alignment' | 'dimension';
}

export const computeDragSnap = (
  snapshot: DragSnapshot, 
  deltaX: number, 
  deltaY: number
) => {
  const { initialBounds, siblings, parentOffsetX, parentOffsetY, parentInnerWidth, parentInnerHeight } = snapshot;
  
  const currentLeft = initialBounds.left + deltaX;
  const currentRight = initialBounds.right + deltaX;
  const currentCenterX = initialBounds.centerX + deltaX;
  
  const currentTop = initialBounds.top + deltaY;
  const currentBottom = initialBounds.bottom + deltaY;
  const currentCenterY = initialBounds.centerY + deltaY;

  const xCandidates: Candidate[] = [];
  const yCandidates: Candidate[] = [];

  for (const sib of siblings) {
    const startY = Math.min(sib.top, currentTop) - GUIDE_MARGIN;
    const endY = Math.max(sib.bottom, currentBottom) + GUIDE_MARGIN;

    xCandidates.push({ value: sib.left, deltaNeeded: sib.left - currentLeft, guidePos: sib.left, start: startY, end: endY, type: 'alignment' });
    xCandidates.push({ value: sib.right, deltaNeeded: sib.right - currentRight, guidePos: sib.right, start: startY, end: endY, type: 'alignment' });
    xCandidates.push({ value: sib.centerX, deltaNeeded: sib.centerX - currentCenterX, guidePos: sib.centerX, start: startY, end: endY, type: 'alignment' });
    xCandidates.push({ value: sib.right, deltaNeeded: sib.right - currentLeft, guidePos: sib.right, start: startY, end: endY, type: 'alignment' });
    xCandidates.push({ value: sib.left, deltaNeeded: sib.left - currentRight, guidePos: sib.left, start: startY, end: endY, type: 'alignment' });

    const startX = Math.min(sib.left, currentLeft) - GUIDE_MARGIN;
    const endX = Math.max(sib.right, currentRight) + GUIDE_MARGIN;

    yCandidates.push({ value: sib.top, deltaNeeded: sib.top - currentTop, guidePos: sib.top, start: startX, end: endX, type: 'alignment' });
    yCandidates.push({ value: sib.bottom, deltaNeeded: sib.bottom - currentBottom, guidePos: sib.bottom, start: startX, end: endX, type: 'alignment' });
    yCandidates.push({ value: sib.centerY, deltaNeeded: sib.centerY - currentCenterY, guidePos: sib.centerY, start: startX, end: endX, type: 'alignment' });
    yCandidates.push({ value: sib.bottom, deltaNeeded: sib.bottom - currentTop, guidePos: sib.bottom, start: startX, end: endX, type: 'alignment' });
    yCandidates.push({ value: sib.top, deltaNeeded: sib.top - currentBottom, guidePos: sib.top, start: startX, end: endX, type: 'alignment' });
  }

  const parentCenterX = parentOffsetX + parentInnerWidth / 2;
  const parentCenterY = parentOffsetY + parentInnerHeight / 2;
  
  xCandidates.push({ 
    value: parentCenterX, deltaNeeded: parentCenterX - currentCenterX, guidePos: parentCenterX, 
    start: currentTop - 15, end: currentBottom + 15, type: 'alignment' 
  });
  yCandidates.push({ 
    value: parentCenterY, deltaNeeded: parentCenterY - currentCenterY, guidePos: parentCenterY, 
    start: currentLeft - 15, end: currentRight + 15, type: 'alignment' 
  });

  let bestXDelta = Infinity;
  let snappedDeltaX = deltaX;
  let guideX: GuideLine | null = null;

  for (const cand of xCandidates) {
    const absDelta = Math.abs(cand.deltaNeeded);
    if (absDelta <= SMART_GUIDE_TOLERANCE && absDelta < bestXDelta) {
      bestXDelta = absDelta;
      snappedDeltaX = deltaX + cand.deltaNeeded;
      guideX = { id: 'guide-x', axis: 'x', position: cand.guidePos, start: cand.start, end: cand.end, label: cand.label, type: cand.type };
    }
  }

  let bestYDelta = Infinity;
  let snappedDeltaY = deltaY;
  let guideY: GuideLine | null = null;

  for (const cand of yCandidates) {
    const absDelta = Math.abs(cand.deltaNeeded);
    if (absDelta <= SMART_GUIDE_TOLERANCE && absDelta < bestYDelta) {
      bestYDelta = absDelta;
      snappedDeltaY = deltaY + cand.deltaNeeded;
      guideY = { id: 'guide-y', axis: 'y', position: cand.guidePos, start: cand.start, end: cand.end, label: cand.label, type: cand.type };
    }
  }

  return { snappedDeltaX, snappedDeltaY, guideX, guideY };
};

export const computeResizeSnap = (
  currentLeft: number,
  currentTop: number,
  currentWidth: number,
  currentHeight: number,
  currentRight: number,
  currentBottom: number,
  siblings: Bounds[]
) => {
  let bestWidthDelta = Infinity;
  let snappedWidth = currentWidth;
  let guideWidth: GuideLine | null = null;
  let guideRightX: GuideLine | null = null;

  let bestHeightDelta = Infinity;
  let snappedHeight = currentHeight;
  let guideHeight: GuideLine | null = null;
  let guideBottomY: GuideLine | null = null;

  for (const sib of siblings) {
    const widthDelta = sib.width - currentWidth;
    const absWidthDelta = Math.abs(widthDelta);
    if (absWidthDelta <= SMART_GUIDE_TOLERANCE && absWidthDelta < bestWidthDelta) {
      bestWidthDelta = absWidthDelta;
      snappedWidth = sib.width;
      guideWidth = { 
        id: 'guide-w', axis: 'x', position: currentRight + widthDelta, 
        start: Math.min(sib.top, currentTop) - GUIDE_MARGIN, 
        end: Math.max(sib.bottom, currentBottom) + GUIDE_MARGIN, 
        label: `W: ${Math.round(sib.width)}px`, type: 'dimension' 
      };
    }

    const rightDelta = sib.right - currentRight;
    const absRightDelta = Math.abs(rightDelta);
    if (absRightDelta <= SMART_GUIDE_TOLERANCE && absRightDelta < bestWidthDelta) {
      bestWidthDelta = absRightDelta;
      snappedWidth = currentWidth + rightDelta;
      guideRightX = { 
        id: 'guide-rx', axis: 'x', position: sib.right, 
        start: Math.min(sib.top, currentTop) - GUIDE_MARGIN, 
        end: Math.max(sib.bottom, currentBottom) + GUIDE_MARGIN, 
        type: 'alignment' 
      };
      guideWidth = null;
    }

    const heightDelta = sib.height - currentHeight;
    const absHeightDelta = Math.abs(heightDelta);
    if (absHeightDelta <= SMART_GUIDE_TOLERANCE && absHeightDelta < bestHeightDelta) {
      bestHeightDelta = absHeightDelta;
      snappedHeight = sib.height;
      guideHeight = { 
        id: 'guide-h', axis: 'y', position: currentBottom + heightDelta, 
        start: Math.min(sib.left, currentLeft) - GUIDE_MARGIN, 
        end: Math.max(sib.right, currentRight) + GUIDE_MARGIN, 
        label: `H: ${Math.round(sib.height)}px`, type: 'dimension' 
      };
    }

    const bottomDelta = sib.bottom - currentBottom;
    const absBottomDelta = Math.abs(bottomDelta);
    if (absBottomDelta <= SMART_GUIDE_TOLERANCE && absBottomDelta < bestHeightDelta) {
      bestHeightDelta = absBottomDelta;
      snappedHeight = currentHeight + bottomDelta;
      guideBottomY = { 
        id: 'guide-by', axis: 'y', position: sib.bottom, 
        start: Math.min(sib.left, currentLeft) - GUIDE_MARGIN, 
        end: Math.max(sib.right, currentRight) + GUIDE_MARGIN, 
        type: 'alignment' 
      };
      guideHeight = null;
    }
  }

  return {
    snappedWidth,
    snappedHeight,
    guideX: guideWidth || guideRightX,
    guideY: guideHeight || guideBottomY
  };
};
