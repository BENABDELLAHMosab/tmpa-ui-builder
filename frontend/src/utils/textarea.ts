import type { BuilderComponentStyle } from '../types/page';

export const TEXTAREA_STYLE_DEFAULTS = {
  fontFamily: "Inter",
  fontStyle: "normal",
  fontSize: 14,
  fontWeight: 400,
  textAlign: "left",
  color: "#0f172a",
  backgroundColor: "#ffffff",
  borderColor: "#cbd5e1",
  borderWidth: 1,
  borderRadius: 8,
  padding: 12
} as const satisfies BuilderComponentStyle;
