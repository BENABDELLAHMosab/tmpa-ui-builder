import type { BuilderComponent } from '../../../types/page';
import { BUILDER_BORDER_STYLES } from '../../../types/page';
import { DIVIDER_STYLE_DEFAULTS, isBuilderBorderStyle } from '../../../utils/divider';

interface DividerPropertiesProps {
  component: BuilderComponent;
  onUpdateStyle?: (componentId: string, key: any, value: any) => void;
}

const DividerProperties = ({ component, onUpdateStyle }: DividerPropertiesProps) => {
  const dividerStyle = component.style || {};

  const handleUpdateStyle = (key: string, value: any) => {
    if (onUpdateStyle) {
      onUpdateStyle(component.id, key, value);
    }
  };

  return (
    <>
      <div className="prop-group">
        <label style={{ fontWeight: 600, marginTop: '10px', display: 'block', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>Appearance</label>
        
        <label>Line color</label>
        <input 
          type="color" 
          value={dividerStyle.borderColor ?? DIVIDER_STYLE_DEFAULTS.borderColor} 
          onChange={(e) => handleUpdateStyle('borderColor', e.target.value)} 
        />

        <label>Thickness (px)</label>
        <input 
          type="number" 
          min={0} max={10}
          value={dividerStyle.borderWidth ?? DIVIDER_STYLE_DEFAULTS.borderWidth} 
          onChange={(e) => {
            const rawValue = e.currentTarget.valueAsNumber;
            if (Number.isNaN(rawValue)) {
              return;
            }
            const borderWidth = Math.min(10, Math.max(0, rawValue));
            handleUpdateStyle('borderWidth', borderWidth);
          }} 
        />

        <label>Line style</label>
        <select 
          value={isBuilderBorderStyle(dividerStyle.borderStyle) ? dividerStyle.borderStyle : DIVIDER_STYLE_DEFAULTS.borderStyle} 
          onChange={(e) => {
            const val = e.target.value;
            if (isBuilderBorderStyle(val)) {
              handleUpdateStyle('borderStyle', val);
            }
          }}
        >
          {BUILDER_BORDER_STYLES.map(style => (
            <option key={style} value={style}>{style}</option>
          ))}
        </select>
      </div>
    </>
  );
};

export default DividerProperties;
