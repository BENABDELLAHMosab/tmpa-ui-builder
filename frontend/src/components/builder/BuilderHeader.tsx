import type { UiPage } from '../../types/page';
import StatusBadge from '../ui/StatusBadge';

interface BuilderHeaderProps {
  page: UiPage;
  onBack: () => void;
  onSave: () => void;
  onPreview: () => void;
  onHistoryToggle: () => void;
  onSubmitForValidation: () => void;
  onUpdateReview?: () => void;
  activeReviewVersion?: number;
  currentVersion?: number;
  submitting: boolean;
  saving: boolean;
  historyActive: boolean;
}

const BuilderHeader = ({ page, onBack, onSave, onPreview, onHistoryToggle, onSubmitForValidation, onUpdateReview, activeReviewVersion, currentVersion, submitting, saving, historyActive }: BuilderHeaderProps) => {
  const isUnderReview = page.status === 'submitted';
  const isChangesRequested = page.status === 'rejected';

  const hasNewerChanges = currentVersion && activeReviewVersion && currentVersion > activeReviewVersion;
  const isPublished = page.publishedVersionNumber != null;

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
        {isUnderReview && (
          <span style={{ marginLeft: '8px', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
            IN REVIEW (v{activeReviewVersion})
          </span>
        )}
        {isChangesRequested && (
          <span style={{ marginLeft: '8px', fontSize: '12px', fontWeight: 'bold', color: 'var(--color-danger)' }}>
            REVIEWED v{activeReviewVersion}
          </span>
        )}
        {isUnderReview && hasNewerChanges && (
          <span style={{ marginLeft: '8px', fontSize: '12px', color: 'orange' }}>
            Newer changes are not submitted
          </span>
        )}
        {isPublished && page.status !== 'published' && (
          <span style={{ marginLeft: '8px', fontSize: '12px', fontWeight: 'bold', color: 'var(--color-success)', backgroundColor: 'rgba(52, 211, 153, 0.1)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
            LIVE (v{page.publishedVersionNumber})
          </span>
        )}
        {isChangesRequested && page.rejectionReason && (
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
            {!hasNewerChanges && (
              <span style={{ marginLeft: '8px', fontSize: '12px', color: 'orange' }}>
                Save your corrections before resubmitting.
              </span>
            )}
          </>
        )}
      </div>

      <div className="builder-header-actions" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        {page.status === 'draft' && (
          <button
            className="btn btn-warning"
            style={{ backgroundColor: 'var(--status-pending)', color: 'white', border: 'none' }}
            onClick={onSubmitForValidation}
            disabled={submitting || saving}
          >
            {submitting ? 'Submitting...' : 'Submit for Review'}
          </button>
        )}
        {isUnderReview && hasNewerChanges && onUpdateReview && (
          <button
            className="btn btn-warning"
            onClick={onUpdateReview}
            disabled={submitting || saving}
          >
            {submitting ? 'Updating...' : `Update Review to v${currentVersion}`}
          </button>
        )}
        {isChangesRequested && hasNewerChanges && (
          <button
            className="btn btn-warning"
            onClick={onSubmitForValidation}
            disabled={submitting || saving}
          >
            {submitting ? 'Resubmitting...' : `Resubmit v${currentVersion} for Review`}
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
