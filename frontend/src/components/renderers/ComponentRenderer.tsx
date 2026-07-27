import type { BuilderComponent } from '../../types/page';
import { FONT_FAMILY_FALLBACKS } from '../../types/page';
import { TABLE_STYLE_DEFAULTS } from '../../utils/table';
import { SELECT_STYLE_DEFAULTS } from '../../utils/select';
import { CHECKBOX_STYLE_DEFAULTS } from '../../utils/checkbox';

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
    case 'Table': {
      let rawColumns = component.props.columns;
      let rawRows = component.props.rows;
      
      const columns = Array.isArray(rawColumns) 
        ? rawColumns.map((col: any, idx) => {
            if (typeof col === 'string') return { id: `legacy-column-${idx}`, label: col };
            if (col && typeof col === 'object' && 'id' in col) return col;
            return { id: `legacy-column-${idx}`, label: "Untitled" };
          })
        : [];
      
      const rows = Array.isArray(rawRows) ? rawRows : [];

      const style = component.style || {};
      const fontFamilyValue = style.fontFamily ?? TABLE_STYLE_DEFAULTS.fontFamily;
      const actualFontFamily = FONT_FAMILY_FALLBACKS[fontFamilyValue as keyof typeof FONT_FAMILY_FALLBACKS] ?? FONT_FAMILY_FALLBACKS["Inter"];
      
      const fontStyle = style.fontStyle ?? TABLE_STYLE_DEFAULTS.fontStyle;
      const fontSize = style.fontSize ?? TABLE_STYLE_DEFAULTS.fontSize;
      const fontWeight = style.fontWeight ?? TABLE_STYLE_DEFAULTS.fontWeight;
      const textAlign = (style.textAlign ?? TABLE_STYLE_DEFAULTS.textAlign) as any;
      const color = style.color ?? TABLE_STYLE_DEFAULTS.color;
      const backgroundColor = style.backgroundColor ?? TABLE_STYLE_DEFAULTS.backgroundColor;
      
      const headerBackgroundColor = style.headerBackgroundColor ?? TABLE_STYLE_DEFAULTS.headerBackgroundColor;
      const headerColor = style.headerColor ?? TABLE_STYLE_DEFAULTS.headerColor;
      
      const borderColor = style.borderColor ?? TABLE_STYLE_DEFAULTS.borderColor;
      const borderWidth = style.borderWidth ?? TABLE_STYLE_DEFAULTS.borderWidth;
      const borderRadius = style.borderRadius ?? TABLE_STYLE_DEFAULTS.borderRadius;
      const padding = style.padding ?? TABLE_STYLE_DEFAULTS.padding;

      const internalBorder = borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : "none";

      return (
        <div style={{
          width: '100%',
          height: '100%',
          minWidth: 0,
          minHeight: 0,
          backgroundColor,
          borderColor,
          borderWidth,
          borderStyle: 'solid',
          borderRadius,
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            minWidth: 0,
            minHeight: 0,
            overflow: 'auto'
          }}>
            <table style={{
              width: '100%',
              minWidth: 'max-content',
              borderCollapse: 'separate',
              borderSpacing: 0
            }}>
              <thead style={{ backgroundColor: headerBackgroundColor }}>
                <tr>
                  {columns.map((col, idx) => {
                    const isLast = idx === columns.length - 1;
                    return (
                      <th key={col.id} scope="col" style={{
                        fontFamily: actualFontFamily,
                        fontStyle,
                        fontSize,
                        fontWeight: 600,
                        textAlign,
                        color: headerColor,
                        padding,
                        boxSizing: 'border-box',
                        whiteSpace: 'nowrap',
                        borderRight: isLast ? 'none' : internalBorder,
                        borderBottom: internalBorder
                      }}>
                        {col.label}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={Math.max(1, columns.length)} style={{
                      fontFamily: actualFontFamily,
                      fontStyle,
                      fontSize,
                      fontWeight,
                      textAlign,
                      color,
                      backgroundColor,
                      padding,
                      boxSizing: 'border-box',
                      whiteSpace: 'nowrap'
                    }}>
                      No rows
                    </td>
                  </tr>
                ) : (
                  rows.map((row, rowIdx) => {
                    const isLastRow = rowIdx === rows.length - 1;
                    return (
                      <tr key={row.id}>
                        {columns.map((col, colIdx) => {
                          const isLastCol = colIdx === columns.length - 1;
                          const cellData = row.cells && typeof row.cells[col.id] === 'string' ? row.cells[col.id] : "";
                          return (
                            <td key={`${row.id}-${col.id}`} style={{
                              fontFamily: actualFontFamily,
                              fontStyle,
                              fontSize,
                              fontWeight,
                              textAlign,
                              color,
                              backgroundColor,
                              padding,
                              boxSizing: 'border-box',
                              whiteSpace: 'nowrap',
                              borderRight: isLastCol ? 'none' : internalBorder,
                              borderBottom: isLastRow ? 'none' : internalBorder
                            }}>
                              {cellData}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
    case 'Select': {
      const selectStyle = component.style || {};
      const fontFamilyValue = selectStyle.fontFamily ?? SELECT_STYLE_DEFAULTS.fontFamily;
      const actualFontFamily = FONT_FAMILY_FALLBACKS[fontFamilyValue as keyof typeof FONT_FAMILY_FALLBACKS] ?? FONT_FAMILY_FALLBACKS["Inter"];

      const label = typeof component.props.label === 'string' ? component.props.label : "";
      const placeholder = typeof component.props.placeholder === 'string' ? component.props.placeholder : "";
      const required = typeof component.props.required === 'boolean' ? component.props.required : false;
      const rawOptions = component.props.options;
      const options = Array.isArray(rawOptions) ? rawOptions : [];

      const selectId = `builder-select-${component.id}`;

      return (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 6,
            minWidth: 0,
            minHeight: 0,
            overflow: "hidden",
            boxSizing: "border-box"
          }}
        >
          {label !== "" && (
            <label
              htmlFor={selectId}
              style={{
                fontFamily: actualFontFamily,
                fontSize: 14,
                fontWeight: 500,
                color: "#0f172a",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}
            >
              {label}
              {required && <span aria-hidden="true" style={{ color: "#ef4444" }}> *</span>}
            </label>
          )}
          <select
            id={selectId}
            required={required}
            defaultValue={placeholder !== "" ? "" : undefined}
            style={{
              flex: 1,
              width: "100%",
              minWidth: 0,
              minHeight: 0,
              boxSizing: "border-box",
              fontFamily: actualFontFamily,
              fontStyle: selectStyle.fontStyle ?? SELECT_STYLE_DEFAULTS.fontStyle,
              fontSize: selectStyle.fontSize ?? SELECT_STYLE_DEFAULTS.fontSize,
              fontWeight: selectStyle.fontWeight ?? SELECT_STYLE_DEFAULTS.fontWeight,
              textAlign: (selectStyle.textAlign ?? SELECT_STYLE_DEFAULTS.textAlign) as any,
              color: selectStyle.color ?? SELECT_STYLE_DEFAULTS.color,
              backgroundColor: selectStyle.backgroundColor ?? SELECT_STYLE_DEFAULTS.backgroundColor,
              borderColor: selectStyle.borderColor ?? SELECT_STYLE_DEFAULTS.borderColor,
              borderWidth: selectStyle.borderWidth ?? SELECT_STYLE_DEFAULTS.borderWidth,
              borderStyle: "solid",
              borderRadius: selectStyle.borderRadius ?? SELECT_STYLE_DEFAULTS.borderRadius,
              padding: selectStyle.padding ?? SELECT_STYLE_DEFAULTS.padding,
            }}
          >
            {placeholder !== "" && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt: any, index: number) => {
              const optId = opt && typeof opt.id === 'string' ? opt.id : `${component.id}-option-${index}`;
              const optLabel = opt && typeof opt.label === 'string' ? opt.label : "";
              const optValue = opt && typeof opt.value === 'string' ? opt.value : "";
              
              return (
                <option key={optId} value={optValue}>
                  {optLabel}
                </option>
              );
            })}
          </select>
        </div>
      );
    }
    case 'Checkbox': {
      const checkboxProps = component.props;
      const checkboxStyle = component.style || {};

      const label = typeof checkboxProps.label === "string" ? checkboxProps.label : "";
      const name = typeof checkboxProps.name === "string" ? checkboxProps.name : "";
      const value = typeof checkboxProps.value === "string" ? checkboxProps.value : "on";
      const required = typeof checkboxProps.required === "boolean" ? checkboxProps.required : false;
      const defaultChecked = typeof checkboxProps.defaultChecked === "boolean" ? checkboxProps.defaultChecked : false;

      const fontFamilyValue = checkboxStyle.fontFamily ?? CHECKBOX_STYLE_DEFAULTS.fontFamily;
      const actualFontFamily = FONT_FAMILY_FALLBACKS[fontFamilyValue as keyof typeof FONT_FAMILY_FALLBACKS] ?? FONT_FAMILY_FALLBACKS["Inter"];

      const checkboxId = `builder-checkbox-${component.id}`;
      const padding = checkboxStyle.padding ?? CHECKBOX_STYLE_DEFAULTS.padding;
      const accentColor = checkboxStyle.accentColor ?? CHECKBOX_STYLE_DEFAULTS.accentColor;

      return (
        <div 
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding,
            boxSizing: "border-box",
            overflow: "hidden"
          }}
        >
          <input 
            id={checkboxId}
            type="checkbox"
            name={name !== "" ? name : undefined}
            value={value}
            required={required}
            defaultChecked={defaultChecked}
            key={`${component.id}-${defaultChecked ? "checked" : "unchecked"}`}
            style={{
              width: 18,
              height: 18,
              flexShrink: 0,
              accentColor
            }}
            aria-label={label === "" ? "Checkbox" : undefined}
          />
          {label !== "" && (
            <label 
              htmlFor={checkboxId}
              style={{
                flex: 1,
                minWidth: 0,
                fontFamily: actualFontFamily,
                fontStyle: checkboxStyle.fontStyle ?? CHECKBOX_STYLE_DEFAULTS.fontStyle,
                fontSize: checkboxStyle.fontSize ?? CHECKBOX_STYLE_DEFAULTS.fontSize,
                fontWeight: checkboxStyle.fontWeight ?? CHECKBOX_STYLE_DEFAULTS.fontWeight,
                textAlign: (checkboxStyle.textAlign ?? CHECKBOX_STYLE_DEFAULTS.textAlign) as any,
                color: checkboxStyle.color ?? CHECKBOX_STYLE_DEFAULTS.color,
                overflowWrap: "anywhere"
              }}
            >
              {label}
              {required && (
                <span aria-hidden="true">
                  {" *"}
                </span>
              )}
            </label>
          )}
        </div>
      );
    }
    default:
      return null;
  }
};

export default ComponentRenderer;
