import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pageService } from '../services/page.service';
import type { UiPage, BuilderComponent, BuilderComponentType } from '../types/page';
import BuilderHeader from '../components/builder/BuilderHeader';
import ComponentSidebar from '../components/builder/ComponentSidebar';
import BuilderCanvas from '../components/builder/BuilderCanvas';
import PropertiesPanel from '../components/builder/PropertiesPanel';
import '../styles/builder.css';

const BuilderPage = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  
  const [page, setPage] = useState<UiPage | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [components, setComponents] = useState<BuilderComponent[]>([]);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  
  const [saving, setSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

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

  const handleAddComponent = (type: BuilderComponentType) => {
    const newId = `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    let defaultProps: Record<string, unknown> = {};

    switch (type) {
      case 'Text': defaultProps = { text: "New text" }; break;
      case 'Button': defaultProps = { label: "Button" }; break;
      case 'Input': defaultProps = { placeholder: "Enter value" }; break;
      case 'Card': defaultProps = { title: "Card title", content: "Card content" }; break;
      case 'Table': defaultProps = { columns: ["Column 1", "Column 2"] }; break;
    }

    const newComponent: BuilderComponent = {
      id: newId,
      type,
      props: defaultProps
    };

    setComponents([...components, newComponent]);
    setSelectedComponentId(newId);
  };

  const handleSelectComponent = (componentId: string) => {
    setSelectedComponentId(componentId);
  };

  const handleUpdateComponent = (componentId: string, newProps: Record<string, unknown>) => {
    setComponents(components.map(comp => 
      comp.id === componentId ? { ...comp, props: newProps } : comp
    ));
  };

  const handleDeleteComponent = (componentId: string) => {
    setComponents(components.filter(comp => comp.id !== componentId));
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
    <div className="builder-layout">
      {page && (
        <BuilderHeader 
          page={page} 
          onBack={() => navigate('/developer/dashboard')} 
          onSave={handleSave}
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
          onDelete={handleDeleteComponent}
        />
      </div>
    </div>
  );
};

export default BuilderPage;
