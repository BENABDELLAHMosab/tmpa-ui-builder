import type { BuilderComponent, BuilderSelectProps, BuilderSelectOption } from '../../../types/page';
import TypographyProperties from './TypographyProperties';
import { SELECT_STYLE_DEFAULTS } from '../../../utils/select';
import { generateId } from '../../../utils/id';

const SELECT_TYPOGRAPHY_DEFAULTS = {
  fontFamily: SELECT_STYLE_DEFAULTS.fontFamily,
  fontStyle: SELECT_STYLE_DEFAULTS.fontStyle,
  fontSize: SELECT_STYLE_DEFAULTS.fontSize,
  fontWeight: SELECT_STYLE_DEFAULTS.fontWeight,
  textAlign: SELECT_STYLE_DEFAULTS.textAlign,
  color: SELECT_STYLE_DEFAULTS.color
};

interface SelectPropertiesProps {
  component: BuilderComponent;
  onUpdateProps: (id: string, newProps: Record<string, unknown>) => void;
  onUpdateStyle?: (id: string, key: any, value: any) => void;
}

const SelectProperties = ({ component, onUpdateProps, onUpdateStyle }: SelectPropertiesProps) => {
  const selectProps = (component.props as BuilderSelectProps) || {};
  const selectStyle = component.style || {};

  const handleUpdateStyle = (key: string, value: any) => {
    if (onUpdateStyle) {
      onUpdateStyle(component.id, key, value);
    }
  };

  const handleAddOption = () => {
    const currentOptions = selectProps.options || [];
    let nextNum = currentOptions.length + 1;
    
    // Find highest suffix to avoid duplicates if options were deleted
    const suffixRegex = /^option-(\d+)$/;
    currentOptions.forEach(opt => {
      const match = opt.value.match(suffixRegex);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num >= nextNum) {
          nextNum = num + 1;
        }
      }
    });

    const newOption: BuilderSelectOption = {
      id: generateId('option'),
      label: `Option ${nextNum}`,
      value: `option-${nextNum}`
    };

    onUpdateProps(component.id, {
      ...component.props,
      options: [...currentOptions, newOption]
    });
  };

  const handleDeleteOption = (optionId: string) => {
    const currentOptions = selectProps.options || [];
    if (currentOptions.length <= 1) return;

    onUpdateProps(component.id, {
      ...component.props,
      options: currentOptions.filter(opt => opt.id !== optionId)
    });
  };

  const handleOptionChange = (optionId: string, key: keyof BuilderSelectOption, value: string) => {
    const currentOptions = selectProps.options || [];
    const nextOptions = currentOptions.map(option =>
      option.id === optionId
        ? { ...option, [key]: value }
        : option
    );

    onUpdateProps(component.id, {
      ...component.props,
      options: nextOptions
    });
  };

  const options = selectProps.options || [];

  return (
    <div className="properties-content">
      <div className="properties-section">
        <h4 className="properties-section-title">Content and behavior</h4>
        
        <div className="prop-group">
          <label>Label</label>
          <input 
            type="text" 
            className="prop-input" 
            value={selectProps.label ?? ''}
            onChange={(e) => onUpdateProps(component.id, { ...component.props, label: e.target.value })}
            placeholder="Select label"
          />
        </div>

        <div className="prop-group">
          <label>Placeholder</label>
          <input 
            type="text" 
            className="prop-input" 
            value={selectProps.placeholder ?? ''}
            onChange={(e) => onUpdateProps(component.id, { ...component.props, placeholder: e.target.value })}
            placeholder="Placeholder text"
          />
        </div>

        <div className="prop-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input 
            type="checkbox" 
            id="select-required"
            checked={selectProps.required ?? false}
            onChange={(e) => onUpdateProps(component.id, { ...component.props, required: e.currentTarget.checked })}
          />
          <label htmlFor="select-required" style={{ margin: 0, fontWeight: 'normal' }}>Required field</label>
        </div>
      </div>

      <div className="properties-section">
        <h4 className="properties-section-title">Options</h4>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {options.map((option, index) => (
            <div key={option.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>Option {index + 1}</span>
                <button 
                  type="button"
                  onClick={() => handleDeleteOption(option.id)}
                  disabled={options.length <= 1}
                  style={{ 
                    padding: '4px 8px', 
                    backgroundColor: options.length <= 1 ? '#e2e8f0' : '#fee2e2', 
                    color: options.length <= 1 ? '#94a3b8' : '#ef4444', 
                    border: 'none', 
                    borderRadius: '4px',
                    cursor: options.length <= 1 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Delete option"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: 500, color: '#475569' }}>Label</label>
                <input 
                  type="text" 
                  className="prop-input" 
                  value={option.label}
                  onChange={(e) => handleOptionChange(option.id, 'label', e.target.value)}
                  placeholder="Label"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: 500, color: '#475569' }}>Value</label>
                <input 
                  type="text" 
                  className="prop-input" 
                  value={option.value}
                  onChange={(e) => handleOptionChange(option.id, 'value', e.target.value)}
                  placeholder="Value"
                />
              </div>
            </div>
          ))}
          
          <button 
            type="button"
            className="btn" 
            onClick={handleAddOption}
            style={{ marginTop: '4px' }}
          >
            + Add option
          </button>
        </div>
      </div>

      <div className="properties-section">
        <h4 className="properties-section-title">Typography</h4>
        <TypographyProperties 
          style={selectStyle}
          defaults={SELECT_TYPOGRAPHY_DEFAULTS}
          onChange={handleUpdateStyle}
        />
      </div>

      <div className="properties-section">
        <h4 className="properties-section-title">Appearance</h4>
        
        <div className="prop-group">
          <label>Background color</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="color" 
              value={selectStyle.backgroundColor ?? SELECT_STYLE_DEFAULTS.backgroundColor}
              onChange={(e) => handleUpdateStyle('backgroundColor', e.target.value)}
              style={{ width: '40px', height: '32px', padding: '0', border: '1px solid #cbd5e1', borderRadius: '4px' }}
            />
            <input 
              type="text" 
              className="prop-input" 
              value={selectStyle.backgroundColor ?? SELECT_STYLE_DEFAULTS.backgroundColor}
              onChange={(e) => handleUpdateStyle('backgroundColor', e.target.value)}
              style={{ flex: 1 }}
            />
          </div>
        </div>

        <div className="prop-group">
          <label>Border color</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="color" 
              value={selectStyle.borderColor ?? SELECT_STYLE_DEFAULTS.borderColor}
              onChange={(e) => handleUpdateStyle('borderColor', e.target.value)}
              style={{ width: '40px', height: '32px', padding: '0', border: '1px solid #cbd5e1', borderRadius: '4px' }}
            />
            <input 
              type="text" 
              className="prop-input" 
              value={selectStyle.borderColor ?? SELECT_STYLE_DEFAULTS.borderColor}
              onChange={(e) => handleUpdateStyle('borderColor', e.target.value)}
              style={{ flex: 1 }}
            />
          </div>
        </div>

        <div className="prop-row" style={{ display: 'flex', gap: '12px' }}>
          <div className="prop-group" style={{ flex: 1 }}>
            <label>Border width</label>
            <input 
              type="number" 
              className="prop-input" 
              value={selectStyle.borderWidth ?? SELECT_STYLE_DEFAULTS.borderWidth}
              min={0}
              max={10}
              onChange={(e) => {
                const val = e.target.valueAsNumber;
                if (!Number.isNaN(val)) handleUpdateStyle('borderWidth', val);
              }}
            />
          </div>
          
          <div className="prop-group" style={{ flex: 1 }}>
            <label>Border radius</label>
            <input 
              type="number" 
              className="prop-input" 
              value={selectStyle.borderRadius ?? SELECT_STYLE_DEFAULTS.borderRadius}
              min={0}
              max={100}
              onChange={(e) => {
                const val = e.target.valueAsNumber;
                if (!Number.isNaN(val)) handleUpdateStyle('borderRadius', val);
              }}
            />
          </div>
        </div>

        <div className="prop-group">
          <label>Padding</label>
          <input 
            type="number" 
            className="prop-input" 
            value={selectStyle.padding ?? SELECT_STYLE_DEFAULTS.padding}
            min={0}
            max={40}
            onChange={(e) => {
              const val = e.target.valueAsNumber;
              if (!Number.isNaN(val)) handleUpdateStyle('padding', val);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SelectProperties;
