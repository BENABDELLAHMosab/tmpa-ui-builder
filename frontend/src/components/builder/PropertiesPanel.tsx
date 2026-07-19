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
      <div className="properties-header">
        <h3>Properties</h3>
        <span className="properties-badge">{selectedComponent.type}</span>
      </div>
      
      <div className="properties-content">
        <div className="properties-form">
          {renderProps()}
        </div>
      </div>

      <div className="properties-footer">
        <button 
          className="btn btn-danger" 
          onClick={() => onDelete(selectedComponent.id)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
            <path d="M3 6h18"></path>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
          </svg>
          Delete component
        </button>
      </div>
    </div>
  );
};

export default PropertiesPanel;
