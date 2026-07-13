import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearAuthStorage } from '../utils/authStorage';
import { pageService } from '../services/page.service';
import type { UiPage } from '../types/page';
import CreatePageForm from '../components/pages/CreatePageForm';
import PageList from '../components/pages/PageList';
import '../styles/dashboard.css';

const DeveloperDashboardPage = () => {
  const navigate = useNavigate();
  const [pages, setPages] = useState<UiPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const handleLogout = () => {
    clearAuthStorage();
    navigate('/login', { replace: true });
  };

  const handlePageCreated = (newPage: UiPage) => {
    setPages((prev) => [newPage, ...prev]);
  };

  const handleDeletePage = async (pageId: string) => {
    try {
      await pageService.deletePage(pageId);
      setPages((prev) => prev.filter((p) => p._id !== pageId));
    } catch (err: any) {
      alert(err.message || "Failed to delete page");
    }
  };

  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <div className="dashboard-title">
          <h1>Developer Dashboard</h1>
          <p>Create, preview and submit your UI pages.</p>
        </div>
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </header>

      <main className="dashboard-main">
        {error && (
          <div className="login-message" style={{ backgroundColor: "#fee2e2", color: "#b91c1c", marginBottom: '1rem', padding: '1rem', borderRadius: '4px' }}>
            {error}
          </div>
        )}
        
        <CreatePageForm onPageCreated={handlePageCreated} />
        
        <div>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem', color: '#0f172a' }}>Your Pages</h2>
          {loading ? (
            <p style={{ color: '#64748b' }}>Loading pages...</p>
          ) : (
            <PageList pages={pages} onDelete={handleDeletePage} />
          )}
        </div>
      </main>
    </div>
  );
};

export default DeveloperDashboardPage;

