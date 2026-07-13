import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pageService } from '../services/page.service';
import type { UiPage } from '../types/page';
import BuilderHeader from '../components/builder/BuilderHeader';
import ComponentSidebar from '../components/builder/ComponentSidebar';
import BuilderCanvas from '../components/builder/BuilderCanvas';
import '../styles/builder.css';

const BuilderPage = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState<UiPage | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
      } catch (err: any) {
        setError(err.message || "Failed to load page");
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [pageId]);

  if (loading) {
    return <div className="builder-loading">Loading builder...</div>;
  }

  if (error || !page) {
    return (
      <div className="builder-error">
        <h2>Error</h2>
        <p>{error || "Page not found"}</p>
        <button onClick={() => navigate('/developer/dashboard')} className="btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="builder-layout">
      <BuilderHeader page={page} onBack={() => navigate('/developer/dashboard')} />
      <div className="builder-main">
        <ComponentSidebar />
        <BuilderCanvas page={page} />
      </div>
    </div>
  );
};

export default BuilderPage;
