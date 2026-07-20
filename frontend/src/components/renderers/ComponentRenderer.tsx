import type { BuilderComponent } from '../../types/page';
import { FONT_FAMILY_FALLBACKS } from '../../types/page';

interface ComponentRendererProps {
  component: BuilderComponent;
}

const ComponentRenderer = ({ component }: ComponentRendererProps) => {
  switch (component.type) {
    case 'Text': {
      const textStyle = component.style;
      const textLayout = component.layout;
      
      const fontFamilyValue = textStyle?.fontFamily ?? "Inter";
      const actualFontFamily = FONT_FAMILY_FALLBACKS[fontFamilyValue] ?? FONT_FAMILY_FALLBACKS["Inter"];

      return (
        <div
          style={{
            width: textLayout?.width ?? 300,
            maxWidth: "100%",
            minHeight: textLayout?.height ?? 60,
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
    case 'Button':
      return (
        <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: 'var(--radius-md)' }}>
          <button className="btn btn-primary" style={{ width: 'auto' }}>{component.props.label as string}</button>
        </div>
      );
    case 'Input':
      return (
        <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: 'var(--radius-md)' }}>
          <input type="text" placeholder={component.props.placeholder as string} disabled className="canvas-input" />
        </div>
      );
    case 'Card':
      return (
        <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: 'var(--radius-md)' }}>
          <div className="canvas-card">
            <h4>{component.props.title as string}</h4>
            <p>{component.props.content as string}</p>
          </div>
        </div>
      );
    case 'Table':
      return (
        <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: 'var(--radius-md)' }}>
          <table className="canvas-table">
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
