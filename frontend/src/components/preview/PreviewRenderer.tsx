import type { BuilderComponent } from '../../types/page';
import ComponentRenderer from '../renderers/ComponentRenderer';
import { normalizeComponentsLayout } from '../../utils/canvas';
import '../../styles/preview.css';

interface PreviewRendererProps {
  components: BuilderComponent[];
}

const PreviewRenderer = ({ components }: PreviewRendererProps) => {
  const hasComponents = components && components.length > 0;

  if (!hasComponents) {
    return (
      <div className="preview-empty">
        No components to preview.
      </div>
    );
  }

  const normalizedComponents = normalizeComponentsLayout(components);

  return (
    <>
      {normalizedComponents.map((comp) => (
        <div 
          key={comp.id} 
          className="preview-item-wrapper"
          style={{
            position: 'absolute',
            left: comp.layout?.x ?? 0,
            top: comp.layout?.y ?? 0,
            width: comp.layout?.width ?? 300,
            height: comp.layout?.height ?? 60,
          }}
        >
          <ComponentRenderer component={comp} />
        </div>
      ))}
    </>
  );
};

export default PreviewRenderer;
