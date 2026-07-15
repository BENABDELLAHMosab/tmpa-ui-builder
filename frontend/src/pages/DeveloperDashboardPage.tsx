import { useEffect, useState } from 'react';
import { pageService } from '../services/page.service';
import type { UiPage } from '../types/page';
import PortalLayout from '../components/layout/PortalLayout';
import CreatePageForm from '../components/pages/CreatePageForm';
import PageList from '../components/pages/PageList';

const DeveloperDashboardPage = () => {
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
    <PortalLayout title="Developer Dashboard">
      {error && (
        <div style={{ backgroundColor: "var(--color-danger)", color: "white", marginBottom: '1.5rem', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
          {error}
        </div>
      )}
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Create New Page Section */}
        <CreatePageForm onPageCreated={handlePageCreated} />
        
        {/* Your Pages Section */}
        <div className="card" style={{ padding: '16px' }}>
          <h2 style={{ marginBottom: '16px', fontSize: '16px' }}>Your Pages</h2>
          {loading ? (
            <p style={{ color: 'var(--color-muted)' }}>Loading pages...</p>
          ) : (
            <PageList pages={pages} onDelete={handleDeletePage} />
          )}
        </div>
      </div>
    </PortalLayout>
  );
};

export default DeveloperDashboardPage;
