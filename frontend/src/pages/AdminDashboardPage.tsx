import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pageService } from '../services/page.service';
import type { UiPage } from '../types/page';
import PortalLayout from '../components/layout/PortalLayout';
import StatusBadge from '../components/ui/StatusBadge';

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

  if (loading) {
    return (
      <PortalLayout title="Admin Portal">
        <p style={{ color: 'var(--color-muted)' }}>Loading requests...</p>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout title="Admin Portal">
      {error && <div style={{ color: 'white', backgroundColor: 'var(--color-danger)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>{error}</div>}
      {successMessage && <div style={{ color: 'white', backgroundColor: 'var(--color-success)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>{successMessage}</div>}
      
      <div className="card" style={{ marginBottom: '2rem', padding: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Pending Validation Requests</h2>
        {pages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--color-muted)' }}>
            <p style={{ fontSize: '1.1rem' }}>No pending validation requests.</p>
            <p>Everything is up to date.</p>
          </div>
        ) : (
          <div className="portal-table-container">
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
                {pages.map(page => (
                  <tr key={page._id}>
                    <td style={{ fontWeight: 500, color: 'var(--color-primary)' }}>{page.name}</td>
                    <td>{page.ownerId || 'Unknown'}</td>
                    <td>{new Date(page.updatedAt).toLocaleDateString()}</td>
                    <td>v{page.version}</td>
                    <td><StatusBadge status={page.status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          onClick={() => navigate(`/preview/${page._id}`)}
                          className="btn btn-secondary"
                          disabled={actionLoadingId === page._id}
                        >
                          Preview
                        </button>
                        <button 
                          onClick={() => handleApprove(page._id)}
                          className="btn btn-success"
                          disabled={actionLoadingId === page._id}
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleReject(page._id)}
                          className="btn btn-danger"
                          style={{ backgroundColor: '#fef2f2', color: '#ef4444', border: '1px solid #fca5a5' }}
                          disabled={actionLoadingId === page._id}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PortalLayout>
  );
};

export default AdminDashboardPage;
