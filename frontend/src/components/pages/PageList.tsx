import type { UiPage } from '../../types/page';
import '../../styles/auth.css'; // Reuse btn styles

interface PageListProps {
  pages: UiPage[];
  onDelete: (pageId: string) => void;
}

const PageList = ({ pages, onDelete }: PageListProps) => {
  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this page?")) {
      onDelete(id);
    }
  };

  const handleOpenBuilder = () => {
    alert("Builder will be implemented in the next sprint.");
  };

  if (pages.length === 0) {
    return <div className="card"><p style={{ color: '#64748b' }}>No pages found. Create one to get started.</p></div>;
  }

  return (
    <div className="page-list">
      {pages.map((page) => (
        <div key={page._id} className="card" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#0f172a' }}>{page.name}</h3>
              <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0 0 1rem 0' }}>
                {page.description || "No description provided"}
              </p>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#475569' }}>
                <span style={{ 
                  padding: '0.25rem 0.5rem', 
                  borderRadius: '9999px', 
                  backgroundColor: page.status === 'draft' ? '#f1f5f9' : '#e0f2fe',
                  border: '1px solid #cbd5e1'
                }}>
                  {page.status}
                </span>
                <span>v{page.version}</span>
                <span>Updated: {new Date(page.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={handleOpenBuilder}
                className="btn-primary"
                style={{ padding: '0.5rem 1rem', width: 'auto' }}
              >
                Open Builder
              </button>
              <button 
                onClick={() => handleDelete(page._id)}
                style={{ 
                  padding: '0.5rem 1rem', 
                  backgroundColor: '#fee2e2', 
                  color: '#b91c1c', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PageList;
