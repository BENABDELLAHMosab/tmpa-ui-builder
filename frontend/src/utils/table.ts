import type { BuilderTableColumn, BuilderTableRow, BuilderComponentStyle } from '../types/page';

export const TABLE_STYLE_DEFAULTS = {
  fontFamily: "Inter",
  fontStyle: "normal",
  fontSize: 14,
  fontWeight: 400,
  textAlign: "left",
  color: "#334155",
  backgroundColor: "#ffffff",
  headerBackgroundColor: "#1e3a66",
  headerColor: "#ffffff",
  borderColor: "#dbe3ef",
  borderWidth: 1,
  borderRadius: 8,
  padding: 12
} as const satisfies BuilderComponentStyle;

export const TABLE_TYPOGRAPHY_DEFAULTS = {
  fontFamily: TABLE_STYLE_DEFAULTS.fontFamily,
  fontStyle: TABLE_STYLE_DEFAULTS.fontStyle,
  fontSize: TABLE_STYLE_DEFAULTS.fontSize,
  fontWeight: TABLE_STYLE_DEFAULTS.fontWeight,
  textAlign: TABLE_STYLE_DEFAULTS.textAlign,
  color: TABLE_STYLE_DEFAULTS.color
} as const;

export const normalizeTableProps = (props: Record<string, unknown>): Record<string, unknown> => {
  // If it already has the new format (columns array of objects with id), return it
  if (
    Array.isArray(props.columns) && 
    props.columns.length > 0 && 
    typeof props.columns[0] === 'object' && 
    props.columns[0] !== null && 
    'id' in props.columns[0]
  ) {
    return props;
  }

  // It's either an old format or empty
  const oldColumns = Array.isArray(props.columns) ? props.columns : [];
  
  const nextColumns: BuilderTableColumn[] = [];
  
  for (let i = 0; i < oldColumns.length; i++) {
    const colLabel = typeof oldColumns[i] === 'string' ? oldColumns[i] : `Column ${i + 1}`;
    nextColumns.push({
      id: `legacy-column-${i}`,
      label: colLabel
    });
  }

  // Legacy tables didn't have rows, so we just initialize an empty rows array,
  // or preserve them if somehow they exist but columns were legacy (unlikely)
  const nextRows: BuilderTableRow[] = Array.isArray(props.rows) ? (props.rows as BuilderTableRow[]) : [];

  return {
    ...props,
    columns: nextColumns,
    rows: nextRows
  };
};
