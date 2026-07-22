import type { BuilderComponent } from '../../../types/page';
import type { BuilderTableProps, BuilderTableColumn, BuilderTableRow } from '../../../types/page';
import { generateId } from '../../../utils/id';

interface TablePropertiesProps {
  component: BuilderComponent;
  onUpdateProps: (componentId: string, newProps: Record<string, unknown>) => void;
}

const TableProperties = ({ component, onUpdateProps }: TablePropertiesProps) => {
  const props = component.props as unknown as BuilderTableProps;
  
  // Safe defaults if props are somehow missing
  const columns = Array.isArray(props.columns) ? props.columns : [];
  const rows = Array.isArray(props.rows) ? props.rows : [];

  const handleUpdateColumnsAndRows = (nextColumns: BuilderTableColumn[], nextRows: BuilderTableRow[]) => {
    onUpdateProps(component.id, {
      ...component.props,
      columns: nextColumns,
      rows: nextRows
    });
  };

  // --- COLUMNS ---
  const handleUpdateColumnLabel = (columnId: string, newLabel: string) => {
    const nextColumns = columns.map((column: BuilderTableColumn) => 
      column.id === columnId 
        ? { ...column, label: newLabel } 
        : column
    );
    handleUpdateColumnsAndRows(nextColumns, rows);
  };

  const handleAddColumn = () => {
    const newColumnId = generateId("column");
    const newColumn: BuilderTableColumn = {
      id: newColumnId,
      label: `Column ${columns.length + 1}`
    };

    const nextColumns = [...columns, newColumn];
    
    // Add empty cell for the new column in all existing rows
    const nextRows = rows.map((row: BuilderTableRow) => ({
      ...row,
      cells: {
        ...row.cells,
        [newColumnId]: ""
      }
    }));

    handleUpdateColumnsAndRows(nextColumns, nextRows);
  };

  const handleDeleteColumn = (columnId: string) => {
    if (columns.length <= 1) return; // Prevent deleting the last column

    const nextColumns = columns.filter((col: BuilderTableColumn) => col.id !== columnId);

    // Remove the cell from all rows
    const nextRows = rows.map((row: BuilderTableRow) => {
      const nextCells = { ...row.cells };
      delete nextCells[columnId];
      
      return {
        ...row,
        cells: nextCells
      };
    });

    handleUpdateColumnsAndRows(nextColumns, nextRows);
  };

  // --- ROWS ---
  const handleAddRow = () => {
    const newRowId = generateId("row");
    
    // Initialize empty values for each column
    const cells = Object.fromEntries(
      columns.map((column: BuilderTableColumn) => [column.id, ""])
    );

    const newRow: BuilderTableRow = {
      id: newRowId,
      cells
    };

    const nextRows = [...rows, newRow];
    handleUpdateColumnsAndRows(columns, nextRows);
  };

  const handleDeleteRow = (rowId: string) => {
    const nextRows = rows.filter((row: BuilderTableRow) => row.id !== rowId);
    handleUpdateColumnsAndRows(columns, nextRows);
  };

  const handleUpdateCell = (rowId: string, columnId: string, newValue: string) => {
    const nextRows = rows.map((row: BuilderTableRow) => 
      row.id === rowId
        ? {
            ...row,
            cells: {
              ...row.cells,
              [columnId]: newValue
            }
          }
        : row
    );
    handleUpdateColumnsAndRows(columns, nextRows);
  };

  return (
    <>
      {/* COLUMNS SECTION */}
      <div className="prop-group" style={{ marginTop: '16px' }}>
        <label style={{ fontWeight: 600, display: 'block', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginBottom: '8px' }}>
          Columns
        </label>
        
        {columns.map((column: BuilderTableColumn) => (
          <div key={column.id} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <input 
              type="text" 
              value={column.label} 
              onChange={(e) => handleUpdateColumnLabel(column.id, e.currentTarget.value)} 
              style={{ flex: 1 }}
              placeholder="Column name"
            />
            <button 
              className="btn" 
              style={{ padding: '0 8px' }}
              onClick={() => handleDeleteColumn(column.id)}
              disabled={columns.length === 1}
              title={columns.length === 1 ? "Cannot delete the last column" : "Delete column"}
            >
              ×
            </button>
          </div>
        ))}
        
        <button 
          className="btn" 
          onClick={handleAddColumn}
          style={{ width: '100%', marginTop: '4px' }}
        >
          + Add column
        </button>
      </div>

      {/* ROWS SECTION */}
      <div className="prop-group" style={{ marginTop: '16px' }}>
        <label style={{ fontWeight: 600, display: 'block', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginBottom: '8px' }}>
          Rows
        </label>

        {rows.map((row: BuilderTableRow, rowIndex: number) => (
          <div key={row.id} style={{ border: '1px solid #e2e8f0', borderRadius: '4px', padding: '8px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Row {rowIndex + 1}</span>
              <button 
                className="btn" 
                style={{ padding: '2px 6px', fontSize: '12px', height: 'auto', backgroundColor: '#fee2e2', color: '#ef4444', borderColor: '#fca5a5' }}
                onClick={() => handleDeleteRow(row.id)}
              >
                Delete Row
              </button>
            </div>
            
            {columns.map((column: BuilderTableColumn) => {
              const cellValue = typeof row.cells[column.id] === 'string' ? row.cells[column.id] : "";
              return (
                <div key={`${row.id}-${column.id}`} style={{ marginBottom: '8px' }}>
                  <label style={{ fontSize: '11px', color: '#475569', marginBottom: '2px' }}>
                    {column.label || "Untitled Column"}
                  </label>
                  <input 
                    type="text" 
                    value={cellValue} 
                    onChange={(e) => handleUpdateCell(row.id, column.id, e.currentTarget.value)}
                    placeholder="Value..."
                  />
                </div>
              );
            })}
          </div>
        ))}

        <button 
          className="btn" 
          onClick={handleAddRow}
          style={{ width: '100%', marginTop: '4px' }}
        >
          + Add row
        </button>
      </div>
    </>
  );
};

export default TableProperties;
