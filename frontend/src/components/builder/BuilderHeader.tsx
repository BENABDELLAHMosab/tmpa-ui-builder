import type { UiPage } from '../../types/page';
import StatusBadge from '../ui/StatusBadge';

interface BuilderHeaderProps {
  page: UiPage;
  onBack: () => void;
  onSave: () => void;
  onPreview: () => void;
  onHistoryToggle: () => void;
  onSubmitForValidation: () => void;
  submitting: boolean;
  saving: boolean;
  historyActive: boolean;
}

const BuilderHeader = ({ page, onBack, onSave, onPreview, onHistoryToggle, onSubmitForValidation, submitting, saving, historyActive }: BuilderHeaderProps) => {
  return (
    <header className="builder-header">
      <div className="builder-header-info">
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', width: '220px', height: '100%', padding: '0 20px', backgroundColor: 'var(--navy-800)' }}>
          <div style={{ position: 'absolute', bottom: '-1px', left: 0, right: 0, height: '1px', backgroundColor: 'var(--navy-800)' }} />
          <div style={{ position: 'absolute', bottom: '-1px', left: 0, right: 0, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
          <img src="/assets/2-TMPA.png" alt="TMPA Logo" style={{ maxWidth: '170px', height: 'auto', objectFit: 'contain' }} />
        </div>
        <h2 style={{ marginLeft: '0.5rem' }}>{page.name}</h2>
        <span className="builder-header-version">v{page.version}</span>
        <StatusBadge status={page.status} />
        {page.status === 'rejected' && page.rejectionReason && (
          <>
            <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border-primary)', margin: '0 0.5rem' }} />
            <div 
              title={page.rejectionReason}
              style={{ 
                maxWidth: '250px', 
                whiteSpace: 'nowrap', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)'
              }}
            >
              <span style={{ fontWeight: 600 }}>Motif :</span> {page.rejectionReason}
            </div>
          </>
        )}
      </div>

      <div className="builder-header-actions" style={{ display: 'flex', gap: '0.5rem' }}>
        {page.status === 'draft' && (
          <button
            className="btn btn-warning"
            style={{ backgroundColor: 'var(--status-pending)', color: 'white', border: 'none' }}
            onClick={onSubmitForValidation}
            disabled={submitting || saving}
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        )}
        <button
          className={`btn builder-history-button ${historyActive ? 'builder-history-button--active' : ''}`}
          onClick={onHistoryToggle}
          aria-label="View page history"
          aria-pressed={historyActive}
        >
          History
        </button>
        <button
          className="btn"
          onClick={onPreview}
          style={{ backgroundColor: 'var(--surface-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-primary)' }}
        >
          Preview
        </button>
        <button
          className="btn btn-primary"
          onClick={onSave}
          disabled={saving || submitting}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button
          className="btn"
          onClick={onBack}
          style={{ backgroundColor: 'var(--navy-950)', color: 'white', border: 'none' }}
        >
          Back to dashboard
        </button>
      </div>
    </header>
  );
};

export default BuilderHeader;
