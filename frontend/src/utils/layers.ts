import type { BuilderComponent } from '../types/page';

export type LayerAction =
  | "send-to-back"
  | "send-backward"
  | "bring-forward"
  | "bring-to-front";

export type ComponentLayerInfo = {
  level: number;
  total: number;
  isMin: boolean;
  isMax: boolean;
};

export function isValidZIndex(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    Number.isInteger(value) &&
    value >= 1
  );
}

export function normalizeComponentLayers(components: BuilderComponent[]): BuilderComponent[] {
  if (components.length === 0) return [];

  // Create an array mapping each component to its sorting criteria
  const items = components.map((comp, index) => {
    const rawZ = comp.layout?.zIndex;
    const effectiveZIndex = isValidZIndex(rawZ) ? rawZ : index + 1;
    return {
      id: comp.id,
      originalIndex: index,
      effectiveZIndex
    };
  });

  // Sort by effectiveZIndex, then fallback to originalIndex for stability/duplicates
  items.sort((a, b) => {
    if (a.effectiveZIndex !== b.effectiveZIndex) {
      return a.effectiveZIndex - b.effectiveZIndex;
    }
    return a.originalIndex - b.originalIndex;
  });

  // Now assign dense zIndex from 1 to N
  const zIndexMap = new Map<string, number>();
  items.forEach((item, i) => {
    zIndexMap.set(item.id, i + 1);
  });

  // Rebuild the final array preserving the original array order
  return components.map(comp => ({
    ...comp,
    layout: {
      ...comp.layout,
      zIndex: zIndexMap.get(comp.id)!
    }
  }));
}

export function getHighestZIndex(components: BuilderComponent[]): number {
  if (components.length === 0) return 0;
  
  let max = 0;
  for (const comp of components) {
    const z = comp.layout?.zIndex;
    if (isValidZIndex(z) && z > max) {
      max = z;
    }
  }
  return max;
}

export function getComponentLayerInfo(components: BuilderComponent[], id: string): ComponentLayerInfo | null {
  if (components.length === 0) return null;

  // Assume components are already normalized.
  const comp = components.find(c => c.id === id);
  if (!comp) return null;

  const level = comp.layout?.zIndex ?? 1;
  const total = components.length;

  return {
    level,
    total,
    isMin: level === 1,
    isMax: level === total
  };
}

export function moveComponentLayer(
  components: BuilderComponent[],
  id: string,
  action: LayerAction
): BuilderComponent[] {
  // Always work defensively with normalized layers
  const normalized = normalizeComponentLayers(components);
  
  const targetIndex = normalized.findIndex(c => c.id === id);
  if (targetIndex === -1) return normalized;

  // Extract items sorted by zIndex to know visual order
  const sorted = [...normalized].sort((a, b) => (a.layout!.zIndex!) - (b.layout!.zIndex!));
  
  const currentIndex = sorted.findIndex(c => c.id === id);
  if (currentIndex === -1) return normalized;

  if (action === "send-to-back" && currentIndex > 0) {
    const item = sorted.splice(currentIndex, 1)[0];
    sorted.unshift(item);
  } else if (action === "send-backward" && currentIndex > 0) {
    const item = sorted.splice(currentIndex, 1)[0];
    sorted.splice(currentIndex - 1, 0, item);
  } else if (action === "bring-forward" && currentIndex < sorted.length - 1) {
    const item = sorted.splice(currentIndex, 1)[0];
    sorted.splice(currentIndex + 1, 0, item);
  } else if (action === "bring-to-front" && currentIndex < sorted.length - 1) {
    const item = sorted.splice(currentIndex, 1)[0];
    sorted.push(item);
  } else {
    // Action not possible or invalid
    return normalized;
  }

  // Assign dense zIndex 1..N based on new visual order
  const zIndexMap = new Map<string, number>();
  sorted.forEach((item, i) => {
    zIndexMap.set(item.id, i + 1);
  });

  // Return components preserving original array order
  return normalized.map(comp => ({
    ...comp,
    layout: {
      ...comp.layout,
      zIndex: zIndexMap.get(comp.id)!
    }
  }));
}
