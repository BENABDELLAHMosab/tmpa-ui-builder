import React, { useEffect, useState, useCallback } from 'react';
import { pageService } from '../../services/page.service';
import type { PageStatus, PageVersionSummary } from '../../types/page';

type HistoryPanelProps = {
  pageId: string;
  isOpen: boolean;
  refreshToken: number;
  pageStatus: PageStatus;
  currentVersion: number;
  onRestore: (versionNumber: number) => Promise<void>;
  onClose: () => void;
};

import { getPageVersionReasonLabel, formatDate } from '../../utils/format';

const RESTORABLE_STATUSES: PageStatus[] = ['draft', 'rejected'];

const HistoryPanel: React.FC<HistoryPanelProps> = ({
  pageId,
  isOpen,
  refreshToken,
  pageStatus,
  currentVersion,
  onRestore,
  onClose
}) => {
  const [items, setItems] = useState<PageVersionSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [restoringVersionNumber, setRestoringVersionNumber] = useState<number | null>(null);

  const canRestore = RESTORABLE_STATUSES.includes(pageStatus);

  const fetchVersions = useCallback(async (pageToFetch: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await pageService.getPageVersions(pageId, pageToFetch, 20);
      setItems(data.items);
      setTotalPages(data.pagination.totalPages);
      setCurrentPage(data.pagination.page);
    } catch (err: any) {
      setError(err.message || "Failed to load history.");
    } finally {
      setLoading(false);
    }
  }, [pageId]);

  useEffect(() => {
    if (!isOpen) return;
    fetchVersions(1);
  }, [isOpen, refreshToken, fetchVersions]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleRestoreClick = async (versionNumber: number) => {
    if (restoringVersionNumber !== null) return;
    const confirmed = window.confirm(
      `Restore version ${versionNumber}? A new version will be created with its content.`
    );
    if (!confirmed) return;
    setRestoringVersionNumber(versionNumber);
    try {
      await onRestore(versionNumber);
    } finally {
      setRestoringVersionNumber(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="builder-right-panel history-panel">
      <div className="history-panel__header" style={{ 
        padding: '1rem', 
        borderBottom: '1px solid var(--border-primary)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        backgroundColor: 'var(--surface-primary)', 
        position: 'sticky', 
        top: 0, 
        zIndex: 10 
      }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 600 }}>History</h3>
        <button 
          type="button" 
          onClick={onClose} 
          aria-label="Back to properties"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            background: 'transparent', 
            border: 'none', 
            color: 'var(--navy-600)', 
            cursor: 'pointer',
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            fontSize: '0.85rem',
            fontWeight: 500,
            transition: 'background-color 0.2s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(23, 54, 93, 0.05)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <span>Properties</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>

      <div className="history-panel__content" style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
        {loading && <div className="history-loading">Loading...</div>}
        
        {error && !loading && (
          <div className="history-error">
            <p>{error}</p>
            <button className="btn btn-sm" onClick={() => fetchVersions(currentPage)}>Retry</button>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="history-empty">No saved versions yet. Save the page to create Version 1.</div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="history-list">
            {items.map(item => {
              const isCurrentVersion = item.versionNumber === currentVersion;
              const isRestoring = restoringVersionNumber === item.versionNumber;
              const showRestore = canRestore && !isCurrentVersion;

              return (
                <div key={item.id} className="history-item">
                  <div className="history-item-header">
                    <span className="history-item-version">Version {item.versionNumber}</span>
                    {isCurrentVersion && <span className="history-item-current">Current</span>}
                  </div>
                  <div className="history-item-reason">{getPageVersionReasonLabel(item.reason)}</div>
                  <div className="history-item-date">{formatDate(item.createdAt)}</div>
                  <div className="history-item-author" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    {item.createdBy?.fullName || "Unknown user"}
                  </div>
                  <div className="history-version-actions">
                      {showRestore && (
                        <button
                          type="button"
                          className="history-version-action history-version-action--restore"
                          disabled={isRestoring || restoringVersionNumber !== null}
                          onClick={() => handleRestoreClick(item.versionNumber)}
                          aria-label={`Restore version ${item.versionNumber}`}
                        >
                          {isRestoring ? 'Restoring…' : 'Restore'}
                        </button>
                      )}
                      <a
                        href={`/pages/${pageId}/versions/${item.versionNumber}/preview`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`View version ${item.versionNumber}`}
                        className="history-version-action history-version-action--view"
                      >
                        View
                      </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {totalPages > 0 && (
        <div className="history-panel__pagination" style={{ flexShrink: 0, padding: '1rem', borderTop: '1px solid var(--border-primary)', backgroundColor: 'var(--surface-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button 
            className="btn btn-sm" 
            disabled={currentPage <= 1 || loading}
            onClick={() => fetchVersions(currentPage - 1)}
          >
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button 
            className="btn btn-sm" 
            disabled={currentPage >= totalPages || loading}
            onClick={() => fetchVersions(currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default HistoryPanel;



