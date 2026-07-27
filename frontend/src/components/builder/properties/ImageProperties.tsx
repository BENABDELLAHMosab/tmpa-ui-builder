import type { BuilderComponent } from '../../../types/page';
import { BUILDER_IMAGE_OBJECT_FITS, IMAGE_STYLE_DEFAULTS, isBuilderImageObjectFit } from '../../../utils/image';

interface ImagePropertiesProps {
  component: BuilderComponent;
  onUpdateProps: (componentId: string, newProps: Record<string, unknown>) => void;
  onUpdateStyle?: (componentId: string, key: any, value: any) => void;
}

const ImageProperties = ({ component, onUpdateProps, onUpdateStyle }: ImagePropertiesProps) => {
  const imageProps = component.props;
  const imageStyle = component.style || {};

  const handleUpdateProps = (key: string, value: any) => {
    onUpdateProps(component.id, {
      ...imageProps,
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
        <label style={{ fontWeight: 600, marginTop: '10px', display: 'block', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>Content</label>
        
        <label>Source URL</label>
        <input 
          type="text" 
          inputMode="url"
          value={(imageProps.src as string) ?? ''} 
          onChange={(e) => handleUpdateProps('src', e.target.value)} 
        />

        <label>Alt text</label>
        <input 
          type="text" 
          value={(imageProps.alt as string) ?? 'Image'} 
          onChange={(e) => handleUpdateProps('alt', e.target.value)} 
        />
      </div>

      <div className="prop-group">
        <label style={{ fontWeight: 600, marginTop: '10px', display: 'block', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>Appearance</label>
        
        <label>Object fit</label>
        <select 
          value={imageStyle.objectFit ?? IMAGE_STYLE_DEFAULTS.objectFit} 
          onChange={(e) => {
            const val = e.target.value;
            if (isBuilderImageObjectFit(val)) {
              handleUpdateStyle('objectFit', val);
            }
          }}
        >
          {BUILDER_IMAGE_OBJECT_FITS.map(fit => (
            <option key={fit} value={fit}>{fit}</option>
          ))}
        </select>

        <label>Background color</label>
        <input 
          type="color" 
          value={imageStyle.backgroundColor ?? IMAGE_STYLE_DEFAULTS.backgroundColor} 
          onChange={(e) => handleUpdateStyle('backgroundColor', e.target.value)} 
        />

        <label>Border color</label>
        <input 
          type="color" 
          value={imageStyle.borderColor ?? IMAGE_STYLE_DEFAULTS.borderColor} 
          onChange={(e) => handleUpdateStyle('borderColor', e.target.value)} 
        />

        <label>Border width (px)</label>
        <input 
          type="number" 
          min={0} max={10}
          value={imageStyle.borderWidth ?? IMAGE_STYLE_DEFAULTS.borderWidth} 
          onChange={(e) => {
            const val = e.currentTarget.valueAsNumber;
            if (!Number.isNaN(val)) handleUpdateStyle('borderWidth', val ?? 0);
          }} 
        />

        <label>Border radius (px)</label>
        <input 
          type="number" 
          min={0} max={100}
          value={imageStyle.borderRadius ?? IMAGE_STYLE_DEFAULTS.borderRadius} 
          onChange={(e) => {
            const val = e.currentTarget.valueAsNumber;
            if (!Number.isNaN(val)) handleUpdateStyle('borderRadius', val ?? 0);
          }} 
        />
      </div>
    </>
  );
};

export default ImageProperties;
