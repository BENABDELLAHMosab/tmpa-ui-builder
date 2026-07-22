import type { BuilderTableColumn, BuilderTableRow } from '../types/page';

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
