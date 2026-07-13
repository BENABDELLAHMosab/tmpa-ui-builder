import type { BuilderComponent } from '../../types/page';
import '../../styles/builder.css';

interface BuilderCanvasProps {
  components: BuilderComponent[];
  selectedComponentId: string | null;
  onSelectComponent: (componentId: string) => void;
}

const BuilderCanvas = ({ components, selectedComponentId, onSelectComponent }: BuilderCanvasProps) => {
  const hasComponents = components.length > 0;

  const renderComponent = (comp: BuilderComponent) => {
    switch (comp.type) {
      case 'Text':
        return <span>{comp.props.text as string}</span>;
      case 'Button':
        return <button className="btn-primary" style={{ width: 'auto' }}>{comp.props.label as string}</button>;
      case 'Input':
        return <input type="text" placeholder={comp.props.placeholder as string} disabled className="canvas-input" />;
      case 'Card':
        return (
          <div className="canvas-card">
            <h4>{comp.props.title as string}</h4>
            <p>{comp.props.content as string}</p>
          </div>
        );
      case 'Table':
        return (
          <table className="canvas-table">
            <thead>
              <tr>
                {((comp.props.columns as string[]) || []).map((col, idx) => (
                  <th key={idx}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={((comp.props.columns as string[]) || []).length} className="text-center text-muted" style={{ textAlign: 'center', color: '#94a3b8', padding: '1rem' }}>No data</td>
              </tr>
            </tbody>
          </table>
        );
      default:
        return null;
    }
  };

  return (
    <div className="builder-canvas-container">
      <h3>Canvas</h3>
      <div className="builder-canvas">
        {!hasComponents ? (
          <div className="empty-canvas">
            Empty canvas. Add components from the sidebar.
          </div>
        ) : (
          <div className="canvas-components" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
            {components.map((comp) => (
              <div 
                key={comp.id} 
                className={`canvas-item ${comp.id === selectedComponentId ? 'selected' : ''}`}
                onClick={() => onSelectComponent(comp.id)}
              >
                {renderComponent(comp)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BuilderCanvas;
