import type { BuilderComponent } from '../../types/page';
import '../../styles/builder.css';

interface PropertiesPanelProps {
  selectedComponent: BuilderComponent | null;
  onUpdateProps: (componentId: string, newProps: Record<string, unknown>) => void;
  onDelete: (componentId: string) => void;
}

const PropertiesPanel = ({ selectedComponent, onUpdateProps, onDelete }: PropertiesPanelProps) => {
  if (!selectedComponent) {
    return (
      <div className="properties-panel empty">
        <p>Select a component to edit its properties.</p>
      </div>
    );
  }

  const handlePropChange = (key: string, value: any) => {
    onUpdateProps(selectedComponent.id, {
      ...selectedComponent.props,
      [key]: value
    });
  };

  const renderProps = () => {
    switch (selectedComponent.type) {
      case 'Text':
        return (
          <div className="prop-group">
            <label>Text</label>
            <input 
              type="text" 
              value={(selectedComponent.props.text as string) || ''} 
              onChange={(e) => handlePropChange('text', e.target.value)} 
            />
          </div>
        );
      case 'Button':
        return (
          <div className="prop-group">
            <label>Label</label>
            <input 
              type="text" 
              value={(selectedComponent.props.label as string) || ''} 
              onChange={(e) => handlePropChange('label', e.target.value)} 
            />
          </div>
        );
      case 'Input':
        return (
          <div className="prop-group">
            <label>Placeholder</label>
            <input 
              type="text" 
              value={(selectedComponent.props.placeholder as string) || ''} 
              onChange={(e) => handlePropChange('placeholder', e.target.value)} 
            />
          </div>
        );
      case 'Card':
        return (
          <>
            <div className="prop-group">
              <label>Title</label>
              <input 
                type="text" 
                value={(selectedComponent.props.title as string) || ''} 
                onChange={(e) => handlePropChange('title', e.target.value)} 
              />
            </div>
            <div className="prop-group">
              <label>Content</label>
              <textarea 
                value={(selectedComponent.props.content as string) || ''} 
                onChange={(e) => handlePropChange('content', e.target.value)} 
              />
            </div>
          </>
        );
      case 'Table':
        return (
          <div className="prop-group">
            <label>Columns (comma separated)</label>
            <input 
              type="text" 
              value={((selectedComponent.props.columns as string[]) || []).join(', ')} 
              onChange={(e) => {
                const val = e.target.value;
                const columns = val.split(',').map(s => s.trim()).filter(Boolean);
                handlePropChange('columns', columns);
              }} 
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="properties-panel">
      <h3>Properties</h3>
      <div className="properties-form">
        {renderProps()}
      </div>
      <button 
        className="btn-danger mt-4" 
        onClick={() => onDelete(selectedComponent.id)}
      >
        Delete component
      </button>
    </div>
  );
};

export default PropertiesPanel;
