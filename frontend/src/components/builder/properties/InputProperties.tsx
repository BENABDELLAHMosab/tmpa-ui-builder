import type { BuilderComponent, BuilderTextAlign, BuilderInputType } from '../../../types/page';
import { BUILDER_INPUT_TYPES } from '../../../types/page';

interface InputPropertiesProps {
  component: BuilderComponent;
  onUpdateProps: (componentId: string, newProps: Record<string, unknown>) => void;
  onUpdateStyle?: (componentId: string, key: any, value: any) => void;
}

const InputProperties = ({ component, onUpdateProps, onUpdateStyle }: InputPropertiesProps) => {
  const handlePropChange = (key: string, value: any) => {
    onUpdateProps(component.id, {
      ...component.props,
      [key]: value
    });
  };

  const handleStyleChange = (key: string, value: any) => {
    if (onUpdateStyle) {
      onUpdateStyle(component.id, key, value);
    }
  };

  return (
    <>
      <div className="prop-group">
        <label style={{ fontWeight: 600, marginTop: '10px', display: 'block', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>Content & Behavior</label>
        
        <label>Label</label>
        <input 
          type="text" 
          value={(component.props.label as string) ?? ''} 
          onChange={(e) => handlePropChange('label', e.target.value)} 
        />

        <label>Placeholder</label>
        <input 
          type="text" 
          value={(component.props.placeholder as string) ?? ''} 
          onChange={(e) => handlePropChange('placeholder', e.target.value)} 
        />

        <label>Input Type</label>
        <select 
          value={(component.props.inputType as string) ?? 'text'} 
          onChange={(e) => handlePropChange('inputType', e.target.value as BuilderInputType)}
        >
          {BUILDER_INPUT_TYPES.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            checked={(component.props.required as boolean) ?? false} 
            onChange={(e) => handlePropChange('required', e.currentTarget.checked)} 
            style={{ margin: 0, width: 'auto' }}
          />
          Required
        </label>
      </div>
      
      <div className="prop-group">
        <label style={{ fontWeight: 600, marginTop: '10px', display: 'block', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>Typography</label>
        
        <label>Font family</label>
        <select 
          value={component.style?.fontFamily ?? "Inter"} 
          onChange={(e) => handleStyleChange('fontFamily', e.target.value)}
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
          onChange={(e) => handleStyleChange('fontStyle', e.target.value)}
        >
          <option value="normal">Normal</option>
          <option value="italic">Italic</option>
        </select>

        <label>Font size (px)</label>
        <input 
          type="number" 
          min={8} max={72}
          value={component.style?.fontSize ?? 14} 
          onChange={(e) => {
            const val = e.currentTarget.valueAsNumber;
            if (!Number.isNaN(val)) handleStyleChange('fontSize', val);
          }} 
        />

        <label>Font weight</label>
        <select 
          value={component.style?.fontWeight ?? 400} 
          onChange={(e) => handleStyleChange('fontWeight', parseInt(e.target.value))}
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
          value={component.style?.color ?? '#0f172a'} 
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
        
        <label>Border color</label>
        <input 
          type="color" 
          value={component.style?.borderColor === 'transparent' ? '#cbd5e1' : (component.style?.borderColor ?? '#cbd5e1')} 
          onChange={(e) => handleStyleChange('borderColor', e.target.value)} 
        />

        <label>Border width (px)</label>
        <input 
          type="number" 
          min={0} max={10}
          value={component.style?.borderWidth ?? 1} 
          onChange={(e) => {
            const val = e.currentTarget.valueAsNumber;
            if (!Number.isNaN(val)) handleStyleChange('borderWidth', val);
          }} 
        />
        
        <label>Padding (px)</label>
        <input 
          type="number" 
          min={0} max={40}
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
          value={component.style?.borderRadius ?? 8} 
          onChange={(e) => {
            const val = e.currentTarget.valueAsNumber;
            if (!Number.isNaN(val)) handleStyleChange('borderRadius', val);
          }} 
        />
      </div>
    </>
  );
};

export default InputProperties;
