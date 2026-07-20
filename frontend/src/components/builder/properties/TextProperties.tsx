
import type { BuilderComponent, BuilderComponentStyle, BuilderTextAlign } from '../../../types/page';

interface TextPropertiesProps {
  component: BuilderComponent;
  onUpdateProps: (componentId: string, newProps: Record<string, unknown>) => void;
  onUpdateStyle?: (componentId: string, key: any, value: any) => void;
}

const TextProperties = ({ component, onUpdateProps, onUpdateStyle }: TextPropertiesProps) => {
  const handlePropChange = (key: string, value: any) => {
    onUpdateProps(component.id, {
      ...component.props,
      [key]: value
    });
  };

  const handleStyleChange = <K extends keyof BuilderComponentStyle>(key: K, value: BuilderComponentStyle[K]) => {
    if (onUpdateStyle) {
      onUpdateStyle(component.id, key, value);
    }
  };

  return (
    <>
      <div className="prop-group">
        <label style={{ fontWeight: 600, marginTop: '10px', display: 'block', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>Content</label>
        <label>Text content</label>
        <input 
          type="text" 
          value={(component.props.text as string) ?? ''} 
          onChange={(e) => handlePropChange('text', e.target.value)} 
        />
      </div>
      
      <div className="prop-group">
        <label style={{ fontWeight: 600, marginTop: '10px', display: 'block', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>Typography</label>
        
        <label>Font family</label>
        <select 
          value={component.style?.fontFamily ?? "Inter"} 
          onChange={(e) => handleStyleChange('fontFamily', e.target.value as any)}
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
          value={component.style?.fontStyle ?? 'normal'} 
          onChange={(e) => handleStyleChange('fontStyle', e.target.value as any)}
        >
          <option value="normal">Normal</option>
          <option value="italic">Italic</option>
        </select>

        <label>Font size (px)</label>
        <input 
          type="number" 
          min={8} max={72}
          value={component.style?.fontSize ?? 16} 
          onChange={(e) => {
            const val = e.currentTarget.valueAsNumber;
            if (!Number.isNaN(val)) handleStyleChange('fontSize', val);
          }} 
        />

        <label>Font weight</label>
        <select 
          value={component.style?.fontWeight ?? 400} 
          onChange={(e) => handleStyleChange('fontWeight', parseInt(e.target.value) as any)}
        >
          <option value={400}>400 (Normal)</option>
          <option value={500}>500 (Medium)</option>
          <option value={600}>600 (Semi-bold)</option>
          <option value={700}>700 (Bold)</option>
        </select>

        <label>Text align</label>
        <select 
          value={component.style?.textAlign ?? 'left'} 
          onChange={(e) => handleStyleChange('textAlign', e.target.value as BuilderTextAlign)}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>

        <label>Text color</label>
        <input 
          type="color" 
          value={component.style?.color ?? '#334155'} 
          onChange={(e) => handleStyleChange('color', e.target.value)} 
        />
      </div>

      <div className="prop-group">
        <label style={{ fontWeight: 600, marginTop: '10px', display: 'block', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>Appearance</label>
        <label>Background color</label>
        <input 
          type="color" 
          value={component.style?.backgroundColor === 'transparent' ? '#ffffff' : (component.style?.backgroundColor ?? '#ffffff')} 
          onChange={(e) => handleStyleChange('backgroundColor', e.target.value)} 
        />
        
        <label>Padding (px)</label>
        <input 
          type="number" 
          min={0} max={100}
          value={component.style?.padding ?? 12} 
          onChange={(e) => {
            const val = e.currentTarget.valueAsNumber;
            if (!Number.isNaN(val)) handleStyleChange('padding', val);
          }} 
        />
        
        <label>Border radius (px)</label>
        <input 
          type="number" 
          min={0} max={100}
          value={component.style?.borderRadius ?? 6} 
          onChange={(e) => {
            const val = e.currentTarget.valueAsNumber;
            if (!Number.isNaN(val)) handleStyleChange('borderRadius', val);
          }} 
        />
      </div>
    </>
  );
};

export default TextProperties;
