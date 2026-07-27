export type PageStatus = "draft" | "submitted" | "approved" | "rejected" | "published";

export type BuilderComponentType = "Text" | "Button" | "Input" | "Card" | "Table" | "Select" | "Checkbox" | "Radio";

export type BuilderFontWeight = 400 | 500 | 600 | 700;
export type BuilderTextAlign = "left" | "center" | "right";
export type BuilderFontFamily = "Inter" | "Roboto" | "Open Sans" | "Montserrat" | "Calibri" | "Arial" | "system-ui";
export type BuilderFontStyle = "normal" | "italic";

export const BUILDER_INPUT_TYPES = [
  "text",
  "email",
  "password",
  "number"
] as const;

export type BuilderInputType = (typeof BUILDER_INPUT_TYPES)[number];

export type BuilderInputProps = {
  label?: string;
  placeholder?: string;
  inputType?: BuilderInputType;
  required?: boolean;
};

export type BuilderCardProps = {
  title?: string;
  content?: string;
};

export type BuilderTableColumn = {
  id: string;
  label: string;
};

export type BuilderTableRow = {
  id: string;
  cells: Record<string, string>;
};

export type BuilderTableProps = {
  columns?: BuilderTableColumn[];
  rows?: BuilderTableRow[];
};

export type BuilderSelectOption = {
  id: string;
  label: string;
  value: string;
};

export type BuilderSelectProps = {
  label?: string;
  placeholder?: string;
  required?: boolean;
  options?: BuilderSelectOption[];
};

export type BuilderCheckboxProps = {
  label?: string;
  name?: string;
  value?: string;
  required?: boolean;
  defaultChecked?: boolean;
};

export type BuilderRadioProps = {
  label?: string;
  name?: string;
  value?: string;
  required?: boolean;
  defaultChecked?: boolean;
};

export const FONT_FAMILY_FALLBACKS: Record<BuilderFontFamily, string> = {
  "Inter": '"Inter", system-ui, sans-serif',
  "Roboto": '"Roboto", system-ui, sans-serif',
  "Open Sans": '"Open Sans", system-ui, sans-serif',
  "Montserrat": '"Montserrat", system-ui, sans-serif',
  "Calibri": 'Calibri, "Segoe UI", Arial, sans-serif',
  "Arial": 'Arial, Helvetica, sans-serif',
  "system-ui": 'system-ui, sans-serif'
};

export interface BuilderComponentStyle {
  fontFamily?: BuilderFontFamily;
  fontStyle?: BuilderFontStyle;
  fontSize?: number;
  color?: string;
  fontWeight?: BuilderFontWeight;
  textAlign?: BuilderTextAlign;
  backgroundColor?: string;
  headerBackgroundColor?: string;
  headerColor?: string;
  padding?: number;
  borderRadius?: number;
  borderColor?: string;
  borderWidth?: number;
  accentColor?: string;
}

export interface BuilderComponentLayout {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  zIndex?: number;
  locked?: boolean;
}

export interface BuilderComponent {
  id: string;
  type: BuilderComponentType;
  props: Record<string, unknown>;
  style?: BuilderComponentStyle;
  layout?: BuilderComponentLayout;
}

export interface PageSchema {
  components: BuilderComponent[];
  [key: string]: unknown;
}

export interface UiPage {
  _id: string;
  name: string;
  description: string;
  ownerId: string | { _id: string; fullName: string; email?: string };
  status: PageStatus;
  schema: PageSchema;
  version: number;
  createdAt: string;
  updatedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  publishedBy?: string | { _id: string; fullName: string; email?: string };
  publishedAt?: string;
}

export interface CreatePageRequest {
  name: string;
  description?: string;
}
