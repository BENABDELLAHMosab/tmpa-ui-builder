import { useNavigate } from 'react-router-dom';
import type { UiPage } from '../../types/page';

interface PageListProps {
  pages: UiPage[];
  onDelete: (pageId: string) => void;
}

const PageList = ({ pages, onDelete }: PageListProps) => {
  const navigate = useNavigate();

  const getBadgeClass = (status: string) => {
    switch (status) {
      case 'draft': return 'badge-draft';
      case 'submitted': return 'badge-submitted';
      case 'approved': return 'badge-approved';
      case 'rejected': return 'badge-rejected';
      case 'published': return 'badge-published';
      default: return 'badge-draft';
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this page?")) {
      onDelete(id);
    }
  };

  if (pages.length === 0) {
    return <div className="card"><p style={{ color: 'var(--color-muted)' }}>No pages found. Create one to get started.</p></div>;
  }

  return (
    <div className="pages-list">
      {pages.map((page) => (
        <div key={page._id} className="page-card">
          <div className="page-card-info">
            <h3>{page.name}</h3>
            <p>{page.description || "No description provided"}</p>
            <div className="page-card-meta">
              <span className={getBadgeClass(page.status)}>
                {page.status}
              </span>
              <span>v{page.version}</span>
              <span>Updated: {new Date(page.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="page-card-actions">
            <button 
              onClick={() => navigate(`/builder/${page._id}`)}
              className="btn-primary"
            >
              Open Builder
            </button>
            <button 
              onClick={() => handleDelete(page._id)}
              className="btn-danger"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PageList;
