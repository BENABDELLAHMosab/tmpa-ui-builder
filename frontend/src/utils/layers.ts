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

  const zIndexMap = new Map<string, number>();

  // Group by parentId
  const groups = new Map<string | null, Array<{ id: string; originalIndex: number; effectiveZIndex: number }>>();
  
  components.forEach((comp, index) => {
    const pId = comp.parentId ?? null;
    if (!groups.has(pId)) groups.set(pId, []);
    
    const rawZ = comp.layout?.zIndex;
    const effectiveZIndex = isValidZIndex(rawZ) ? rawZ : groups.get(pId)!.length + 1;
    
    groups.get(pId)!.push({
      id: comp.id,
      originalIndex: index,
      effectiveZIndex
    });
  });

  // Sort and assign within each group
  for (const group of groups.values()) {
    group.sort((a, b) => {
      if (a.effectiveZIndex !== b.effectiveZIndex) {
        return a.effectiveZIndex - b.effectiveZIndex;
      }
      return a.originalIndex - b.originalIndex;
    });

    group.forEach((item, i) => {
      zIndexMap.set(item.id, i + 1);
    });
  }

  // Rebuild preserving original array order
  return components.map(comp => ({
    ...comp,
    layout: {
      ...comp.layout,
      zIndex: zIndexMap.get(comp.id)!
    }
  }));
}

export function getHighestZIndex(components: BuilderComponent[], parentId: string | null = null): number {
  if (components.length === 0) return 0;
  
  let max = 0;
  for (const comp of components) {
    if ((comp.parentId ?? null) === parentId) {
      const z = comp.layout?.zIndex;
      if (isValidZIndex(z) && z > max) {
        max = z;
      }
    }
  }
  return max;
}

export function getComponentLayerInfo(components: BuilderComponent[], id: string): ComponentLayerInfo | null {
  if (components.length === 0) return null;

  const comp = components.find(c => c.id === id);
  if (!comp) return null;

  const parentId = comp.parentId ?? null;
  const siblings = components.filter(c => (c.parentId ?? null) === parentId);

  const level = comp.layout?.zIndex ?? 1;
  const total = siblings.length;

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
  const normalized = normalizeComponentLayers(components);
  
  const targetComp = normalized.find(c => c.id === id);
  if (!targetComp) return normalized;

  const parentId = targetComp.parentId ?? null;
  const siblings = normalized.filter(c => (c.parentId ?? null) === parentId);
  
  const sortedSiblings = [...siblings].sort((a, b) => (a.layout!.zIndex!) - (b.layout!.zIndex!));
  
  const currentIndex = sortedSiblings.findIndex(c => c.id === id);
  if (currentIndex === -1) return normalized;

  if (action === "send-to-back" && currentIndex > 0) {
    const item = sortedSiblings.splice(currentIndex, 1)[0];
    sortedSiblings.unshift(item);
  } else if (action === "send-backward" && currentIndex > 0) {
    const item = sortedSiblings.splice(currentIndex, 1)[0];
    sortedSiblings.splice(currentIndex - 1, 0, item);
  } else if (action === "bring-forward" && currentIndex < sortedSiblings.length - 1) {
    const item = sortedSiblings.splice(currentIndex, 1)[0];
    sortedSiblings.splice(currentIndex + 1, 0, item);
  } else if (action === "bring-to-front" && currentIndex < sortedSiblings.length - 1) {
    const item = sortedSiblings.splice(currentIndex, 1)[0];
    sortedSiblings.push(item);
  } else {
    return normalized;
  }

  const siblingZIndexMap = new Map<string, number>();
  sortedSiblings.forEach((item, i) => {
    siblingZIndexMap.set(item.id, i + 1);
  });

  return normalized.map(comp => {
    if ((comp.parentId ?? null) === parentId && siblingZIndexMap.has(comp.id)) {
      return {
        ...comp,
        layout: {
          ...comp.layout,
          zIndex: siblingZIndexMap.get(comp.id)!
        }
      };
    }
    return comp;
  });
}
