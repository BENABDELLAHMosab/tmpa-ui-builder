import type { BuilderComponent } from '../../../types/page';
import TypographyProperties, { TEXT_TYPOGRAPHY_DEFAULTS } from './TypographyProperties';
import type { TypographyStyleKey } from './TypographyProperties';

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

  const handleTypographyChange = <K extends TypographyStyleKey>(key: K, value: any) => {
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
      
      <TypographyProperties 
        style={component.style} 
        defaults={TEXT_TYPOGRAPHY_DEFAULTS} 
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
        
        <label>Padding (px)</label>
        <input 
          type="number" 
          min={0} max={100}
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
          value={component.style?.borderRadius ?? 6} 
          onChange={(e) => {
            const val = e.currentTarget.valueAsNumber;
            if (!Number.isNaN(val) && onUpdateStyle) onUpdateStyle(component.id, 'borderRadius', val);
          }} 
        />
      </div>
    </>
  );
};

export default TextProperties;
