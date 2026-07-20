import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pageService } from '../services/page.service';
import type { UiPage, BuilderComponent, BuilderComponentType, BuilderComponentStyle, BuilderComponentLayout } from '../types/page';
import BuilderHeader from '../components/builder/BuilderHeader';
import ComponentSidebar from '../components/builder/ComponentSidebar';
import BuilderCanvas from '../components/builder/BuilderCanvas';
import PropertiesPanel from '../components/builder/PropertiesPanel';
import '../styles/builder.css';
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverlay
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';

const createBuilderComponent = (type: BuilderComponentType): BuilderComponent => {
  const newId = `comp_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  
  if (type === 'Text') {
    return {
      id: newId,
      type: "Text",
      props: { text: "New text" },
      style: {
        fontFamily: "Inter",
        fontStyle: "normal",
        fontSize: 16,
        color: "#334155",
        fontWeight: 400,
        textAlign: "left",
        backgroundColor: "#ffffff",
        padding: 12,
        borderRadius: 6
      },
      layout: {
        width: 300,
        height: 60
      }
    };
  }

  let defaultProps: Record<string, unknown> = {};

  switch (type) {
    case 'Button': defaultProps = { label: "Button" }; break;
    case 'Input': defaultProps = { placeholder: "Enter value" }; break;
    case 'Card': defaultProps = { title: "Card title", content: "Card content" }; break;
    case 'Table': defaultProps = { columns: ["Column 1", "Column 2"] }; break;
  }

  return {
    id: newId,
    type,
    props: defaultProps
  };
};

const BuilderPage = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  
  const [page, setPage] = useState<UiPage | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [components, setComponents] = useState<BuilderComponent[]>([]);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [activeSidebarType, setActiveSidebarType] = useState<BuilderComponentType | null>(null);
  
  const [saving, setSaving] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const fetchPage = async () => {
      if (!pageId) {
        setError("No page ID provided.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await pageService.getPageById(pageId);
        setPage(data);
        if (data.schema && Array.isArray(data.schema.components)) {
          setComponents(data.schema.components as BuilderComponent[]);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load page");
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [pageId]);

  const isValidComponentType = (type: unknown): type is BuilderComponentType => {
    return typeof type === 'string' && ['Text', 'Button', 'Input', 'Card', 'Table'].includes(type);
  };

  const handleAddComponent = (type: BuilderComponentType) => {
    const newComponent = createBuilderComponent(type);
    setComponents(prev => [...prev, newComponent]);
    setSelectedComponentId(newComponent.id);
  };

  const handleSelectComponent = (componentId: string) => {
    setSelectedComponentId(componentId);
  };

  const handleUpdateComponent = (componentId: string, newProps: Record<string, unknown>) => {
    setComponents(prev => prev.map(comp => 
      comp.id === componentId ? { ...comp, props: newProps } : comp
    ));
  };

  const handleUpdateComponentStyle = <K extends keyof BuilderComponentStyle>(
    componentId: string,
    key: K,
    value: BuilderComponentStyle[K]
  ) => {
    setComponents(prev =>
      prev.map(comp =>
        comp.id === componentId
          ? {
              ...comp,
              style: {
                ...(comp.style ?? {}),
                [key]: value
              }
            }
          : comp
      )
    );
  };

  const handleUpdateComponentLayout = <K extends keyof BuilderComponentLayout>(
    componentId: string,
    key: K,
    value: BuilderComponentLayout[K]
  ) => {
    setComponents(prev =>
      prev.map(comp =>
        comp.id === componentId
          ? {
              ...comp,
              layout: {
                ...(comp.layout ?? {}),
                [key]: value
              }
            }
          : comp
      )
    );
  };

  const handleDeleteComponent = (componentId: string) => {
    setComponents(prev => prev.filter(comp => comp.id !== componentId));
    if (selectedComponentId === componentId) {
      setSelectedComponentId(null);
    }
  };

  const handleSave = async () => {
    if (!pageId || !page) return;

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage('');
      
      const updatedPage = await pageService.updatePage(pageId, {
        schema: { ...page.schema, components }
      });
      
      setPage(updatedPage);
      setSuccessMessage("Page saved successfully");
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save page");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitForValidation = async () => {
    if (!pageId || !page) return;

    try {
      setSubmitting(true);
      setError(null);
      setSuccessMessage('');
      
      const updatedPage = await pageService.submitPage(pageId);
      setPage(updatedPage);
      setSuccessMessage("Page submitted successfully");
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to submit page");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePreview = () => {
    navigate(`/preview/${pageId}`, {
      state: {
        from: `/builder/${pageId}`
      }
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const isSidebarItem = active.data.current?.source === 'sidebar';
    
    if (isSidebarItem) {
      const type = active.data.current?.componentType;
      if (isValidComponentType(type)) {
        setActiveSidebarType(type);
      }
    }
  };

  const handleDragCancel = () => {
    setActiveSidebarType(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveSidebarType(null);
    const { active, over } = event;

    if (!over) {
      return;
    }

    const isDroppedOnCanvas = over.id === 'builder-canvas' || over.data.current?.source === 'canvas';
    const isSidebarItem = active.data.current?.source === 'sidebar';

    if (isSidebarItem && isDroppedOnCanvas) {
      const type = active.data.current?.componentType;
      if (isValidComponentType(type)) {
        const newComponent = createBuilderComponent(type);
        setComponents(prev => [...prev, newComponent]);
        setSelectedComponentId(newComponent.id);
      }
      return;
    }

    const isCanvasItem = active.data.current?.source === 'canvas';
    if (isCanvasItem && active.id !== over.id) {
      setComponents(prev => {
        const oldIndex = prev.findIndex(comp => comp.id === active.id);
        const newIndex = prev.findIndex(comp => comp.id === over.id);

        if (oldIndex === -1 || newIndex === -1) {
          return prev;
        }

        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  if (loading) {
    return <div className="builder-loading">Loading builder...</div>;
  }

  if (error && !page) {
    return (
      <div className="builder-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/developer/dashboard')} className="btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const selectedComponent = components.find(c => c.id === selectedComponentId) || null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="builder-layout">
        {page && (
          <BuilderHeader 
            page={page} 
            onBack={() => navigate('/developer/dashboard')} 
            onSave={handleSave}
            onPreview={handlePreview}
            onSubmitForValidation={handleSubmitForValidation}
            submitting={submitting}
            saving={saving}
          />
        )}
        
        {successMessage && (
          <div className="builder-success-toast">
            {successMessage}
          </div>
        )}
        
        {error && page && (
          <div className="builder-error-toast">
            {error}
          </div>
        )}

        <div className="builder-main">
          <ComponentSidebar onAddComponent={handleAddComponent} />
          
          <BuilderCanvas 
            components={components} 
            selectedComponentId={selectedComponentId} 
            onSelectComponent={handleSelectComponent}
          />
          
          <PropertiesPanel 
            selectedComponent={selectedComponent}
            onUpdateProps={handleUpdateComponent}
            onUpdateStyle={handleUpdateComponentStyle}
            onUpdateLayout={handleUpdateComponentLayout}
            onDelete={handleDeleteComponent}
          />
        </div>
      </div>
      {createPortal(
        <DragOverlay zIndex={2000} dropAnimation={null}>
          {activeSidebarType ? (
            <div className="drag-overlay-item">
              {activeSidebarType}
            </div>
          ) : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
};

export default BuilderPage;
