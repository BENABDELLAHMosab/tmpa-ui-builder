import type { BuilderComponent, BuilderComponentStyle, BuilderComponentLayout, BuilderFontWeight, BuilderTextAlign, BuilderFontFamily, BuilderFontStyle } from '../../types/page';
import '../../styles/builder.css';

interface PropertiesPanelProps {
  selectedComponent: BuilderComponent | null;
  onUpdateProps: (componentId: string, newProps: Record<string, unknown>) => void;
  onUpdateStyle?: <K extends keyof BuilderComponentStyle>(componentId: string, key: K, value: BuilderComponentStyle[K]) => void;
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

  const handlePropChange = (key: string, value: any) => {
    onUpdateProps(selectedComponent.id, {
      ...selectedComponent.props,
      [key]: value
    });
  };

  const handleStyleChange = <K extends keyof BuilderComponentStyle>(key: K, value: BuilderComponentStyle[K]) => {
    if (onUpdateStyle) {
      onUpdateStyle(selectedComponent.id, key, value);
    }
  };

  const handleLayoutChange = <K extends keyof BuilderComponentLayout>(key: K, value: BuilderComponentLayout[K]) => {
    if (onUpdateLayout) {
      onUpdateLayout(selectedComponent.id, key, value);
    }
  };

  const renderProps = () => {
    switch (selectedComponent.type) {
      case 'Text':
        return (
          <>
            <div className="prop-group">
              <label style={{ fontWeight: 600, marginTop: '10px', display: 'block', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>Content</label>
              <label>Text content</label>
              <input 
                type="text" 
                value={(selectedComponent.props.text as string) || ''} 
                onChange={(e) => handlePropChange('text', e.target.value)} 
              />
            </div>
            
            <div className="prop-group">
              <label style={{ fontWeight: 600, marginTop: '10px', display: 'block', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>Typography</label>
              
              <label>Font family</label>
              <select 
                value={selectedComponent.style?.fontFamily ?? "Inter"} 
                onChange={(e) => handleStyleChange('fontFamily', e.target.value as BuilderFontFamily)}
              >
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
                <option value="Open Sans">Open Sans</option>
                <option value="Montserrat">Montserrat</option>
                <option value="Calibri">Calibri</option>
                <option value="Arial">Arial</option>
                <option value="system-ui">System UI</option>
              </select>

              <label>Font style</label>
              <select 
                value={selectedComponent.style?.fontStyle ?? "normal"} 
                onChange={(e) => handleStyleChange('fontStyle', e.target.value as BuilderFontStyle)}
              >
                <option value="normal">Normal</option>
                <option value="italic">Italic</option>
              </select>

              <label>Font size (px)</label>
              <input 
                type="number" 
                min={8} max={96}
                value={selectedComponent.style?.fontSize ?? 16} 
                onChange={(e) => {
                  const val = e.currentTarget.valueAsNumber;
                  if (!Number.isNaN(val)) handleStyleChange('fontSize', val);
                }} 
              />
              
              <label>Font weight</label>
              <select 
                value={selectedComponent.style?.fontWeight ?? 400} 
                onChange={(e) => handleStyleChange('fontWeight', parseInt(e.target.value) as BuilderFontWeight)}
              >
                <option value={400}>400 (Regular)</option>
                <option value={500}>500 (Medium)</option>
                <option value={600}>600 (Semi-bold)</option>
                <option value={700}>700 (Bold)</option>
              </select>

              <label>Text align</label>
              <select 
                value={selectedComponent.style?.textAlign ?? 'left'} 
                onChange={(e) => handleStyleChange('textAlign', e.target.value as BuilderTextAlign)}
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>

              <label>Text color</label>
              <input 
                type="color" 
                value={selectedComponent.style?.color ?? '#334155'} 
                onChange={(e) => handleStyleChange('color', e.target.value)} 
              />
            </div>

            <div className="prop-group">
              <label style={{ fontWeight: 600, marginTop: '10px', display: 'block', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>Appearance</label>
              <label>Background color</label>
              <input 
                type="color" 
                value={selectedComponent.style?.backgroundColor === 'transparent' ? '#ffffff' : (selectedComponent.style?.backgroundColor ?? '#ffffff')} 
                onChange={(e) => handleStyleChange('backgroundColor', e.target.value)} 
              />
              
              <label>Padding (px)</label>
              <input 
                type="number" 
                min={0} max={100}
                value={selectedComponent.style?.padding ?? 12} 
                onChange={(e) => {
                  const val = e.currentTarget.valueAsNumber;
                  if (!Number.isNaN(val)) handleStyleChange('padding', val);
                }} 
              />
              
              <label>Border radius (px)</label>
              <input 
                type="number" 
                min={0} max={100}
                value={selectedComponent.style?.borderRadius ?? 6} 
                onChange={(e) => {
                  const val = e.currentTarget.valueAsNumber;
                  if (!Number.isNaN(val)) handleStyleChange('borderRadius', val);
                }} 
              />
            </div>
          </>
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
