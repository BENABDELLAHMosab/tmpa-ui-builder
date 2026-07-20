import React, { useState, useRef } from 'react';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { BuilderComponent } from '../../types/page';
import ComponentRenderer from '../renderers/ComponentRenderer';
import { clamp, CANVAS_WIDTH, CANVAS_HEIGHT, MIN_DIMENSIONS_BY_TYPE } from '../../utils/canvas';
import '../../styles/builder.css';

interface DraggableCanvasItemProps {
  comp: BuilderComponent;
  isSelected: boolean;
  onSelectComponent: (componentId: string) => void;
  onResizeComponent: (componentId: string, dimensions: { width: number; height: number }) => void;
}

type ResizeSession = {
  pointerId: number;
  pointerX: number;
  pointerY: number;
  width: number;
  height: number;
};

const DraggableCanvasItem = ({ comp, isSelected, onSelectComponent, onResizeComponent }: DraggableCanvasItemProps) => {
  const [isResizing, setIsResizing] = useState(false);
  const resizeSessionRef = useRef<ResizeSession | null>(null);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: comp.id,
    data: {
      source: 'canvas',
      componentId: comp.id,
    },
    disabled: isResizing,
  });

  const handleResizeStart = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);

    setIsResizing(true);
    resizeSessionRef.current = {
      pointerId: e.pointerId,
      pointerX: e.clientX,
      pointerY: e.clientY,
      width: comp.layout?.width ?? 300,
      height: comp.layout?.height ?? 60,
    };
  };

  const handleResizeMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const session = resizeSessionRef.current;
    if (!isResizing || !session || session.pointerId !== e.pointerId) return;

    const deltaX = e.clientX - session.pointerX;
    const deltaY = e.clientY - session.pointerY;

    const nextWidth = session.width + deltaX;
    const nextHeight = session.height + deltaY;

    const minDims = MIN_DIMENSIONS_BY_TYPE[comp.type] ?? { width: 50, height: 20 };
    
    const rawMaxWidth = CANVAS_WIDTH - (comp.layout?.x ?? 0);
    const maxWidth = Math.max(minDims.width, rawMaxWidth);
    
    const rawMaxHeight = CANVAS_HEIGHT - (comp.layout?.y ?? 0);
    const maxHeight = Math.max(minDims.height, rawMaxHeight);

    const safeWidth = Math.round(clamp(nextWidth, minDims.width, maxWidth));
    const safeHeight = Math.round(clamp(nextHeight, minDims.height, maxHeight));

    onResizeComponent(comp.id, { width: safeWidth, height: safeHeight });
  };

  const handleResizeEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    const session = resizeSessionRef.current;
    if (!isResizing || !session || session.pointerId !== e.pointerId) return;

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setIsResizing(false);
    resizeSessionRef.current = null;
  };

  const style: React.CSSProperties = {
    position: 'absolute',
    left: comp.layout?.x ?? 0,
    top: comp.layout?.y ?? 0,
    width: comp.layout?.width ?? 300,
    height: comp.layout?.height ?? 60,
    transform: CSS.Translate.toString(transform),
    zIndex: isResizing ? 1100 : (isDragging ? 1000 : 1),
    padding: 0,
    border: isSelected ? '2px solid var(--color-secondary)' : '2px solid transparent',
    boxShadow: isSelected ? '0 0 0 4px var(--color-info-bg)' : '0 1px 3px rgba(0, 0, 0, 0.05)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    transition: isDragging || isResizing ? 'none' : 'box-shadow 0.2s',
    boxSizing: 'border-box',
    overflow: 'hidden'
  };

  return (
    <div
      id={comp.id}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`canvas-item-wrapper ${isDragging ? 'is-dragging' : ''} ${isResizing ? 'is-resizing' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelectComponent(comp.id);
      }}
    >
      <div className="canvas-item__content" style={{ pointerEvents: 'none', width: '100%', height: '100%' }}>
        <ComponentRenderer component={comp} />
      </div>
      {isSelected && (
        <div
          className="resize-handle resize-handle-se"
          role="button"
          aria-label="Resize component"
          onPointerDown={handleResizeStart}
          onPointerMove={handleResizeMove}
          onPointerUp={handleResizeEnd}
          onPointerCancel={handleResizeEnd}
          onLostPointerCapture={handleResizeEnd}
        />
      )}
    </div>
  );
};

interface BuilderCanvasProps {
  components: BuilderComponent[];
  selectedComponentId: string | null;
  onSelectComponent: (componentId: string) => void;
  onResizeComponent: (componentId: string, dimensions: { width: number; height: number }) => void;
  canvasRef: React.RefObject<HTMLDivElement | null>;
}

const BuilderCanvas = ({ components, selectedComponentId, onSelectComponent, onResizeComponent, canvasRef }: BuilderCanvasProps) => {
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
              onResizeComponent={onResizeComponent}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default BuilderCanvas;
