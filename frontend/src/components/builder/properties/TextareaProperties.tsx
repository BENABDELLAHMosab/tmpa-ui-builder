import type { BuilderComponent } from '../../../types/page';
import TypographyProperties from './TypographyProperties';
import { TEXTAREA_STYLE_DEFAULTS } from '../../../utils/textarea';

const TEXTAREA_TYPOGRAPHY_DEFAULTS = {
  fontFamily: TEXTAREA_STYLE_DEFAULTS.fontFamily,
  fontStyle: TEXTAREA_STYLE_DEFAULTS.fontStyle,
  fontSize: TEXTAREA_STYLE_DEFAULTS.fontSize,
  fontWeight: TEXTAREA_STYLE_DEFAULTS.fontWeight,
  textAlign: TEXTAREA_STYLE_DEFAULTS.textAlign,
  color: TEXTAREA_STYLE_DEFAULTS.color
};

interface TextareaPropertiesProps {
  component: BuilderComponent;
  onUpdateProps: (componentId: string, newProps: Record<string, unknown>) => void;
  onUpdateStyle?: (componentId: string, key: any, value: any) => void;
}

const TextareaProperties = ({ component, onUpdateProps, onUpdateStyle }: TextareaPropertiesProps) => {
  const textareaProps = component.props;
  const textareaStyle = component.style || {};

  const handleUpdateProps = (key: string, value: any) => {
    onUpdateProps(component.id, {
      ...textareaProps,
      [key]: value
    });
  };

  const handleUpdateStyle = (key: string, value: any) => {
    if (onUpdateStyle) {
      onUpdateStyle(component.id, key, value);
    }
  };

  return (
    <>
      <div className="prop-group">
        <label style={{ fontWeight: 600, marginTop: '10px', display: 'block', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>Content & behavior</label>
        
        <label>Label</label>
        <input 
          type="text" 
          value={(textareaProps.label as string) ?? ''} 
          onChange={(e) => handleUpdateProps('label', e.target.value)} 
        />

        <label>Name</label>
        <input 
          type="text" 
          value={(textareaProps.name as string) ?? ''} 
          onChange={(e) => handleUpdateProps('name', e.target.value)} 
        />

        <label>Placeholder</label>
        <input 
          type="text" 
          value={(textareaProps.placeholder as string) ?? ''} 
          onChange={(e) => handleUpdateProps('placeholder', e.target.value)} 
        />

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            checked={(textareaProps.required as boolean) ?? false} 
            onChange={(e) => handleUpdateProps('required', e.currentTarget.checked)} 
            style={{ margin: 0, width: 'auto' }}
          />
          Required
        </label>

        <label>Default value</label>
        <textarea 
          value={(textareaProps.defaultValue as string) ?? ''} 
          onChange={(e) => handleUpdateProps('defaultValue', e.currentTarget.value)}
          style={{ minHeight: '60px', resize: 'vertical' }}
        />
      </div>

      <TypographyProperties 
        style={textareaStyle}
        defaults={TEXTAREA_TYPOGRAPHY_DEFAULTS}
        onChange={handleUpdateStyle}
      />

      <div className="prop-group">
        <label style={{ fontWeight: 600, marginTop: '10px', display: 'block', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>Appearance</label>
        
        <label>Background color</label>
        <input 
          type="color" 
          value={textareaStyle.backgroundColor ?? TEXTAREA_STYLE_DEFAULTS.backgroundColor} 
          onChange={(e) => handleUpdateStyle('backgroundColor', e.target.value)} 
        />

        <label>Border color</label>
        <input 
          type="color" 
          value={textareaStyle.borderColor ?? TEXTAREA_STYLE_DEFAULTS.borderColor} 
          onChange={(e) => handleUpdateStyle('borderColor', e.target.value)} 
        />

        <label>Border width (px)</label>
        <input 
          type="number" 
          min={0} max={10}
          value={textareaStyle.borderWidth ?? TEXTAREA_STYLE_DEFAULTS.borderWidth} 
          onChange={(e) => {
            const val = e.currentTarget.valueAsNumber;
            if (!Number.isNaN(val)) handleUpdateStyle('borderWidth', val ?? 0);
          }} 
        />

        <label>Border radius (px)</label>
        <input 
          type="number" 
          min={0} max={100}
          value={textareaStyle.borderRadius ?? TEXTAREA_STYLE_DEFAULTS.borderRadius} 
          onChange={(e) => {
            const val = e.currentTarget.valueAsNumber;
            if (!Number.isNaN(val)) handleUpdateStyle('borderRadius', val ?? 0);
          }} 
        />
        
        <label>Padding (px)</label>
        <input 
          type="number" 
          min={0} max={40}
          value={textareaStyle.padding ?? TEXTAREA_STYLE_DEFAULTS.padding} 
          onChange={(e) => {
            const val = e.currentTarget.valueAsNumber;
            if (!Number.isNaN(val)) handleUpdateStyle('padding', val ?? 0);
          }} 
        />
      </div>
    </>
  );
};

export default TextareaProperties;
