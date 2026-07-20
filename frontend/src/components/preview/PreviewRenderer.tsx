import type { BuilderComponent } from '../../types/page';
import ComponentRenderer from '../renderers/ComponentRenderer';
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

  const renderComponent = (comp: BuilderComponent) => {
    return <ComponentRenderer component={comp} />;
  };

  return (
    <div className="preview-components">
      {components.map((comp) => (
        <div key={comp.id} className="preview-item">
          {renderComponent(comp)}
        </div>
      ))}
    </div>
  );
};

export default PreviewRenderer;
