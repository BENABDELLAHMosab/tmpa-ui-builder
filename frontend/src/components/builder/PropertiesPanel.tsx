import type { BuilderComponent, BuilderComponentLayout } from '../../types/page';
import '../../styles/builder.css';
import TextProperties from './properties/TextProperties';
import ButtonProperties from './properties/ButtonProperties';
import InputProperties from './properties/InputProperties';
import CardProperties from './properties/CardProperties';
import TableProperties from './properties/TableProperties';
import SelectProperties from './properties/SelectProperties';
import CheckboxProperties from './properties/CheckboxProperties';
import RadioProperties from './properties/RadioProperties';
import TextareaProperties from './properties/TextareaProperties';
import ImageProperties from './properties/ImageProperties';
import DividerProperties from './properties/DividerProperties';
import ContainerProperties from './properties/ContainerProperties';

interface PropertiesPanelProps {
  selectedComponent: BuilderComponent | null;
  onUpdateProps: (componentId: string, newProps: Record<string, unknown>) => void;
  onUpdateStyle?: (componentId: string, key: any, value: any) => void;
  onUpdateLayout?: <K extends keyof BuilderComponentLayout>(componentId: string, key: K, value: BuilderComponentLayout[K]) => void;
  onDelete: (componentId: string) => void;
  onSaveAsComponent?: (componentId: string) => void;
  formatPainterSourceId?: string | null;
  onToggleFormatPainter?: (id: string | null) => void;
}

const PropertiesPanel = ({ 
  selectedComponent, 
  onUpdateProps, 
  onUpdateStyle, 
  onUpdateLayout, 
  onDelete, 
  onSaveAsComponent,
  formatPainterSourceId,
  onToggleFormatPainter
}: PropertiesPanelProps) => {
  if (!selectedComponent) {
    return (
      <div className="properties-panel">
        <h3 style={{ padding: '0 1rem' }}>Properties</h3>
        <div className="properties-empty">
          Select a component to edit its properties
        </div>
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
      case 'Select':
        return <SelectProperties component={selectedComponent} onUpdateProps={onUpdateProps} onUpdateStyle={onUpdateStyle} />;
      case 'Checkbox':
        return <CheckboxProperties component={selectedComponent} onUpdateProps={onUpdateProps} onUpdateStyle={onUpdateStyle} />;
      case 'Radio':
        return <RadioProperties component={selectedComponent} onUpdateProps={onUpdateProps} onUpdateStyle={onUpdateStyle} />;
      case 'Textarea':
        return <TextareaProperties component={selectedComponent} onUpdateProps={onUpdateProps} onUpdateStyle={onUpdateStyle} />;
      case 'Image':
        return <ImageProperties component={selectedComponent} onUpdateProps={onUpdateProps} onUpdateStyle={onUpdateStyle} />;
      case 'Divider':
        return <DividerProperties component={selectedComponent} onUpdateStyle={onUpdateStyle} />;
      case 'Container':
        return <ContainerProperties component={selectedComponent} onUpdateStyle={onUpdateStyle} />;
      default:
        return <div style={{ padding: '16px', color: '#64748b' }}>No properties available for this component type.</div>;
    }
  };

  return (
    <div className="properties-panel">
      <div className="properties-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h3 style={{ margin: 0 }}>Properties</h3>
          <span className="properties-badge">{selectedComponent.type}</span>
        </div>
        <button
          className={`btn ${formatPainterSourceId === selectedComponent.id ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => onToggleFormatPainter?.(formatPainterSourceId ? null : selectedComponent.id)}
          title="Format Painter"
          style={{ 
            padding: '4px 8px', 
            minWidth: 'auto',
            height: '28px',
            backgroundColor: formatPainterSourceId === selectedComponent.id ? '#1e3a66' : '#ffffff',
            color: formatPainterSourceId === selectedComponent.id ? '#ffffff' : '#475569',
            border: `1px solid ${formatPainterSourceId === selectedComponent.id ? '#1e3a66' : '#cbd5e1'}`
          }}
        >
          🖌️
        </button>
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

          {/* SAVE AS COMPONENT SECTION */}
          {selectedComponent.type === 'Container' && onSaveAsComponent && (
            <div className="prop-group" style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
              <button 
                type="button"
                className="btn btn-secondary" 
                onClick={() => onSaveAsComponent(selectedComponent.id)}
                style={{ width: '100%' }}
              >
                Save as component
              </button>
            </div>
          )}

          {/* DELETE SECTION */}
          <div className="prop-group" style={{ marginTop: selectedComponent.type === 'Container' ? '12px' : '24px', paddingTop: '16px', borderTop: selectedComponent.type === 'Container' ? 'none' : '1px solid #fee2e2' }}>
            <button 
              type="button"
              className="btn" 
              onClick={() => onDelete(selectedComponent.id)}
              style={{ 
                width: '100%', 
                backgroundColor: '#fee2e2', 
                color: '#ef4444', 
                borderColor: '#fca5a5' 
              }}
            >
              Delete Component
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertiesPanel;
