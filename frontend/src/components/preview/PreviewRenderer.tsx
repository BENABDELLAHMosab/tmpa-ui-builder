import { useMemo } from 'react';
import type { BuilderComponent } from '../../types/page';
import ComponentRenderer from '../renderers/ComponentRenderer';
import ContainerFrame from '../renderers/ContainerFrame';
import { normalizeComponentsLayout } from '../../utils/canvas';
import { normalizeComponentLayers } from '../../utils/layers';
import { buildComponentsByParent } from '../../utils/container';
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

  const normalizedComponents = normalizeComponentLayers(normalizeComponentsLayout(components));
  
  const componentsByParent = useMemo(() => {
    return buildComponentsByParent(normalizedComponents);
  }, [normalizedComponents]);

  const renderComponent = (comp: BuilderComponent) => {
    const isContainer = comp.type === 'Container';
    const children = componentsByParent.get(comp.id) || [];

    return (
      <div 
        key={comp.id} 
        className="preview-item-wrapper"
        style={{
          position: 'absolute',
          left: comp.layout?.x ?? 0,
          top: comp.layout?.y ?? 0,
          width: comp.layout?.width ?? 300,
          height: comp.layout?.height ?? 60,
          zIndex: comp.layout?.zIndex ?? 1,
          boxSizing: 'border-box',
        }}
      >
        {isContainer ? (
          <ContainerFrame component={comp}>
            {children.map(renderComponent)}
          </ContainerFrame>
        ) : (
          <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
            <ComponentRenderer component={comp} />
          </div>
        )}
      </div>
    );
  };

  const rootComponents = componentsByParent.get(null) || [];

  return (
    <>
      {rootComponents.map(renderComponent)}
    </>
  );
};

export default PreviewRenderer;
