import type { BuilderComponent, BuilderInputType } from '../../../types/page';
import { BUILDER_INPUT_TYPES } from '../../../types/page';
import TypographyProperties, { INPUT_TYPOGRAPHY_DEFAULTS } from './TypographyProperties';
import type { TypographyStyleKey } from './TypographyProperties';

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

  const handleTypographyChange = <K extends TypographyStyleKey>(key: K, value: any) => {
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
      
      <TypographyProperties 
        style={component.style} 
        defaults={INPUT_TYPOGRAPHY_DEFAULTS} 
        onChange={handleTypographyChange} 
      />

      <div className="prop-group">
        <label style={{ fontWeight: 600, marginTop: '10px', display: 'block', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>Appearance</label>
        <label>Background color</label>
        <input 
          type="color" 
          value={component.style?.backgroundColor === 'transparent' ? '#ffffff' : (component.style?.backgroundColor ?? '#ffffff')} 
          onChange={(e) => {
            if (onUpdateStyle) onUpdateStyle(component.id, 'backgroundColor', e.target.value);
          }} 
        />
        
        <label>Border color</label>
        <input 
          type="color" 
          value={component.style?.borderColor === 'transparent' ? '#cbd5e1' : (component.style?.borderColor ?? '#cbd5e1')} 
          onChange={(e) => {
            if (onUpdateStyle) onUpdateStyle(component.id, 'borderColor', e.target.value);
          }} 
        />

        <label>Border width (px)</label>
        <input 
          type="number" 
          min={0} max={10}
          value={component.style?.borderWidth ?? 1} 
          onChange={(e) => {
            const val = e.currentTarget.valueAsNumber;
            if (!Number.isNaN(val) && onUpdateStyle) onUpdateStyle(component.id, 'borderWidth', val);
          }} 
        />
        
        <label>Padding (px)</label>
        <input 
          type="number" 
          min={0} max={40}
          value={component.style?.padding ?? 12} 
          onChange={(e) => {
            const val = e.currentTarget.valueAsNumber;
            if (!Number.isNaN(val) && onUpdateStyle) onUpdateStyle(component.id, 'padding', val);
          }} 
        />
        
        <label>Border radius (px)</label>
        <input 
          type="number" 
          min={0} max={100}
          value={component.style?.borderRadius ?? 8} 
          onChange={(e) => {
            const val = e.currentTarget.valueAsNumber;
            if (!Number.isNaN(val) && onUpdateStyle) onUpdateStyle(component.id, 'borderRadius', val);
          }} 
        />
      </div>
    </>
  );
};

export default InputProperties;
