import type { UiPage } from '../../types/page';
import '../../styles/builder.css';

interface BuilderCanvasProps {
  page: UiPage;
}

const BuilderCanvas = ({ page }: BuilderCanvasProps) => {
  const hasComponents = page.schema?.components && page.schema.components.length > 0;

  return (
    <div className="builder-canvas-container">
      <h3>Canvas</h3>
      <div className="builder-canvas">
        {!hasComponents ? (
          <div className="empty-canvas">
            Empty canvas. Components will appear here.
          </div>
        ) : (
          <pre className="schema-preview">
            <code>{JSON.stringify(page.schema, null, 2)}</code>
          </pre>
        )}
      </div>
    </div>
  );
};

export default BuilderCanvas;
