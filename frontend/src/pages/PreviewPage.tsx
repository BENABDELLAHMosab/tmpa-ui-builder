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
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', width: '220px', height: '100%', padding: '0 20px', backgroundColor: 'var(--navy-800)' }}>
            <div style={{ position: 'absolute', bottom: '-1px', left: 0, right: 0, height: '1px', backgroundColor: 'var(--navy-800)' }} />
            <div style={{ position: 'absolute', bottom: '-1px', left: 0, right: 0, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
            <img src="/assets/2-TMPA.png" alt="TMPA Logo" style={{ maxWidth: '170px', height: 'auto', objectFit: 'contain' }} />
          </div>
          <h2 style={{ marginLeft: '0.5rem', color: 'var(--text-primary)', margin: 0, fontSize: '1.25rem' }}>{page?.name}</h2>
          {page?.version && <span style={{ color: 'var(--text-secondary)', paddingLeft: '1rem', borderLeft: '1px solid var(--border-primary)', fontSize: '0.85rem', fontWeight: 500 }}>v{page.version}</span>}
          {page?.status && <StatusBadge status={page.status} />}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {authUser?.role === 'user-developer' && (
            <button
              className="btn btn-secondary"
              onClick={handleBackToBuilder}
            >
              Back to builder
            </button>
          )}
          <button
            className="btn btn-primary"
            onClick={handleBackToDashboard}
            style={{ backgroundColor: 'var(--navy-950)' }}
          >
            Back to dashboard
          </button>
        </div>
      </header>

      <div className="preview-main-wrapper">
        <aside className="preview-sidebar">
          <h3>Versions</h3>
          <div className="preview-sidebar-list">
            {page && Array.from({ length: page.version }, (_, i) => page.version - i).map((v) => (
              <div 
                key={v} 
                className="preview-sidebar-item" 
                style={{ 
                  cursor: 'pointer', 
                  opacity: v === page.version ? 1 : 0.6,
                  borderLeft: v === page.version ? '3px solid var(--primary-500)' : '1px solid transparent',
                  backgroundColor: v === page.version ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span>Version {v}</span>
                {v === page.version && <span style={{ fontSize: '0.7rem', color: '#60a5fa', fontWeight: 600 }}>ACTUELLE</span>}
              </div>
            ))}
          </div>
        </aside>

        <main className="preview-main">
          <div className="preview-container">
            <PreviewRenderer components={components} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default PreviewPage;
