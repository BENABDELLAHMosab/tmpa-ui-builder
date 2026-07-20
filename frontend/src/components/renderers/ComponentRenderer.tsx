import type { BuilderComponent } from '../../types/page';
import { FONT_FAMILY_FALLBACKS } from '../../types/page';

interface ComponentRendererProps {
  component: BuilderComponent;
}

const ComponentRenderer = ({ component }: ComponentRendererProps) => {
  switch (component.type) {
    case 'Text': {
      const textStyle = component.style;
      const fontFamilyValue = textStyle?.fontFamily ?? "Inter";
      const actualFontFamily = FONT_FAMILY_FALLBACKS[fontFamilyValue] ?? FONT_FAMILY_FALLBACKS["Inter"];

      return (
        <div
          style={{
            width: "100%",
            height: "100%",
            padding: textStyle?.padding ?? 12,
            borderRadius: textStyle?.borderRadius ?? 6,
            backgroundColor: textStyle?.backgroundColor ?? "#ffffff",
            boxSizing: "border-box"
          }}
        >
          <span
            style={{
              display: "block",
              fontFamily: actualFontFamily,
              fontStyle: textStyle?.fontStyle ?? "normal",
              fontSize: textStyle?.fontSize ?? 16,
              color: textStyle?.color ?? "#334155",
              fontWeight: textStyle?.fontWeight ?? 400,
              textAlign: textStyle?.textAlign ?? "left",
              overflowWrap: "anywhere"
            }}
          >
            {(component.props.text as string) || "Text"}
          </span>
        </div>
      );
    }
    case 'Button': {
      const btnStyle = component.style;
      const fontFamilyValue = btnStyle?.fontFamily ?? "Inter";
      const actualFontFamily = FONT_FAMILY_FALLBACKS[fontFamilyValue] ?? FONT_FAMILY_FALLBACKS["Inter"];
      
      const textAlign = btnStyle?.textAlign ?? "center";
      let justifyContent = "center";
      if (textAlign === "left") justifyContent = "flex-start";
      if (textAlign === "right") justifyContent = "flex-end";

      return (
        <button
          type="button"
          style={{
            width: "100%",
            height: "100%",
            boxSizing: "border-box",
            appearance: "none",
            borderStyle: "solid",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent,
            fontFamily: actualFontFamily,
            fontStyle: btnStyle?.fontStyle ?? "normal",
            fontSize: btnStyle?.fontSize ?? 14,
            fontWeight: btnStyle?.fontWeight ?? 600,
            color: btnStyle?.color ?? "#ffffff",
            backgroundColor: btnStyle?.backgroundColor ?? "#1e3a66",
            borderColor: btnStyle?.borderColor ?? "#1e3a66",
            borderWidth: btnStyle?.borderWidth ?? 1,
            borderRadius: btnStyle?.borderRadius ?? 8,
            textAlign, // Keep textAlign for multi-line text alignment
            cursor: "pointer"
          }}
        >
          {(component.props.label as string) ?? "Button"}
        </button>
      );
    }
    case 'Input':
      return (
        <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: 'var(--radius-md)', width: '100%', height: '100%', boxSizing: 'border-box' }}>
          <input type="text" placeholder={component.props.placeholder as string} disabled className="canvas-input" style={{ width: '100%' }} />
        </div>
      );
    case 'Card':
      return (
        <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: 'var(--radius-md)', width: '100%', height: '100%', boxSizing: 'border-box' }}>
          <div className="canvas-card" style={{ height: '100%' }}>
            <h4>{component.props.title as string}</h4>
            <p>{component.props.content as string}</p>
          </div>
        </div>
      );
    case 'Table':
      return (
        <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: 'var(--radius-md)', width: '100%', height: '100%', boxSizing: 'border-box', overflow: 'auto' }}>
          <table className="canvas-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                {((component.props.columns as string[]) || []).map((col, idx) => (
                  <th key={idx}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={((component.props.columns as string[]) || []).length} className="text-center text-muted" style={{ textAlign: 'center', color: '#94a3b8', padding: '1rem' }}>No data</td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    default:
      return null;
  }
};

export default ComponentRenderer;
