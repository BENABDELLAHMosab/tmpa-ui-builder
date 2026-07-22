import type { 
  BuilderComponentStyle, 
  BuilderFontFamily, 
  BuilderFontStyle, 
  BuilderFontWeight, 
  BuilderTextAlign 
} from '../../../types/page';

export type TypographyStyleValues = {
  fontFamily: BuilderFontFamily;
  fontStyle: BuilderFontStyle;
  fontSize: number;
  fontWeight: BuilderFontWeight;
  textAlign: BuilderTextAlign;
  color: string;
};

export type TypographyStyleKey = keyof TypographyStyleValues;

export type TypographyDefaults = TypographyStyleValues;

export type TypographyPropertiesProps = {
  style?: BuilderComponentStyle;
  defaults: TypographyDefaults;
  onChange: <K extends TypographyStyleKey>(
    key: K,
    value: TypographyStyleValues[K]
  ) => void;
};

export const FONT_WEIGHT_OPTIONS = [
  400,
  500,
  600,
  700
] as const;

export const TEXT_TYPOGRAPHY_DEFAULTS: TypographyDefaults = {
  fontFamily: "Inter",
  fontStyle: "normal",
  fontSize: 16,
  fontWeight: 400,
  textAlign: "left",
  color: "#334155"
};

export const BUTTON_TYPOGRAPHY_DEFAULTS: TypographyDefaults = {
  fontFamily: "Inter",
  fontStyle: "normal",
  fontSize: 14,
  fontWeight: 600,
  textAlign: "center",
  color: "#ffffff"
};

export const INPUT_TYPOGRAPHY_DEFAULTS: TypographyDefaults = {
  fontFamily: "Inter",
  fontStyle: "normal",
  fontSize: 14,
  fontWeight: 400,
  textAlign: "left",
  color: "#0f172a"
};

const TypographyProperties = ({ style, defaults, onChange }: TypographyPropertiesProps) => {
  return (
    <div className="prop-group">
      <label style={{ fontWeight: 600, marginTop: '10px', display: 'block', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>Typography</label>
      
      <label>Font family</label>
      <select 
        value={style?.fontFamily ?? defaults.fontFamily} 
        onChange={(e) => onChange('fontFamily', e.target.value as BuilderFontFamily)}
      >
        <option value="Inter">Inter</option>
        <option value="Roboto">Roboto</option>
        <option value="Open Sans">Open Sans</option>
        <option value="Montserrat">Montserrat</option>
        <option value="Calibri">Calibri</option>
        <option value="Arial">Arial</option>
        <option value="system-ui">System UI</option>
      </select>

      <label>Font style</label>
      <select 
        value={style?.fontStyle ?? defaults.fontStyle} 
        onChange={(e) => onChange('fontStyle', e.target.value as BuilderFontStyle)}
      >
        <option value="normal">Normal</option>
        <option value="italic">Italic</option>
      </select>

      <label>Font size (px)</label>
      <input 
        type="number" 
        min={8} max={72}
        value={style?.fontSize ?? defaults.fontSize} 
        onChange={(e) => {
          const val = e.currentTarget.valueAsNumber;
          if (!Number.isNaN(val)) onChange('fontSize', val);
        }} 
      />

      <label>Font weight</label>
      <select 
        value={style?.fontWeight ?? defaults.fontWeight} 
        onChange={(e) => {
          const parsed = parseInt(e.target.value);
          if (FONT_WEIGHT_OPTIONS.includes(parsed as BuilderFontWeight)) {
            onChange('fontWeight', parsed as BuilderFontWeight);
          }
        }}
      >
        <option value={400}>400 (Normal)</option>
        <option value={500}>500 (Medium)</option>
        <option value={600}>600 (Semi-bold)</option>
        <option value={700}>700 (Bold)</option>
      </select>

      <label>Text align</label>
      <select 
        value={style?.textAlign ?? defaults.textAlign} 
        onChange={(e) => onChange('textAlign', e.target.value as BuilderTextAlign)}
      >
        <option value="left">Left</option>
        <option value="center">Center</option>
        <option value="right">Right</option>
      </select>

      <label>Text color</label>
      <input 
        type="color" 
        value={style?.color ?? defaults.color} 
        onChange={(e) => onChange('color', e.target.value)} 
      />
    </div>
  );
};

export default TypographyProperties;
