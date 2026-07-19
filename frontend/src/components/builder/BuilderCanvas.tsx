import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { BuilderComponent } from '../../types/page';
import '../../styles/builder.css';

interface SortableCanvasItemProps {
  comp: BuilderComponent;
  isSelected: boolean;
  onSelectComponent: (componentId: string) => void;
}

const SortableCanvasItem = ({ comp, isSelected, onSelectComponent }: SortableCanvasItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: comp.id,
    data: {
      source: 'canvas',
      componentId: comp.id,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const renderComponent = () => {
    switch (comp.type) {
      case 'Text':
        return <span>{comp.props.text as string}</span>;
      case 'Button':
        return <button className="btn btn-primary" style={{ width: 'auto' }}>{comp.props.label as string}</button>;
      case 'Input':
        return <input type="text" placeholder={comp.props.placeholder as string} disabled className="canvas-input" />;
      case 'Card':
        return (
          <div className="canvas-card">
            <h4>{comp.props.title as string}</h4>
            <p>{comp.props.content as string}</p>
          </div>
        );
      case 'Table':
        return (
          <table className="canvas-table">
            <thead>
              <tr>
                {((comp.props.columns as string[]) || []).map((col, idx) => (
                  <th key={idx}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={((comp.props.columns as string[]) || []).length} className="text-center text-muted" style={{ textAlign: 'center', color: '#94a3b8', padding: '1rem' }}>No data</td>
              </tr>
            </tbody>
          </table>
        );
      default:
        return null;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`canvas-item ${isSelected ? 'selected' : ''} ${isDragging ? 'is-dragging' : ''}`}
      onClick={() => onSelectComponent(comp.id)}
    >
      {renderComponent()}
    </div>
  );
};

interface BuilderCanvasProps {
  components: BuilderComponent[];
  selectedComponentId: string | null;
  onSelectComponent: (componentId: string) => void;
}

const BuilderCanvas = ({ components, selectedComponentId, onSelectComponent }: BuilderCanvasProps) => {
  const hasComponents = components.length > 0;
  
  const { isOver, setNodeRef } = useDroppable({
    id: 'builder-canvas',
  });

  return (
    <div className="builder-canvas-container">
      <h3>Canvas</h3>
      <div 
        ref={setNodeRef}
        className={`builder-canvas ${isOver ? 'drag-over' : ''}`}
      >
        {!hasComponents ? (
          <div className="empty-canvas">
            Empty canvas. Click or drag components from the sidebar.
          </div>
        ) : (
          <SortableContext items={components.map(c => c.id)} strategy={verticalListSortingStrategy}>
            <div className="canvas-components" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
              {components.map((comp) => (
                <SortableCanvasItem
                  key={comp.id}
                  comp={comp}
                  isSelected={comp.id === selectedComponentId}
                  onSelectComponent={onSelectComponent}
                />
              ))}
            </div>
          </SortableContext>
        )}
      </div>
    </div>
  );
};

export default BuilderCanvas;
