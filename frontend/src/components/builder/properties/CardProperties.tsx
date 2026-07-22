import type { BuilderComponent } from '../../../types/page';
import TypographyProperties from './TypographyProperties';

export const CARD_TYPOGRAPHY_DEFAULTS = {
  fontFamily: "Inter",
  fontStyle: "normal",
  fontSize: 14,
  fontWeight: 400,
  textAlign: "left",
  color: "#334155"
} as const;

interface CardPropertiesProps {
  component: BuilderComponent;
  onUpdateProps: (componentId: string, newProps: Record<string, unknown>) => void;
  onUpdateStyle?: (componentId: string, key: any, value: any) => void;
}

const CardProperties = ({ component, onUpdateProps, onUpdateStyle }: CardPropertiesProps) => {
  const cardProps = component.props;
  const style = component.style;

  const handlePropChange = (key: string, value: string) => {
    onUpdateProps(component.id, {
      ...component.props,
      [key]: value
    });
  };

  const handleStyleChange = (key: string, value: string | number) => {
    if (onUpdateStyle) {
      onUpdateStyle(component.id, key, value);
    }
  };

  const title = typeof cardProps.title === "string" ? cardProps.title : "";
  const content = typeof cardProps.content === "string" ? cardProps.content : "";

  return (
    <>
      <div className="prop-group">
        <label>Title</label>
        <input 
          type="text" 
          value={title} 
          onChange={(e) => handlePropChange('title', e.currentTarget.value)} 
        />
      </div>

      <div className="prop-group">
        <label>Content</label>
        <textarea 
          value={content} 
          onChange={(e) => handlePropChange('content', e.currentTarget.value)} 
        />
      </div>

      {onUpdateStyle && (
        <TypographyProperties 
          style={style} 
          defaults={CARD_TYPOGRAPHY_DEFAULTS} 
          onChange={(key, value) => handleStyleChange(key, value)} 
        />
      )}

      <div className="prop-group">
        <label style={{ fontWeight: 600, marginTop: '10px', display: 'block', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>Appearance</label>
        
        <label>Background color</label>
        <input 
          type="color" 
          value={style?.backgroundColor ?? "#ffffff"} 
          onChange={(e) => handleStyleChange('backgroundColor', e.currentTarget.value)} 
        />

        <label>Border color</label>
        <input 
          type="color" 
          value={style?.borderColor ?? "#dbe3ef"} 
          onChange={(e) => handleStyleChange('borderColor', e.currentTarget.value)} 
        />

        <label>Border width (px)</label>
        <input 
          type="number" 
          min={0} max={20}
          value={style?.borderWidth ?? 1} 
          onChange={(e) => {
            const val = e.currentTarget.valueAsNumber;
            if (!Number.isNaN(val)) handleStyleChange('borderWidth', val);
          }} 
        />

        <label>Border radius (px)</label>
        <input 
          type="number" 
          min={0} max={100}
          value={style?.borderRadius ?? 12} 
          onChange={(e) => {
            const val = e.currentTarget.valueAsNumber;
            if (!Number.isNaN(val)) handleStyleChange('borderRadius', val);
          }} 
        />

        <label>Padding (px)</label>
        <input 
          type="number" 
          min={0} max={100}
          value={style?.padding ?? 20} 
          onChange={(e) => {
            const val = e.currentTarget.valueAsNumber;
            if (!Number.isNaN(val)) handleStyleChange('padding', val);
          }} 
        />
      </div>
    </>
  );
};

export default CardProperties;
