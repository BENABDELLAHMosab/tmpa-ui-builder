import { useNavigate } from 'react-router-dom';
import type { UiPage } from '../../types/page';
import StatusBadge from '../ui/StatusBadge';

interface PageListProps {
  pages: UiPage[];
  onDelete: (pageId: string) => void;
}

const PageList = ({ pages, onDelete }: PageListProps) => {
  const navigate = useNavigate();

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this page?")) {
      onDelete(id);
    }
  };

  if (pages.length === 0) {
    return <div style={{ color: 'var(--color-muted)', textAlign: 'center', padding: '2rem 0' }}>No pages found. Create one to get started.</div>;
  }

  return (
    <div className="portal-table-container">
      <table className="portal-table">
        <thead>
          <tr>
            <th>Page Name</th>
            <th>Description</th>
            <th>Status</th>
            <th>Version</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {pages.map((page) => (
            <tr key={page._id}>
              <td style={{ fontWeight: 500, color: 'var(--color-primary)' }}>{page.name}</td>
              <td style={{ color: 'var(--color-muted)' }}>{page.description || '-'}</td>
              <td><StatusBadge status={page.status} /></td>
              <td>v{page.version}</td>
              <td>{new Date(page.updatedAt).toLocaleDateString()}</td>
              <td>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => navigate(`/builder/${page._id}`)}
                    className="btn btn-primary"
                  >
                    Open Builder
                  </button>
                  <button
                    onClick={() => handleDelete(page._id)}
                    className="btn"
                    style={{ backgroundColor: '#fef2f2', color: '#ef4444', border: '1px solid #ef4444' }}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PageList;
