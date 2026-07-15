import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { pageService } from '../services/page.service';
import { getAuthUser, getDashboardPathByRole } from '../utils/authStorage';
import type { UiPage, BuilderComponent } from '../types/page';
import PreviewRenderer from '../components/preview/PreviewRenderer';
import StatusBadge from '../components/ui/StatusBadge';
import '../styles/preview.css';

const PreviewPage = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from as string | undefined;
  
  const authUser = getAuthUser();
  
  const [page, setPage] = useState<UiPage | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [components, setComponents] = useState<BuilderComponent[]>([]);

  useEffect(() => {
    const fetchPage = async () => {
      if (!pageId) {
        setError("No page ID provided.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await pageService.getPageById(pageId);
        setPage(data);
        if (data.schema && Array.isArray(data.schema.components)) {
          setComponents(data.schema.components as BuilderComponent[]);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load page");
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [pageId]);

  const handleBackToBuilder = () => {
    if (from) {
      navigate(from);
    } else if (pageId) {
      navigate(`/builder/${pageId}`);
    } else {
      navigate('/developer/dashboard');
    }
  };

  const handleBackToDashboard = () => {
    const user = getAuthUser();
    const dashboardPath = getDashboardPathByRole(user?.role);
    navigate(dashboardPath);
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--color-muted)' }}>Loading preview...</div>;
  }

  if (error && !page) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '1rem' }}>
        <h2>Error</h2>
        <p style={{ color: 'var(--color-danger)' }}>{error}</p>
        <button onClick={handleBackToDashboard} className="btn btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="preview-layout">
      <header className="preview-topbar">
        <div className="preview-topbar-info">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '226px', borderRight: '1px solid var(--color-border)' }}>
            <img src="/assets/tmpa-logo.png" alt="TMPA Logo" style={{ height: '60px', width: 'auto' }} />
          </div>
          <h2 style={{ marginLeft: '1rem' }}>{page?.name}</h2>
          {page?.version && <span style={{ color: 'var(--color-muted)', paddingLeft: '1rem', borderLeft: '1px solid var(--color-border-light)' }}>v{page.version}</span>}
          {page?.status && <StatusBadge status={page.status} />}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {authUser?.role === 'user-developer' && (
            <button 
              className="btn" 
              onClick={handleBackToBuilder}
              style={{ backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1' }}
            >
              Back to builder
            </button>
          )}
          <button 
            className="btn" 
            onClick={handleBackToDashboard} 
            style={{ backgroundColor: '#0f172a', color: 'white', border: 'none' }}
          >
            Back to dashboard
          </button>
        </div>
      </header>

      <main className="preview-main">
        <div className="preview-container">
          <PreviewRenderer components={components} />
        </div>
      </main>
    </div>
  );
};

export default PreviewPage;
