import React, { useState, useRef, useMemo } from 'react';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { BuilderComponent } from '../../types/page';
import ComponentRenderer from '../renderers/ComponentRenderer';
import ContainerFrame from '../renderers/ContainerFrame';
import { clamp, CANVAS_WIDTH, CANVAS_HEIGHT, MIN_DIMENSIONS_BY_TYPE } from '../../utils/canvas';
import { getHighestZIndex } from '../../utils/layers';
import { buildComponentsByParent, getContainerInnerDimensions, CONTAINER_STYLE_DEFAULTS } from '../../utils/container';
import type { DragTargetState } from '../../utils/container';
import '../../styles/builder.css';

interface DraggableCanvasItemProps {
  comp: BuilderComponent;
  isSelected: boolean;
  interactionZIndex: number;
  onSelectComponent: (componentId: string) => void;
  onResizeComponent: (componentId: string, dimensions: { width: number; height: number }) => void;
  maxWidth: number;
  maxHeight: number;
}

type ResizeSession = {
  pointerId: number;
  pointerX: number;
  pointerY: number;
  width: number;
  height: number;
};

const DraggableCanvasItem = ({ 
  comp, 
  isSelected, 
  interactionZIndex, 
  onSelectComponent, 
  onResizeComponent,
  maxWidth,
  maxHeight
}: DraggableCanvasItemProps) => {
  const [isResizing, setIsResizing] = useState(false);
  const resizeSessionRef = useRef<ResizeSession | null>(null);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: comp.id,
    data: {
      source: 'canvas',
      componentId: comp.id,
      componentType: comp.type,
      parentId: comp.parentId ?? null
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
    
    const safeMaxWidth = Math.max(minDims.width, maxWidth);
    const safeMaxHeight = Math.max(minDims.height, maxHeight);

    const safeWidth = Math.round(clamp(nextWidth, minDims.width, safeMaxWidth));
    const safeHeight = Math.round(clamp(nextHeight, minDims.height, safeMaxHeight));

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

  const displayedZIndex = isDragging || isResizing ? interactionZIndex : (comp.layout?.zIndex ?? 1);

  const style: React.CSSProperties = {
    position: 'absolute',
    left: comp.layout?.x ?? 0,
    top: comp.layout?.y ?? 0,
    width: comp.layout?.width ?? 300,
    height: comp.layout?.height ?? 60,
    transform: isDragging ? undefined : CSS.Translate.toString(transform),
    zIndex: displayedZIndex,
    padding: 0,
    border: isSelected ? '2px solid var(--color-secondary)' : '2px solid transparent',
    boxShadow: isSelected ? '0 0 0 4px var(--color-info-bg)' : '0 1px 3px rgba(0, 0, 0, 0.05)',
    borderRadius: 'var(--radius-md)',
    transition: isDragging || isResizing ? 'none' : 'box-shadow 0.2s',
    boxSizing: 'border-box',
    overflow: 'hidden',
    pointerEvents: 'auto',
    opacity: isDragging ? 0.3 : 1
  };

  return (
    <div
      id={comp.id}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`canvas-item-wrapper ${isDragging ? 'is-dragging' : ''} ${isResizing ? 'is-resizing' : ''} child-wrapper`}
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
          style={{ zIndex: 10 }}
        />
      )}
    </div>
  );
};

interface DraggableContainerItemProps extends DraggableCanvasItemProps {
  childrenComponents: BuilderComponent[];
  isChildSelected: boolean;
  globalSelectedComponentId: string | null;
  dragTargetState: DragTargetState | null;
}

const DraggableContainerItem = ({
  comp,
  childrenComponents,
  isSelected,
  interactionZIndex,
  onSelectComponent,
  onResizeComponent,
  maxWidth,
  maxHeight,
  isChildSelected,
  globalSelectedComponentId,
  dragTargetState
}: DraggableContainerItemProps) => {
  const [isResizing, setIsResizing] = useState(false);
  const resizeSessionRef = useRef<ResizeSession | null>(null);

  const { attributes, listeners, setNodeRef: setDraggableNodeRef, transform, isDragging } = useDraggable({
    id: comp.id,
    data: {
      source: 'canvas',
      componentId: comp.id,
      componentType: comp.type,
      parentId: comp.parentId ?? null
    },
    disabled: isResizing,
  });

  const { setNodeRef: setDroppableNodeRef, isOver } = useDroppable({
    id: `container-drop-${comp.id}`,
    data: {
      dropType: 'container',
      containerId: comp.id,
      zIndex: comp.layout?.zIndex ?? 1
    }
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

    const minDims = MIN_DIMENSIONS_BY_TYPE[comp.type] ?? { width: 160, height: 120 };
    
    const borderWidth = typeof comp.style?.borderWidth === "number" && Number.isFinite(comp.style?.borderWidth) 
        ? Math.min(10, Math.max(0, comp.style.borderWidth)) 
        : CONTAINER_STYLE_DEFAULTS.borderWidth;
    
    let requiredWidth = minDims.width;
    let requiredHeight = minDims.height;
    
    childrenComponents.forEach(child => {
      const childMaxX = (child.layout?.x ?? 0) + (child.layout?.width ?? 0) + borderWidth * 2;
      const childMaxY = (child.layout?.y ?? 0) + (child.layout?.height ?? 0) + borderWidth * 2;
      requiredWidth = Math.max(requiredWidth, childMaxX);
      requiredHeight = Math.max(requiredHeight, childMaxY);
    });

    const safeMaxWidth = Math.max(requiredWidth, maxWidth);
    const safeMaxHeight = Math.max(requiredHeight, maxHeight);

    const safeWidth = Math.round(clamp(nextWidth, requiredWidth, safeMaxWidth));
    const safeHeight = Math.round(clamp(nextHeight, requiredHeight, safeMaxHeight));

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

  const displayedZIndex = isDragging || isResizing ? interactionZIndex : (comp.layout?.zIndex ?? 1);

  const wrapperStyle: React.CSSProperties = {
    position: 'absolute',
    left: comp.layout?.x ?? 0,
    top: comp.layout?.y ?? 0,
    width: comp.layout?.width ?? 300,
    height: comp.layout?.height ?? 60,
    transform: CSS.Translate.toString(transform),
    zIndex: displayedZIndex,
    padding: 0,
    border: 'none',
    transition: isDragging || isResizing ? 'none' : 'box-shadow 0.2s',
    boxSizing: 'border-box'
  };
  
  const borderWidth = typeof comp.style?.borderWidth === "number" && Number.isFinite(comp.style?.borderWidth) 
        ? Math.min(10, Math.max(0, comp.style.borderWidth)) 
        : CONTAINER_STYLE_DEFAULTS.borderWidth;

  const { innerWidth, innerHeight } = getContainerInnerDimensions(
    comp.layout?.width ?? 300, 
    comp.layout?.height ?? 60, 
    borderWidth
  );

  return (
    <div
      id={comp.id}
      ref={setDraggableNodeRef}
      style={wrapperStyle}
      className={`container-wrapper ${isDragging ? 'is-dragging' : ''} ${isResizing ? 'is-resizing' : ''}`}
    >
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <ContainerFrame component={comp} />
      </div>
      
      <div 
        className="container-drag-surface"
        {...listeners} 
        {...attributes}
        style={{ 
          position: 'absolute', 
          inset: 0, 
          zIndex: 1, 
          pointerEvents: 'auto',
          cursor: 'pointer'
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelectComponent(comp.id);
        }}
      />
      
      <div
        ref={setDroppableNodeRef}
        className={`container-content-layer ${isOver ? 'drag-over-container' : ''} ${
          dragTargetState?.containerId === comp.id 
            ? (dragTargetState.status === 'valid' ? 'container-drop-target--valid' : 'container-drop-target--invalid')
            : ''
        }`}
        style={{
          position: 'absolute',
          top: borderWidth,
          left: borderWidth,
          width: innerWidth,
          height: innerHeight,
          zIndex: 2,
          pointerEvents: 'none'
        }}
      >
        {childrenComponents.map(child => (
          <DraggableCanvasItem
            key={child.id}
            comp={child}
            isSelected={child.id === globalSelectedComponentId}
            interactionZIndex={interactionZIndex}
            onSelectComponent={onSelectComponent}
            onResizeComponent={onResizeComponent}
            maxWidth={innerWidth - (child.layout?.x ?? 0)}
            maxHeight={innerHeight - (child.layout?.y ?? 0)}
          />
        ))}
      </div>
      
      {(isSelected || isChildSelected) && (
        <div style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 3,
          border: isSelected ? '2px solid var(--color-secondary)' : '1px dashed var(--color-secondary)',
          boxShadow: isSelected ? '0 0 0 4px var(--color-info-bg)' : 'none',
          borderRadius: comp.style?.borderRadius ?? CONTAINER_STYLE_DEFAULTS.borderRadius
        }} />
      )}
      
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
          style={{ zIndex: 4, pointerEvents: 'auto' }}
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
  dragTargetState: DragTargetState | null;
}

const BuilderCanvas = ({ components, selectedComponentId, onSelectComponent, onResizeComponent, canvasRef, dragTargetState }: BuilderCanvasProps) => {
  const hasComponents = components.length > 0;
  const interactionZIndex = getHighestZIndex(components) + 1;
  
  const componentsByParent = useMemo(() => buildComponentsByParent(components), [components]);
  
  const rootComponents = componentsByParent.get(null) || [];

  const { isOver, setNodeRef } = useDroppable({
    id: 'builder-canvas',
    data: { dropType: 'canvas' }
  });

  const setRefs = (node: HTMLDivElement | null) => {
    setNodeRef(node);
    if (canvasRef && typeof canvasRef !== 'function') {
      (canvasRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    }
  };
  
  const checkChildSelected = (containerId: string): boolean => {
    if (!selectedComponentId) return false;
    const children = componentsByParent.get(containerId) || [];
    return children.some(c => c.id === selectedComponentId);
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
          rootComponents.map((comp) => {
            if (comp.type === 'Container') {
              return (
                <DraggableContainerItem
                  key={comp.id}
                  comp={comp}
                  childrenComponents={componentsByParent.get(comp.id) || []}
                  isSelected={comp.id === selectedComponentId}
                  isChildSelected={checkChildSelected(comp.id)}
                  globalSelectedComponentId={selectedComponentId}
                  interactionZIndex={interactionZIndex}
                  onSelectComponent={onSelectComponent}
                  onResizeComponent={onResizeComponent}
                  maxWidth={CANVAS_WIDTH - (comp.layout?.x ?? 0)}
                  maxHeight={CANVAS_HEIGHT - (comp.layout?.y ?? 0)}
                  dragTargetState={dragTargetState}
                />
              );
            }

            return (
              <DraggableCanvasItem
                key={comp.id}
                comp={comp}
                isSelected={comp.id === selectedComponentId}
                interactionZIndex={interactionZIndex}
                onSelectComponent={onSelectComponent}
                onResizeComponent={onResizeComponent}
                maxWidth={CANVAS_WIDTH - (comp.layout?.x ?? 0)}
                maxHeight={CANVAS_HEIGHT - (comp.layout?.y ?? 0)}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default BuilderCanvas;
