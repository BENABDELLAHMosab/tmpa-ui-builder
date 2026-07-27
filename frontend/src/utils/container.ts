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
  return components.map((component) => {
    if (component.parentId === null) {
      return component;
    }

    return {
      ...component,
      parentId: null
    };
  });
}
