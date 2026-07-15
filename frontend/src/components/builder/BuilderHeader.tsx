import type { UiPage } from '../../types/page';
import StatusBadge from '../ui/StatusBadge';

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
    <header className="builder-header">
      <div className="builder-header-info">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '226px', borderRight: '1px solid var(--color-border)' }}>
          <img src="/assets/tmpa-logo.png" alt="TMPA Logo" style={{ height: '60px', width: 'auto' }} />
        </div>
        <h2 style={{ marginLeft: '1rem' }}>{page.name}</h2>
        <span className="builder-header-version">v{page.version}</span>
        <StatusBadge status={page.status} />
      </div>

      <div className="builder-header-actions">
        {page.status === 'draft' && (
          <button 
            className="btn" 
            style={{ backgroundColor: 'var(--color-warning)', color: 'white' }}
            onClick={onSubmitForValidation}
            disabled={submitting || saving}
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        )}
        <button 
          className="btn" 
          onClick={onPreview}
          style={{ backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1' }}
        >
          Preview
        </button>
        <button 
          className="btn" 
          onClick={onSave}
          disabled={saving || submitting}
          style={{ backgroundColor: '#3b82f6', color: 'white' }}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button 
          className="btn" 
          onClick={onBack} 
          style={{ backgroundColor: '#0f172a', color: 'white', border: 'none' }}
        >
          Back to dashboard
        </button>
      </div>
    </header>
  );
};

export default BuilderHeader;
