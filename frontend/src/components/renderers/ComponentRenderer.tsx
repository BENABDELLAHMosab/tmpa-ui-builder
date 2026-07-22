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
    case 'Input': {
      const inputProps = component.props;
      const inputStyle = component.style;

      const label = (inputProps.label as string) ?? "";
      const placeholder = (inputProps.placeholder as string) ?? "Enter value";
      
      const rawInputType = (inputProps.inputType as string) ?? "text";
      const validTypes = ["text", "email", "password", "number"];
      const inputType = validTypes.includes(rawInputType) ? rawInputType : "text";

      const required = (inputProps.required as boolean) ?? false;

      const fontFamilyValue = inputStyle?.fontFamily ?? "Inter";
      const actualFontFamily = FONT_FAMILY_FALLBACKS[fontFamilyValue as keyof typeof FONT_FAMILY_FALLBACKS] ?? FONT_FAMILY_FALLBACKS["Inter"];

      const inputId = `builder-input-${component.id}`;

      return (
        <div 
          style={{ 
            display: "flex", 
            flexDirection: "column", 
            gap: 6, 
            width: "100%", 
            height: "100%", 
            minWidth: 0, 
            minHeight: 0, 
            overflow: "hidden", 
            boxSizing: "border-box" 
          }}
        >
          {label !== "" && (
            <label htmlFor={inputId} style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>
              {label}
              {required && <span aria-hidden="true"> *</span>}
            </label>
          )}
          <input 
            id={inputId}
            type={inputType} 
            placeholder={placeholder} 
            required={required}
            style={{ 
              flex: 1, 
              width: "100%", 
              minWidth: 0, 
              minHeight: 0, 
              boxSizing: "border-box", 
              borderStyle: "solid",
              fontFamily: actualFontFamily,
              fontStyle: inputStyle?.fontStyle ?? "normal",
              fontSize: inputStyle?.fontSize ?? 14,
              fontWeight: inputStyle?.fontWeight ?? 400,
              textAlign: inputStyle?.textAlign ?? "left",
              color: inputStyle?.color ?? "#0f172a",
              backgroundColor: inputStyle?.backgroundColor ?? "#ffffff",
              borderColor: inputStyle?.borderColor ?? "#cbd5e1",
              borderWidth: inputStyle?.borderWidth ?? 1,
              borderRadius: inputStyle?.borderRadius ?? 8,
              padding: inputStyle?.padding ?? 12
            }} 
          />
        </div>
      );
    }
    case 'Card': {
      const cardProps = component.props;
      const cardStyle = component.style;

      const title = typeof cardProps.title === "string" ? cardProps.title : "";
      const content = typeof cardProps.content === "string" ? cardProps.content : "";

      const fontFamilyValue = cardStyle?.fontFamily ?? "Inter";
      const actualFontFamily = FONT_FAMILY_FALLBACKS[fontFamilyValue as keyof typeof FONT_FAMILY_FALLBACKS] ?? FONT_FAMILY_FALLBACKS["Inter"];

      return (
        <article
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            width: "100%",
            height: "100%",
            minWidth: 0,
            minHeight: 0,
            boxSizing: "border-box",
            overflow: "hidden",
            backgroundColor: cardStyle?.backgroundColor ?? "#ffffff",
            borderColor: cardStyle?.borderColor ?? "#dbe3ef",
            borderWidth: cardStyle?.borderWidth ?? 1,
            borderStyle: "solid",
            borderRadius: cardStyle?.borderRadius ?? 12,
            padding: cardStyle?.padding ?? 20,
            fontFamily: actualFontFamily
          }}
        >
          {title !== "" && (
            <h3
              style={{
                margin: 0,
                flexShrink: 0,
                overflowWrap: "anywhere",
                fontFamily: actualFontFamily,
                fontStyle: cardStyle?.fontStyle ?? "normal",
                textAlign: (cardStyle?.textAlign ?? "left") as any,
                color: cardStyle?.color ?? "#334155",
                fontSize: 16,
                fontWeight: 600
              }}
            >
              {title}
            </h3>
          )}
          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflow: "auto",
              whiteSpace: "pre-wrap",
              overflowWrap: "anywhere",
              fontFamily: actualFontFamily,
              fontStyle: cardStyle?.fontStyle ?? "normal",
              fontSize: cardStyle?.fontSize ?? 14,
              fontWeight: cardStyle?.fontWeight ?? 400,
              textAlign: (cardStyle?.textAlign ?? "left") as any,
              color: cardStyle?.color ?? "#334155"
            }}
          >
            {content}
          </div>
        </article>
      );
    }
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
