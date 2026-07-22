import type { BuilderComponent, BuilderComponentLayout } from '../../types/page';
import type { ComponentLayerInfo, LayerAction } from '../../utils/layers';
import '../../styles/builder.css';
import TextProperties from './properties/TextProperties';
import ButtonProperties from './properties/ButtonProperties';
import InputProperties from './properties/InputProperties';
import CardProperties from './properties/CardProperties';
import TableProperties from './properties/TableProperties';
import SelectProperties from './properties/SelectProperties';

interface PropertiesPanelProps {
  selectedComponent: BuilderComponent | null;
  layerInfo?: ComponentLayerInfo | null;
  onUpdateProps: (componentId: string, newProps: Record<string, unknown>) => void;
  onUpdateStyle?: (componentId: string, key: any, value: any) => void;
  onUpdateLayout?: <K extends keyof BuilderComponentLayout>(componentId: string, key: K, value: BuilderComponentLayout[K]) => void;
  onMoveLayer?: (componentId: string, action: LayerAction) => void;
  onDelete: (componentId: string) => void;
}

const PropertiesPanel = ({ selectedComponent, layerInfo, onUpdateProps, onUpdateStyle, onUpdateLayout, onMoveLayer, onDelete }: PropertiesPanelProps) => {
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
      default:
        return <div style={{ padding: '16px', color: '#64748b' }}>No properties available for this component type.</div>;
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

          {/* LAYER SECTION */}
          {layerInfo && onMoveLayer && (
            <div className="prop-group" style={{ marginTop: '24px' }}>
              <label style={{ fontWeight: 600, display: 'block', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginBottom: '8px' }}>
                Layer
              </label>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                Layer {layerInfo.level} of {layerInfo.total}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    type="button"
                    className="btn" 
                    style={{ flex: 1, padding: '4px' }}
                    onClick={() => onMoveLayer(selectedComponent.id, "bring-forward")}
                    disabled={layerInfo.isMax}
                  >
                    Bring forward
                  </button>
                  <button 
                    type="button"
                    className="btn" 
                    style={{ flex: 1, padding: '4px' }}
                    onClick={() => onMoveLayer(selectedComponent.id, "bring-to-front")}
                    disabled={layerInfo.isMax}
                  >
                    Bring to front
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    type="button"
                    className="btn" 
                    style={{ flex: 1, padding: '4px' }}
                    onClick={() => onMoveLayer(selectedComponent.id, "send-backward")}
                    disabled={layerInfo.isMin}
                  >
                    Send backward
                  </button>
                  <button 
                    type="button"
                    className="btn" 
                    style={{ flex: 1, padding: '4px' }}
                    onClick={() => onMoveLayer(selectedComponent.id, "send-to-back")}
                    disabled={layerInfo.isMin}
                  >
                    Send to back
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* DELETE SECTION */}
          <div className="prop-group" style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #fee2e2' }}>
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
