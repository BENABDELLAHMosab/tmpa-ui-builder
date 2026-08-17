import { useState, useRef } from 'react';
import type { BuilderComponent } from '../../../types/page';
import { BUILDER_IMAGE_OBJECT_FITS, IMAGE_STYLE_DEFAULTS, isBuilderImageObjectFit } from '../../../utils/image';
import { assetService } from '../../../services/asset.service';

interface ImagePropertiesProps {
  component: BuilderComponent;
  onUpdateProps: (componentId: string, newProps: Record<string, unknown>) => void;
  onUpdateStyle?: (componentId: string, key: any, value: any) => void;
}

const ImageProperties = ({ component, onUpdateProps, onUpdateStyle }: ImagePropertiesProps) => {
  const imageProps = component.props;
  const imageStyle = component.style || {};

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const currentSourceType = imageProps.sourceType || "url";

  const handleUpdateProps = (key: string, value: any) => {
    onUpdateProps(component.id, {
      ...imageProps,
      [key]: value
    });
  };

  const handleSourceTypeChange = (type: "url" | "upload") => {
    onUpdateProps(component.id, {
      ...imageProps,
      sourceType: type
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File too large. Maximum size is 5MB.");
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Invalid file type. Only JPEG, PNG, and WebP are allowed.");
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);
      const result = await assetService.uploadImage(file);
      
      onUpdateProps(component.id, {
        ...imageProps,
        sourceType: "upload",
        assetId: result.id
      });
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
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
        
        <label>Source</label>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', margin: 0, fontWeight: 400 }}>
            <input 
              type="radio" 
              name={`sourceType-${component.id}`} 
              checked={currentSourceType === "upload"} 
              onChange={() => handleSourceTypeChange("upload")} 
            />
            Upload
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', margin: 0, fontWeight: 400 }}>
            <input 
              type="radio" 
              name={`sourceType-${component.id}`} 
              checked={currentSourceType === "url"} 
              onChange={() => handleSourceTypeChange("url")} 
            />
            URL
          </label>
        </div>

        {currentSourceType === "upload" ? (
          <div style={{ marginBottom: '10px' }}>
            <input 
              type="file" 
              ref={fileInputRef}
              accept="image/jpeg, image/png, image/webp"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <button 
              className="builder-btn builder-btn-secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              style={{ width: '100%' }}
            >
              {isUploading ? "Uploading..." : "Choose image"}
            </button>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
              PNG, JPG or WebP — max 5 MB
            </div>
            {uploadError && (
              <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                {uploadError}
              </div>
            )}
          </div>
        ) : (
          <>
            <label>Source URL</label>
            <input 
              type="text" 
              inputMode="url"
              placeholder="https://..."
              value={(imageProps.src as string) ?? ''} 
              onChange={(e) => handleUpdateProps('src', e.target.value)} 
            />
          </>
        )}

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
