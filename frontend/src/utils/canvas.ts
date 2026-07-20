import type { BuilderComponent, BuilderComponentType } from '../types/page';

export const CANVAS_WIDTH = 1200;
export const CANVAS_HEIGHT = 800;

export const DEFAULT_LAYOUTS: Record<BuilderComponentType, { width: number; height: number }> = {
  Text: { width: 300, height: 60 },
  Input: { width: 360, height: 64 },
  Button: { width: 180, height: 48 },
  Card: { width: 360, height: 160 },
  Table: { width: 600, height: 240 },
};

export const MIN_DIMENSIONS_BY_TYPE: Record<BuilderComponentType, { width: number; height: number }> = {
  Text: { width: 80, height: 32 },
  Input: { width: 120, height: 40 },
  Button: { width: 80, height: 40 },
  Card: { width: 160, height: 100 },
  Table: { width: 300, height: 160 },
};

export const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

export const normalizeComponentsLayout = (components: BuilderComponent[]): BuilderComponent[] => {
  let currentY = 24;
  const X_START = 24;
  const VERTICAL_SPACING = 16;

  return components.map((comp) => {
    const defaultLayout = DEFAULT_LAYOUTS[comp.type];
    
    const x = comp.layout?.x ?? X_START;
    const y = comp.layout?.y ?? currentY;
    const width = comp.layout?.width ?? defaultLayout.width;
    const height = comp.layout?.height ?? defaultLayout.height;

    // If it was missing y, it means it's an old component, so we increment currentY for the next one
    if (comp.layout?.y === undefined) {
      currentY = y + height + VERTICAL_SPACING;
    }

    return {
      ...comp,
      layout: {
        ...comp.layout,
        x,
        y,
        width,
        height
      }
    };
  });
};
