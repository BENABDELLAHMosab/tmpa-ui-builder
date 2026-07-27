import type { BuilderComponentStyle, BuilderImageObjectFit } from '../types/page';

export const BUILDER_IMAGE_OBJECT_FITS = [
  "cover",
  "contain",
  "fill",
  "none",
  "scale-down"
] as const;

export const IMAGE_STYLE_DEFAULTS = {
  objectFit: "cover",
  backgroundColor: "#f1f5f9",
  borderColor: "#cbd5e1",
  borderWidth: 0,
  borderRadius: 8
} as const satisfies BuilderComponentStyle;

export function isBuilderImageObjectFit(
  value: unknown
): value is BuilderImageObjectFit {
  switch (value) {
    case "cover":
    case "contain":
    case "fill":
    case "none":
    case "scale-down":
      return true;

    default:
      return false;
  }
}
