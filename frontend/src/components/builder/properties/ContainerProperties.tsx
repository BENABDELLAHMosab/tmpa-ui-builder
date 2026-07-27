import type { BuilderComponent } from '../../../types/page';
import { BUILDER_BORDER_STYLES } from '../../../types/page';
import { CONTAINER_STYLE_DEFAULTS } from '../../../utils/container';
import { isBuilderBorderStyle } from '../../../utils/divider';

interface ContainerPropertiesProps {
  component: BuilderComponent;
  onUpdateStyle?: (componentId: string, key: any, value: any) => void;
}

const ContainerProperties = ({ component, onUpdateStyle }: ContainerPropertiesProps) => {
  const containerStyle = component.style || {};

  const handleUpdateStyle = (key: string, value: any) => {
    if (onUpdateStyle) {
      onUpdateStyle(component.id, key, value);
    }
  };

  return (
    <>
      <div className="prop-group">
        <label style={{ fontWeight: 600, marginTop: '10px', display: 'block', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>Appearance</label>
        
        <label>Background color</label>
        <input 
          type="color" 
          value={containerStyle.backgroundColor ?? CONTAINER_STYLE_DEFAULTS.backgroundColor} 
          onChange={(e) => handleUpdateStyle('backgroundColor', e.target.value)} 
        />
        
        <label>Border color</label>
        <input 
          type="color" 
          value={containerStyle.borderColor ?? CONTAINER_STYLE_DEFAULTS.borderColor} 
          onChange={(e) => handleUpdateStyle('borderColor', e.target.value)} 
        />

        <label>Border width (px)</label>
        <input 
          type="number" 
          min={0} max={10}
          value={containerStyle.borderWidth ?? CONTAINER_STYLE_DEFAULTS.borderWidth} 
          onChange={(e) => {
            const rawValue = e.currentTarget.valueAsNumber;
            if (Number.isNaN(rawValue)) {
              return;
            }
            const borderWidth = Math.min(10, Math.max(0, rawValue));
            handleUpdateStyle('borderWidth', borderWidth);
          }} 
        />

        <label>Border style</label>
        <select 
          value={isBuilderBorderStyle(containerStyle.borderStyle) ? containerStyle.borderStyle : CONTAINER_STYLE_DEFAULTS.borderStyle} 
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

        <label>Border radius (px)</label>
        <input 
          type="number" 
          min={0} max={100}
          value={containerStyle.borderRadius ?? CONTAINER_STYLE_DEFAULTS.borderRadius} 
          onChange={(e) => {
            const rawValue = e.currentTarget.valueAsNumber;
            if (Number.isNaN(rawValue)) {
              return;
            }
            const borderRadius = Math.min(100, Math.max(0, rawValue));
            handleUpdateStyle('borderRadius', borderRadius);
          }} 
        />
      </div>
    </>
  );
};

export default ContainerProperties;
