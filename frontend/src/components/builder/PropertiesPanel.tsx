import type { BuilderComponent, BuilderComponentLayout } from '../../types/page';
import '../../styles/builder.css';
import TextProperties from './properties/TextProperties';
import ButtonProperties from './properties/ButtonProperties';
import InputProperties from './properties/InputProperties';
import CardProperties from './properties/CardProperties';
import TableProperties from './properties/TableProperties';

interface PropertiesPanelProps {
  selectedComponent: BuilderComponent | null;
  onUpdateProps: (componentId: string, newProps: Record<string, unknown>) => void;
  onUpdateStyle?: (componentId: string, key: any, value: any) => void;
  onUpdateLayout?: <K extends keyof BuilderComponentLayout>(componentId: string, key: K, value: BuilderComponentLayout[K]) => void;
  onDelete: (componentId: string) => void;
}

const PropertiesPanel = ({ selectedComponent, onUpdateProps, onUpdateStyle, onUpdateLayout, onDelete }: PropertiesPanelProps) => {
  if (!selectedComponent) {
    return (
      <div className="properties-panel empty">
        <p>Select a component to edit its properties.</p>
      </div>
    );
  }

  const handleLayoutChange = <K extends keyof BuilderComponentLayout>(key: K, value: BuilderComponentLayout[K]) => {
    if (onUpdateLayout) {
      onUpdateLayout(selectedComponent.id, key, value);
    }
  };

  const renderProps = () => {
    switch (selectedComponent.type) {
      case 'Text':
        return <TextProperties component={selectedComponent} onUpdateProps={onUpdateProps} onUpdateStyle={onUpdateStyle} />;
      case 'Button':
        return <ButtonProperties component={selectedComponent} onUpdateProps={onUpdateProps} onUpdateStyle={onUpdateStyle} />;
      case 'Input':
        return <InputProperties component={selectedComponent} onUpdateProps={onUpdateProps} onUpdateStyle={onUpdateStyle} />;
      case 'Card':
        return <CardProperties component={selectedComponent} onUpdateProps={onUpdateProps} onUpdateStyle={onUpdateStyle} />;
      case 'Table':
        return <TableProperties component={selectedComponent} onUpdateProps={onUpdateProps} onUpdateStyle={onUpdateStyle} />;
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
          <div className="prop-group">
            <label style={{ fontWeight: 600, marginTop: '10px', display: 'block', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>Position</label>
            <label>X (px)</label>
            <input 
              type="number" 
              min={0} max={1200}
              value={selectedComponent.layout?.x ?? 0} 
              onChange={(e) => {
                const val = e.currentTarget.valueAsNumber;
                if (!Number.isNaN(val)) handleLayoutChange('x', val);
              }} 
            />
            
            <label>Y (px)</label>
            <input 
              type="number" 
              min={0} max={800}
              value={selectedComponent.layout?.y ?? 0} 
              onChange={(e) => {
                const val = e.currentTarget.valueAsNumber;
                if (!Number.isNaN(val)) handleLayoutChange('y', val);
              }} 
            />
          </div>

          <div className="prop-group">
            <label style={{ fontWeight: 600, marginTop: '10px', display: 'block', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>Dimensions</label>
            <label>Width (px)</label>
            <input 
              type="number" 
              min={50} max={1200}
              value={selectedComponent.layout?.width ?? 300} 
              onChange={(e) => {
                const val = e.currentTarget.valueAsNumber;
                if (!Number.isNaN(val)) handleLayoutChange('width', val);
              }} 
            />
            
            <label>Height (px)</label>
            <input 
              type="number" 
              min={20} max={1000}
              value={selectedComponent.layout?.height ?? 60} 
              onChange={(e) => {
                const val = e.currentTarget.valueAsNumber;
                if (!Number.isNaN(val)) handleLayoutChange('height', val);
              }} 
            />
          </div>

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
