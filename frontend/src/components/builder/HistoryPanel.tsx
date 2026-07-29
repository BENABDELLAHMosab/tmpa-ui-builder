import React, { useEffect, useState, useCallback } from 'react';
import { pageService } from '../../services/page.service';
import type { PageVersionSummary, PageVersionReason } from '../../types/page';

type HistoryPanelProps = {
  pageId: string;
  isOpen: boolean;
  refreshToken: number;
  onClose: () => void;
};

const getPageVersionReasonLabel = (reason: PageVersionReason): string => {
  const map: Record<PageVersionReason, string> = {
    "initial": "Initial version",
    "legacy-baseline": "Imported baseline",
    "manual-save": "Manual save",
    "restore": "Restored version",
    "publication": "Publication"
  };
  return map[reason] || "Unknown change";
};

const formatDate = (isoDate: string): string => {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(new Date(isoDate));
  } catch {
    return "Unknown date";
  }
};

const HistoryPanel: React.FC<HistoryPanelProps> = ({ pageId, isOpen, refreshToken, onClose }) => {
  const [items, setItems] = useState<PageVersionSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

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

  if (!isOpen) return null;

  return (
    <div className="builder-right-panel history-panel">
      <div className="properties-panel-header">
        <h3>History</h3>
        <button className="btn-icon" onClick={onClose} aria-label="Close History">
          &times;
        </button>
      </div>

      <div className="history-panel-content">
        {loading && <div className="history-loading">Loading...</div>}
        
        {error && !loading && (
          <div className="history-error">
            <p>{error}</p>
            <button className="btn btn-sm" onClick={() => fetchVersions(currentPage)}>Retry</button>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="history-empty">No versions available.</div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="history-list">
            {items.map(item => (
              <div key={item.id} className="history-item">
                <div className="history-item-header">
                  <span className="history-item-version">Version {item.versionNumber}</span>
                  {item.isCurrent && <span className="history-item-current">Current</span>}
                </div>
                <div className="history-item-reason">{getPageVersionReasonLabel(item.reason)}</div>
                <div className="history-item-date">{formatDate(item.createdAt)}</div>
                <div className="history-item-author">
                  {item.createdBy?.fullName || "Unknown user"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {totalPages > 0 && (
        <div className="history-pagination">
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
