import type { BuilderComponent, BuilderComponentStyle } from '../types/page';

export const CONTAINER_STYLE_DEFAULTS = {
  backgroundColor: "#ffffff",
  borderColor: "#cbd5e1",
  borderWidth: 1,
  borderStyle: "solid",
  borderRadius: 8
} as const satisfies BuilderComponentStyle;

export function normalizeComponentParents(
  components: BuilderComponent[]
): BuilderComponent[] {
  const containerIds = new Set(
    components.filter(c => c.type === 'Container').map(c => c.id)
  );

  return components.map((component) => {
    const pId = component.parentId;

    if (typeof pId !== 'string') return { ...component, parentId: null };
    if (pId === component.id) return { ...component, parentId: null };
    if (!containerIds.has(pId)) return { ...component, parentId: null };
    if (component.type === 'Container') return { ...component, parentId: null };

    return component;
  });
}

export function buildComponentsByParent(
  components: BuilderComponent[]
): Map<string | null, BuilderComponent[]> {
  const map = new Map<string | null, BuilderComponent[]>();
  map.set(null, []);
  
  components.forEach(c => {
    const pId = c.parentId ?? null;
    if (!map.has(pId)) {
      map.set(pId, []);
    }
    map.get(pId)!.push(c);
  });
  
  return map;
}

export function getDescendantIds(
  components: BuilderComponent[],
  rootId: string
): Set<string> {
  const ids = new Set<string>();
  ids.add(rootId);
  
  const childrenMap = new Map<string, string[]>();
  components.forEach(c => {
    const pId = c.parentId;
    if (pId) {
      if (!childrenMap.has(pId)) childrenMap.set(pId, []);
      childrenMap.get(pId)!.push(c.id);
    }
  });

  const stack = [rootId];
  while (stack.length > 0) {
    const current = stack.pop()!;
    const children = childrenMap.get(current) || [];
    children.forEach(childId => {
      if (!ids.has(childId)) {
        ids.add(childId);
        stack.push(childId);
      }
    });
  }

  return ids;
}

export function getContainerInnerDimensions(
  width: number,
  height: number,
  borderWidth: number
): { innerWidth: number; innerHeight: number } {
  return {
    innerWidth: Math.max(0, width - borderWidth * 2),
    innerHeight: Math.max(0, height - borderWidth * 2)
  };
}
