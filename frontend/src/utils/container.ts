import type { BuilderComponent, BuilderComponentStyle, BuilderComponentType } from '../types/page';
import { MIN_DIMENSIONS_BY_TYPE, CANVAS_WIDTH, CANVAS_HEIGHT, clamp } from './canvas';

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

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export type SidebarDragData = {
  source: 'sidebar';
  componentType: BuilderComponentType;
};

export function isSidebarDragData(value: unknown): value is SidebarDragData {
  if (!isRecord(value)) return false;
  return value.source === 'sidebar' && typeof value.componentType === 'string';
}

export type CanvasDragData = {
  source: 'canvas';
  componentId: string;
  componentType: string;
  parentId: string | null;
};

export function isCanvasDragData(value: unknown): value is CanvasDragData {
  if (!isRecord(value)) return false;
  return (
    value.source === 'canvas' &&
    typeof value.componentId === 'string' &&
    typeof value.componentType === 'string' &&
    (value.parentId === null || typeof value.parentId === 'string')
  );
}

export type CanvasDropData = {
  dropType: 'canvas';
};

export function isCanvasDropData(value: unknown): value is CanvasDropData {
  if (!isRecord(value)) return false;
  return value.dropType === 'canvas';
}

export type ContainerDropData = {
  dropType: 'container';
  containerId: string;
  zIndex?: number;
};

export function isContainerDropData(value: unknown): value is ContainerDropData {
  if (!isRecord(value)) return false;
  return (
    value.dropType === 'container' &&
    typeof value.containerId === 'string' &&
    (value.zIndex === undefined || (typeof value.zIndex === 'number' && Number.isFinite(value.zIndex)))
  );
}

export function getSafeBorderWidth(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(0, Math.min(10, value));
  }
  return CONTAINER_STYLE_DEFAULTS.borderWidth;
}

export function normalizeContainerChildrenLayout(components: BuilderComponent[]): BuilderComponent[] {
  const map = new Map<string, BuilderComponent>();
  components.forEach(c => map.set(c.id, c));

  return components.map(child => {
    if (child.parentId === null || child.parentId === undefined) return child;

    const parent = map.get(child.parentId);
    if (!parent || parent.type !== 'Container') return child;

    const safeBorderWidth = getSafeBorderWidth(parent.style?.borderWidth);
    const { innerWidth, innerHeight } = getContainerInnerDimensions(
      parent.layout?.width ?? 300,
      parent.layout?.height ?? 60,
      safeBorderWidth
    );

    const minDims = MIN_DIMENSIONS_BY_TYPE[child.type] ?? { width: 50, height: 20 };
    const minimumWidth = minDims.width;
    const minimumHeight = minDims.height;

    const currentWidth = child.layout?.width ?? minimumWidth;
    const currentHeight = child.layout?.height ?? minimumHeight;
    const currentX = child.layout?.x ?? 0;
    const currentY = child.layout?.y ?? 0;

    if (innerWidth >= minimumWidth && innerHeight >= minimumHeight) {
      const width = Math.max(minimumWidth, Math.min(currentWidth, innerWidth));
      const height = Math.max(minimumHeight, Math.min(currentHeight, innerHeight));

      const x = clamp(currentX, 0, innerWidth - width);
      const y = clamp(currentY, 0, innerHeight - height);

      if (width !== currentWidth || height !== currentHeight || x !== currentX || y !== currentY) {
        return {
          ...child,
          layout: {
            ...child.layout,
            width,
            height,
            x,
            y
          }
        };
      }
      return child;
    } else {
      const parentX = parent.layout?.x ?? 0;
      const parentY = parent.layout?.y ?? 0;
      
      const rootX = parentX + safeBorderWidth + currentX;
      const rootY = parentY + safeBorderWidth + currentY;

      const x = clamp(rootX, 0, Math.max(0, CANVAS_WIDTH - currentWidth));
      const y = clamp(rootY, 0, Math.max(0, CANVAS_HEIGHT - currentHeight));

      return {
        ...child,
        parentId: null,
        layout: {
          ...child.layout,
          x,
          y
        }
      };
    }
  });
}

export function getMaxCompatibleContainerBorderWidth(components: BuilderComponent[], containerId: string): number {
  const container = components.find(c => c.id === containerId);
  if (!container || container.type !== 'Container') return 10;

  const children = components.filter(c => c.parentId === containerId);
  if (children.length === 0) return 10;

  let maxByWidth = 10;
  let maxByHeight = 10;
  
  const containerWidth = container.layout?.width ?? 300;
  const containerHeight = container.layout?.height ?? 60;

  for (const child of children) {
    const usedInnerWidth = (child.layout?.x ?? 0) + (child.layout?.width ?? 0);
    const usedInnerHeight = (child.layout?.y ?? 0) + (child.layout?.height ?? 0);
    
    const possibleMaxByWidth = Math.floor((containerWidth - usedInnerWidth) / 2);
    const possibleMaxByHeight = Math.floor((containerHeight - usedInnerHeight) / 2);

    if (possibleMaxByWidth < maxByWidth) {
      maxByWidth = possibleMaxByWidth;
    }
    if (possibleMaxByHeight < maxByHeight) {
      maxByHeight = possibleMaxByHeight;
    }
  }

  return Math.max(0, Math.min(10, maxByWidth, maxByHeight));
}

export type DragTargetState = {
  containerId: string;
  status: "valid" | "invalid";
  reason: ContainerDropEvaluation["reason"];
};

export type ContainerDropActiveDescriptor = {
  type: BuilderComponentType;
  width: number;
  height: number;
};

export type ContainerDropEvaluation =
  | {
      valid: true;
      reason: "valid";
    }
  | {
      valid: false;
      reason:
        | "container-nesting"
        | "too-small"
        | "missing-container"
        | "missing-layout"
        | "invalid-dimensions";
    };

export function evaluateContainerDrop(
  components: BuilderComponent[],
  activeDescriptor: ContainerDropActiveDescriptor | null,
  targetContainerId: string
): ContainerDropEvaluation {
  if (!activeDescriptor) {
    return { valid: false, reason: "missing-layout" };
  }

  const container = components.find(c => c.id === targetContainerId);
  if (!container) {
    return { valid: false, reason: "missing-container" };
  }
  if (container.type !== "Container") {
    return { valid: false, reason: "missing-container" };
  }
  if (!container.layout) {
    return { valid: false, reason: "missing-layout" };
  }

  if (activeDescriptor.type === "Container") {
    return { valid: false, reason: "container-nesting" };
  }

  const safeBorderWidth = getSafeBorderWidth(container.style?.borderWidth);
  const { innerWidth, innerHeight } = getContainerInnerDimensions(
    container.layout.width ?? 300,
    container.layout.height ?? 60,
    safeBorderWidth
  );

  const { width, height } = activeDescriptor;
  
  if (!Number.isFinite(width) || !Number.isFinite(height)) {
    return { valid: false, reason: "invalid-dimensions" };
  }

  if (width > innerWidth || height > innerHeight) {
    return { valid: false, reason: "too-small" };
  }

  return { valid: true, reason: "valid" };
}
