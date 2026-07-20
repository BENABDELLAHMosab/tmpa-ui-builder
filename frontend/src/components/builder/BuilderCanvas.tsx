import { useDroppable, useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { BuilderComponent } from '../../types/page';
import ComponentRenderer from '../renderers/ComponentRenderer';
import '../../styles/builder.css';

interface DraggableCanvasItemProps {
  comp: BuilderComponent;
  isSelected: boolean;
  onSelectComponent: (componentId: string) => void;
}

const DraggableCanvasItem = ({ comp, isSelected, onSelectComponent }: DraggableCanvasItemProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: comp.id,
    data: {
      source: 'canvas',
      componentId: comp.id,
    },
  });

  const style: React.CSSProperties = {
    position: 'absolute',
    left: comp.layout?.x ?? 0,
    top: comp.layout?.y ?? 0,
    width: comp.layout?.width ?? 300,
    height: comp.layout?.height ?? 60,
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 1000 : 1,
    padding: 0,
    border: isSelected ? '2px solid var(--color-secondary)' : '2px solid transparent',
    boxShadow: isSelected ? '0 0 0 4px var(--color-info-bg)' : '0 1px 3px rgba(0, 0, 0, 0.05)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    transition: isDragging ? 'none' : 'box-shadow 0.2s',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`canvas-item-wrapper ${isDragging ? 'is-dragging' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelectComponent(comp.id);
      }}
    >
      <ComponentRenderer component={comp} />
    </div>
  );
};

interface BuilderCanvasProps {
  components: BuilderComponent[];
  selectedComponentId: string | null;
  onSelectComponent: (componentId: string) => void;
  canvasRef: React.RefObject<HTMLDivElement | null>;
}

const BuilderCanvas = ({ components, selectedComponentId, onSelectComponent, canvasRef }: BuilderCanvasProps) => {
  const hasComponents = components.length > 0;
  
  const { isOver, setNodeRef } = useDroppable({
    id: 'builder-canvas',
  });

  const setRefs = (node: HTMLDivElement | null) => {
    setNodeRef(node);
    if (canvasRef && typeof canvasRef !== 'function') {
      (canvasRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    }
  };

  return (
    <div className="builder-canvas-container" style={{ width: '100%', overflow: 'auto', backgroundColor: '#f1f5f9' }}>
      <h3 style={{ padding: '0 1rem' }}>Canvas</h3>
      <div 
        ref={setRefs}
        className={`builder-canvas ${isOver ? 'drag-over' : ''}`}
        style={{
          position: 'relative',
          width: '1200px',
          height: '800px',
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          margin: '1rem',
          overflow: 'hidden'
        }}
        onClick={() => onSelectComponent('')}
      >
        {!hasComponents ? (
          <div className="empty-canvas" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#94a3b8' }}>
            Empty canvas. Drag components here.
          </div>
        ) : (
          components.map((comp) => (
            <DraggableCanvasItem
              key={comp.id}
              comp={comp}
              isSelected={comp.id === selectedComponentId}
              onSelectComponent={onSelectComponent}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default BuilderCanvas;
