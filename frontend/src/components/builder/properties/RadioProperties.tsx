import type { BuilderComponent } from '../../../types/page';
import TypographyProperties from './TypographyProperties';
import { RADIO_STYLE_DEFAULTS } from '../../../utils/radio';

const RADIO_TYPOGRAPHY_DEFAULTS = {
  fontFamily: RADIO_STYLE_DEFAULTS.fontFamily,
  fontStyle: RADIO_STYLE_DEFAULTS.fontStyle,
  fontSize: RADIO_STYLE_DEFAULTS.fontSize,
  fontWeight: RADIO_STYLE_DEFAULTS.fontWeight,
  textAlign: RADIO_STYLE_DEFAULTS.textAlign,
  color: RADIO_STYLE_DEFAULTS.color
};

interface RadioPropertiesProps {
  component: BuilderComponent;
  onUpdateProps: (componentId: string, newProps: Record<string, unknown>) => void;
  onUpdateStyle?: (componentId: string, key: any, value: any) => void;
}

const RadioProperties = ({ component, onUpdateProps, onUpdateStyle }: RadioPropertiesProps) => {
  const radioProps = component.props;
  const radioStyle = component.style || {};

  const handleUpdateProps = (key: string, value: any) => {
    onUpdateProps(component.id, {
      ...radioProps,
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
          value={(radioProps.label as string) ?? ''} 
          onChange={(e) => handleUpdateProps('label', e.target.value)} 
        />

        <label>Name</label>
        <input 
          type="text" 
          value={(radioProps.name as string) ?? ''} 
          onChange={(e) => handleUpdateProps('name', e.target.value)} 
        />

        <label>Value</label>
        <input 
          type="text" 
          value={(radioProps.value as string) ?? 'on'} 
          onChange={(e) => handleUpdateProps('value', e.target.value)} 
        />

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            checked={(radioProps.required as boolean) ?? false} 
            onChange={(e) => handleUpdateProps('required', e.currentTarget.checked)} 
            style={{ margin: 0, width: 'auto' }}
          />
          Required
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            checked={(radioProps.defaultChecked as boolean) ?? false} 
            onChange={(e) => handleUpdateProps('defaultChecked', e.currentTarget.checked)} 
            style={{ margin: 0, width: 'auto' }}
          />
          Selected by default
        </label>
      </div>

      <TypographyProperties 
        style={radioStyle}
        defaults={RADIO_TYPOGRAPHY_DEFAULTS}
        onChange={handleUpdateStyle}
      />

      <div className="prop-group">
        <label style={{ fontWeight: 600, marginTop: '10px', display: 'block', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>Appearance</label>
        
        <label>Accent color</label>
        <input 
          type="color" 
          value={radioStyle.accentColor ?? RADIO_STYLE_DEFAULTS.accentColor} 
          onChange={(e) => handleUpdateStyle('accentColor', e.target.value)} 
        />
        
        <label>Padding (px)</label>
        <input 
          type="number" 
          min={0} max={40}
          value={radioStyle.padding ?? RADIO_STYLE_DEFAULTS.padding} 
          onChange={(e) => {
            const val = e.currentTarget.valueAsNumber;
            if (!Number.isNaN(val)) handleUpdateStyle('padding', val ?? 0);
          }} 
        />
      </div>
    </>
  );
};

export default RadioProperties;
