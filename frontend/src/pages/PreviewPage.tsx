import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { pageService } from '../services/page.service';
import { getAuthUser, getDashboardPathByRole } from '../utils/authStorage';
import type { UiPage, BuilderComponent } from '../types/page';
import PreviewRenderer from '../components/preview/PreviewRenderer';
import '../styles/preview.css';
import '../styles/builder.css';

const PreviewPage = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from as string | undefined;
  
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
    return <div className="preview-loading">Loading preview...</div>;
  }

  if (error || !page) {
    return (
      <div className="preview-error">
        <h2>Error</h2>
        <p>{error || "Page not found"}</p>
        <button onClick={handleBackToDashboard} className="btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="preview-layout">
      <div className="preview-header builder-header">
        <div className="builder-header-info">
          <h2>{page.name} <span className="preview-badge">Preview</span></h2>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span className="builder-header-status">{page.status}</span>
            <span className="builder-header-version">v{page.version}</span>
            {page.status === 'submitted' && (
              <span style={{ fontSize: '0.875rem', color: '#f59e0b', fontWeight: 500 }}>
                (Waiting for admin validation)
              </span>
            )}
          </div>
        </div>
        <div className="builder-header-actions" style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn-secondary" onClick={handleBackToBuilder}>
            Back to builder
          </button>
          <button className="btn-primary" onClick={handleBackToDashboard}>
            Back to dashboard
          </button>
        </div>
      </div>
      
      <div className="preview-main">
        <div className="preview-container">
          <PreviewRenderer components={components} />
        </div>
      </div>
    </div>
  );
};

export default PreviewPage;
