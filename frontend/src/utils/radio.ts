import type { BuilderComponentStyle } from '../types/page';

export const RADIO_STYLE_DEFAULTS = {
  fontFamily: "Inter",
  fontStyle: "normal",
  fontSize: 14,
  fontWeight: 400,
  textAlign: "left",
  color: "#0f172a",
  accentColor: "#1e3a66",
  padding: 8
} as const satisfies BuilderComponentStyle;
