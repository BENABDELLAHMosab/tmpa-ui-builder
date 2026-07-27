import type { BuilderComponentStyle, BuilderBorderStyle } from '../types/page';

export const DIVIDER_STYLE_DEFAULTS = {
  borderColor: "#cbd5e1",
  borderWidth: 1,
  borderStyle: "solid"
} as const satisfies BuilderComponentStyle;

export function isBuilderBorderStyle(
  value: unknown
): value is BuilderBorderStyle {
  switch (value) {
    case "solid":
    case "dashed":
    case "dotted":
      return true;

    default:
      return false;
  }
}
