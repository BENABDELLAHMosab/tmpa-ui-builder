import { useEffect, useState } from 'react';
import { pageService } from '../services/page.service';
import type { UiPage } from '../types/page';
import PortalLayout from '../components/layout/PortalLayout';
import CreatePageForm from '../components/pages/CreatePageForm';
import PageList from '../components/pages/PageList';
import RejectionFeedback from '../components/ui/RejectionFeedback';
import '../styles/dashboard.css';

const DeveloperDashboardPage = () => {
  const [pages, setPages] = useState<UiPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const data = await pageService.getPages();
      setPages(data);
    } catch (err: any) {
      setError(err.message || "Failed to load pages");
    } finally {
      setLoading(false);
    }
  };

  const handlePageCreated = (newPage: UiPage) => {
    setPages((prev) => [newPage, ...prev]);
    setIsCreateModalOpen(false);
  };

  const handleDeletePage = async (pageId: string) => {
    try {
      await pageService.deletePage(pageId);
      setPages((prev) => prev.filter((p) => p._id !== pageId));
    } catch (err: any) {
      alert(err.message || "Failed to delete page");
    }
  };

  const handleDismissRejection = async (pageId: string) => {
    try {
      const updatedPage = await pageService.dismissRejectionFeedback(pageId);
      setPages((prev) => prev.map((p) => p._id === pageId ? updatedPage : p));
    } catch (err: any) {
      console.error(err.message || "Failed to dismiss feedback");
    }
  };

  const stats = {
    total: pages.length,
    pending: pages.filter(p => p.status === 'submitted').length,
    approved: pages.filter(p => p.status === 'approved').length,
    published: pages.filter(p => p.status === 'published').length
  };

  return (
    <PortalLayout>
      {error && (
        <div style={{ backgroundColor: "var(--color-danger)", color: "white", marginBottom: '1.5rem', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '28px', color: 'var(--text-primary)', margin: 0, fontWeight: 700, letterSpacing: '-0.01em' }}>Developer Dashboard</h1>
          </div>
          <button 
            className="btn btn-primary" 
            onClick={() => setIsCreateModalOpen(true)}
            style={{ padding: '0.6rem 1.25rem', fontSize: '14px', fontWeight: 500 }}
          >
            Create New Page
          </button>
        </div>

        <section className="stats-grid">
          <article className="stat-card">
            <span className="stat-card__label">Total Pages</span>
            <strong className="stat-card__value">{stats.total}</strong>
          </article>
          <article className="stat-card">
            <span className="stat-card__label">Pending</span>
            <strong className="stat-card__value">{stats.pending}</strong>
          </article>
          <article className="stat-card">
            <span className="stat-card__label">Approved</span>
            <strong className="stat-card__value">{stats.approved}</strong>
          </article>
          <article className="stat-card">
            <span className="stat-card__label">Published</span>
            <strong className="stat-card__value">{stats.published}</strong>
          </article>
        </section>

        {pages
          .filter(p => p.status === 'rejected' && p.rejectionReason && !p.rejectionFeedbackDismissed)
          .map(page => (
            <RejectionFeedback 
              key={`rejection-${page._id}`}
              pageName={page.name}
              reason={page.rejectionReason!}
              onDismiss={() => handleDismissRejection(page._id)}
            />
          ))
        }

        {/* Your Pages Section */}
        <div className="card" style={{ padding: '0' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--color-border-light)' }}>
            <h2 style={{ margin: 0, fontSize: '16px', color: 'var(--color-primary)' }}>Your Pages</h2>
          </div>
          <div style={{ padding: '20px' }}>
            {loading ? (
              <p style={{ color: 'var(--color-muted)' }}>Loading pages...</p>
            ) : (
              <PageList pages={pages} onDelete={handleDeletePage} />
            )}
          </div>
        </div>
      </div>

      {isCreateModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-24px', position: 'relative', zIndex: 10 }}>
              <button onClick={() => setIsCreateModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--color-muted)' }}>&times;</button>
            </div>
            <CreatePageForm onPageCreated={handlePageCreated} />
          </div>
        </div>
      )}
    </PortalLayout>
  );
};

export default DeveloperDashboardPage;
