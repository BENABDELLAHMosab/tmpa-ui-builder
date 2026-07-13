import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearAuthStorage } from '../utils/authStorage';
import { pageService } from '../services/page.service';
import type { UiPage } from '../types/page';
import '../styles/dashboard.css';

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [pages, setPages] = useState<UiPage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const data = await pageService.getPages();
      const submittedPages = data.filter(p => p.status === 'submitted');
      setPages(submittedPages);
    } catch (err: any) {
      setError(err.message || 'Failed to load pages');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuthStorage();
    navigate('/login', { replace: true });
  };

  const handleApprove = async (pageId: string) => {
    if (!window.confirm("Are you sure you want to approve this page?")) return;
    
    try {
      setActionLoadingId(pageId);
      await pageService.approvePage(pageId);
      setPages(pages.filter(p => p._id !== pageId));
      setSuccessMessage("Page approved successfully");
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to approve page");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (pageId: string) => {
    const reason = window.prompt("Please provide a reason for rejection:");
    if (!reason || reason.trim() === '') return;
    
    try {
      setActionLoadingId(pageId);
      await pageService.rejectPage(pageId, reason.trim());
      setPages(pages.filter(p => p._id !== pageId));
      setSuccessMessage("Page rejected successfully");
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to reject page");
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) return <div className="dashboard-layout" style={{ padding: '2rem' }}>Loading requests...</div>;

  return (
    <div className="dashboard-layout">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Admin Dashboard</h1>
          <p>Manage validation requests and monitor submitted UI pages.</p>
        </div>
        <button className="btn-logout" onClick={handleLogout}>Logout</button>
      </div>
      <div className="dashboard-main">
        <div className="dashboard-content-wrapper">
          {error && <div style={{ color: 'white', backgroundColor: 'var(--color-danger)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>{error}</div>}
          {successMessage && <div style={{ color: 'white', backgroundColor: 'var(--color-success)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>{successMessage}</div>}
          
          {pages.length === 0 ? (
            <div className="card">
              <p style={{ color: 'var(--color-muted)' }}>No pending validation requests. Everything is up to date.</p>
            </div>
          ) : (
            <div className="pages-list">
              {pages.map(page => (
                <div key={page._id} className="page-card">
                  <div className="page-card-info">
                    <h3>{page.name}</h3>
                    <p>{page.description || "No description provided"}</p>
                    <div className="page-card-meta">
                      <span className="badge-submitted">Submitted</span>
                      <span>v{page.version}</span>
                      <span>Updated: {new Date(page.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="page-card-actions">
                    <button 
                      onClick={() => navigate(`/preview/${page._id}`)}
                      className="btn-secondary"
                      disabled={actionLoadingId === page._id}
                    >
                      Preview
                    </button>
                    <button 
                      onClick={() => handleApprove(page._id)}
                      className="btn-success"
                      disabled={actionLoadingId === page._id}
                    >
                      {actionLoadingId === page._id ? 'Processing...' : 'Approve'}
                    </button>
                    <button 
                      onClick={() => handleReject(page._id)}
                      className="btn-danger"
                      disabled={actionLoadingId === page._id}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
