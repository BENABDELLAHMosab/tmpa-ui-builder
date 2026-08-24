import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { pageService } from '../services/page.service';
import type { UiPage } from '../types/page';
import PortalLayout from '../components/layout/PortalLayout';
import StatusBadge from '../components/ui/StatusBadge';
import AddDeveloperModal from '../components/admin/AddDeveloperModal';
import '../styles/dashboard.css';

interface AdminDashboardPageProps {
  view?: 'pending' | 'publication';
}

const getAdminDisplayVersion = (page: UiPage, currentTab?: string): number => {
  if (currentTab === 'published' && page.publishedVersionNumber != null) {
    return page.publishedVersionNumber;
  }
  if (page.status === 'published' && page.publishedVersionNumber != null) {
    return page.publishedVersionNumber;
  }
  if (page.activeReviewId && 
      typeof page.activeReviewId === 'object' && 
      'versionNumber' in page.activeReviewId) {
    return page.activeReviewId.versionNumber;
  }
  return page.version;
};

const AdminDashboardPage = ({ view = 'pending' }: AdminDashboardPageProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [pages, setPages] = useState<UiPage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isAddDevModalOpen, setIsAddDevModalOpen] = useState<boolean>(false);
  
  // Local state for Publication tabs
  const [pubTab, setPubTab] = useState<'approved' | 'published'>('approved');

  useEffect(() => {
    fetchPages();
    if (view === 'publication') {
      const searchParams = new URLSearchParams(location.search);
      const tabParam = searchParams.get('tab');
      if (tabParam === 'published') {
        setPubTab('published');
      } else {
        setPubTab('approved');
      }
    }
  }, [view, location.search]);

  // Sync pubTab to URL without triggering a full fetch every time if we just click tabs
  const handleTabChange = (newTab: 'approved' | 'published') => {
    setPubTab(newTab);
    navigate(`/admin/publication?tab=${newTab}`, { replace: true });
  };

  const fetchPages = async () => {
    try {
      setLoading(true);
      const data = await pageService.getPages();
      const visiblePages = data.filter(p => {
        if (view === 'pending') return p.status === 'submitted';
        if (view === 'publication') {
          return p.publishedVersionNumber != null || 
                 (p.activeReviewId && typeof p.activeReviewId === 'object' && p.activeReviewId.status === 'approved');
        }
        return false;
      });
      setPages(visiblePages);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load pages';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (pageId: string, reviewId: string) => {
    if (!window.confirm("Are you sure you want to approve this page?")) return;

    try {
      setActionLoadingId(pageId);
      const updatedPage = await pageService.approvePage(pageId, reviewId);
      setPages(previousPages => previousPages.filter(p => p._id !== updatedPage._id));
      setSuccessMessage("Page approved successfully");
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to approve page";
      alert(message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (pageId: string, reviewId: string) => {
    const reason = window.prompt("Please provide a reason for rejection:");
    if (!reason || reason.trim() === '') return;

    try {
      setActionLoadingId(pageId);
      await pageService.rejectPage(pageId, reviewId, reason.trim());
      setPages(pages.filter(p => p._id !== pageId));
      setSuccessMessage("Page rejected successfully");
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to reject page";
      alert(message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handlePublish = async (pageId: string) => {
    if (!window.confirm("Are you sure you want to publish this page?")) return;

    try {
      setActionLoadingId(pageId);
      const updatedPage = await pageService.publishPage(pageId);
      setPages(pages.map(p => p._id === pageId ? updatedPage : p));
      setSuccessMessage("Page published successfully");
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to publish page";
      alert(message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const displayedPages = view === 'publication' 
    ? pages.filter(p => {
        if (pubTab === 'published') {
          return p.publishedVersionNumber != null;
        } else if (pubTab === 'approved') {
          return p.activeReviewId && 
                 typeof p.activeReviewId === 'object' && 
                 'status' in p.activeReviewId &&
                 p.activeReviewId.status === 'approved' && 
                 !('publishedAt' in p.activeReviewId && p.activeReviewId.publishedAt);
        }
        return false;
      })
    : pages;

  if (loading) {
    return (
      <PortalLayout>
        <p style={{ color: 'var(--color-muted)' }}>Loading requests...</p>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      {error && <div style={{ color: 'white', backgroundColor: 'var(--color-danger)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>{error}</div>}
      {successMessage && <div style={{ color: 'white', backgroundColor: 'var(--color-success)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>{successMessage}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '20px', color: 'var(--color-primary)', margin: 0 }}>
            {view === 'pending' ? 'Pending Requests' : 'Publication'}
          </h2>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsAddDevModalOpen(true)}
          >
            Add Developer
          </button>
        </div>

        {view === 'pending' && (
          <section className="stats-grid">
            <article className="stat-card">
              <span className="stat-card__label">Pending Requests</span>
              <strong className="stat-card__value">{pages.length}</strong>
            </article>
          </section>
        )}

        {view === 'publication' && (
          <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid var(--border-light)' }}>
            <button 
              onClick={() => handleTabChange('approved')}
              style={{
                background: 'none', border: 'none', padding: '12px 16px', cursor: 'pointer',
                fontWeight: pubTab === 'approved' ? 600 : 500,
                color: pubTab === 'approved' ? 'var(--primary-600)' : 'var(--text-secondary)',
                borderBottom: pubTab === 'approved' ? '2px solid var(--primary-600)' : '2px solid transparent',
                marginBottom: '-1px'
              }}
            >
              Approved ({pages.filter(p => p.activeReviewId && typeof p.activeReviewId === 'object' && 'status' in p.activeReviewId && p.activeReviewId.status === 'approved' && !('publishedAt' in p.activeReviewId && p.activeReviewId.publishedAt)).length})
            </button>
            <button 
              onClick={() => handleTabChange('published')}
              style={{
                background: 'none', border: 'none', padding: '12px 16px', cursor: 'pointer',
                fontWeight: pubTab === 'published' ? 600 : 500,
                color: pubTab === 'published' ? 'var(--primary-600)' : 'var(--text-secondary)',
                borderBottom: pubTab === 'published' ? '2px solid var(--primary-600)' : '2px solid transparent',
                marginBottom: '-1px'
              }}
            >
              Published ({pages.filter(p => p.publishedVersionNumber != null).length})
            </button>
          </div>
        )}

        <div className="card" style={{ padding: '0' }}>
          {displayedPages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
              <p style={{ fontSize: '1.1rem', fontWeight: 500, margin: '0 0 8px 0' }}>
                {view === 'pending' ? 'No pending validation requests.' : `No ${pubTab} pages.`}
              </p>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>Everything is up to date.</p>
            </div>
          ) : (
            <div className="portal-table-container" style={{ border: 'none', boxShadow: 'none' }}>
              <table className="portal-table">
                <thead>
                  <tr>
                    <th>Page Name</th>
                    <th>Developer</th>
                    <th>Submission Date</th>
                    <th>Version</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedPages.map(page => (
                    <tr key={page._id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{page.name}</td>
                      <td>
                        {typeof page.ownerId === 'object' && page.ownerId !== null
                          ? (page.ownerId.fullName || 'Unknown Developer')
                          : (page.ownerId || 'Unknown')}
                      </td>
                      <td>{new Date(page.updatedAt).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontSize: '0.85rem' }}>
                            {page.status === 'submitted' || page.status === 'approved' ? `Review v${getAdminDisplayVersion(page, pubTab)}` : `Current v${page.version}`}
                          </span>
                          {page.publishedVersionNumber != null && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-published)', fontWeight: 600 }}>
                              LIVE v{page.publishedVersionNumber}
                            </span>
                          )}
                        </div>
                      </td>
                      <td><StatusBadge status={view === 'publication' && pubTab === 'published' && page.publishedVersionNumber != null ? 'published' : page.status} /></td>
                      <td>
                        <div className="table-actions">
                          <button
                            onClick={() => {
                              const v = getAdminDisplayVersion(page, pubTab);
                              let returnTo = '/admin/pending-requests';
                              if (view === 'publication') {
                                returnTo = `/admin/publication?tab=${pubTab}`;
                              }
                              navigate(`/pages/${page._id}/versions/${v}/preview?returnTo=${encodeURIComponent(returnTo)}`);
                            }}
                            className="btn btn-secondary"
                            disabled={actionLoadingId === page._id}
                          >
                            Preview
                          </button>
                          {page.status === 'submitted' && page.activeReviewId && typeof page.activeReviewId === 'object' && (
                            <>
                              <button
                                onClick={() => handleApprove(page._id, (page.activeReviewId as any)._id)}
                                className="btn btn-success"
                                disabled={actionLoadingId === page._id}
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(page._id, (page.activeReviewId as any)._id)}
                                className="btn btn-danger"
                                disabled={actionLoadingId === page._id}
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {page.status === 'approved' && (
                            <button
                              onClick={() => handlePublish(page._id)}
                              className="btn btn-primary"
                              disabled={actionLoadingId === page._id}
                            >
                              {actionLoadingId === page._id ? 'Publishing...' : 'Publish'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <AddDeveloperModal
        isOpen={isAddDevModalOpen}
        onClose={() => setIsAddDevModalOpen(false)}
        onSuccess={(msg) => {
          setSuccessMessage(msg);
          setTimeout(() => setSuccessMessage(''), 4000);
        }}
      />
    </PortalLayout>
  );
};

export default AdminDashboardPage;
