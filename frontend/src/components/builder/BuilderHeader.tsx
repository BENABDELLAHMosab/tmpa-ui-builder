import type { UiPage } from '../../types/page';
import '../../styles/builder.css';

interface BuilderHeaderProps {
  page: UiPage;
  onBack: () => void;
  onSave: () => void;
  onPreview: () => void;
  onSubmitForValidation: () => void;
  submitting: boolean;
  saving: boolean;
}

const BuilderHeader = ({ page, onBack, onSave, onPreview, onSubmitForValidation, submitting, saving }: BuilderHeaderProps) => {
  return (
    <div className="builder-header">
      <div className="builder-header-info">
        <h2>{page.name}</h2>
        <span className="builder-header-status">{page.status}</span>
        <span className="builder-header-version">v{page.version}</span>
        {page.description && <p className="builder-header-desc">{page.description}</p>}
      </div>
      <div className="builder-header-actions" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        {page.status === 'draft' && (
          <button className="btn-secondary" onClick={onSubmitForValidation} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit for validation'}
          </button>
        )}
        {page.status === 'submitted' && (
          <span style={{ fontSize: '0.875rem', color: '#f59e0b', fontWeight: 500, marginRight: '0.5rem' }}>
            Waiting for admin validation
          </span>
        )}
        <button className="btn-secondary" onClick={onPreview}>
          Preview
        </button>
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
