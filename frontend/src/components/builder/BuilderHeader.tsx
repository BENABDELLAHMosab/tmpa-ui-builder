import type { UiPage } from '../../types/page';
import '../../styles/builder.css';

interface BuilderHeaderProps {
  page: UiPage;
  onBack: () => void;
  onSave: () => void;
  saving: boolean;
}

const BuilderHeader = ({ page, onBack, onSave, saving }: BuilderHeaderProps) => {
  return (
    <div className="builder-header">
      <div className="builder-header-info">
        <h2>{page.name}</h2>
        <span className="builder-header-status">{page.status}</span>
        <span className="builder-header-version">v{page.version}</span>
        {page.description && <p className="builder-header-desc">{page.description}</p>}
      </div>
      <div className="builder-header-actions" style={{ display: 'flex', gap: '0.5rem' }}>
        <button className="btn-secondary" onClick={onSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save page'}
        </button>
        <button className="btn-primary" onClick={onBack}>
          Back to dashboard
        </button>
      </div>
    </div>
  );
};

export default BuilderHeader;
