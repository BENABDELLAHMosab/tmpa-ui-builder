import type { BuilderComponent } from '../../types/page';
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
    switch (comp.type) {
      case 'Text':
        return <span>{comp.props.text as string}</span>;
      case 'Button':
        return <button className="btn-primary" style={{ width: 'auto' }}>{comp.props.label as string}</button>;
      case 'Input':
        return <input type="text" placeholder={comp.props.placeholder as string} disabled className="preview-input" />;
      case 'Card':
        return (
          <div className="preview-card">
            <h4>{comp.props.title as string}</h4>
            <p>{comp.props.content as string}</p>
          </div>
        );
      case 'Table':
        return (
          <table className="preview-table">
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
