import type { UiPage } from '../../types/page';
import '../../styles/builder.css';

interface BuilderHeaderProps {
  page: UiPage;
  onBack: () => void;
}

const BuilderHeader = ({ page, onBack }: BuilderHeaderProps) => {
  return (
    <div className="builder-header">
      <div className="builder-header-info">
        <h2>{page.name}</h2>
        <span className="builder-header-status">{page.status}</span>
        <span className="builder-header-version">v{page.version}</span>
        {page.description && <p className="builder-header-desc">{page.description}</p>}
      </div>
      <button className="btn-primary" onClick={onBack}>
        Back to dashboard
      </button>
    </div>
  );
};

export default BuilderHeader;
