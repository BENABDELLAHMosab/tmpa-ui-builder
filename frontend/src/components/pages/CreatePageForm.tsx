import { useState } from 'react';
import type { FormEvent } from 'react';
import { pageService } from '../../services/page.service';
import type { UiPage } from '../../types/page';

interface CreatePageFormProps {
  onPageCreated: (page: UiPage) => void;
}

const CreatePageForm = ({ onPageCreated }: CreatePageFormProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const newPage = await pageService.createPage({ name, description });
      onPageCreated(newPage);
      setName('');
      setDescription('');
    } catch (err: any) {
      setError(err.message || "Failed to create page");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ padding: '16px', width: '100%', margin: '0', marginBottom: '16px' }}>
      <h2 style={{ marginBottom: '12px', fontSize: '16px', textAlign: 'center' }}>Create New Page</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <label htmlFor="name" style={{ fontWeight: 600 }}>Name</label>
          <input
            type="text"
            id="name"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
            style={{ backgroundColor: 'var(--color-bg)' }}
          />
        </div>
        <div>
          <label htmlFor="description" style={{ fontWeight: 600 }}>Description (optional)</label>
          <input
            type="text"
            id="description"
            placeholder="A view for monitoring metrics"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
            style={{ backgroundColor: 'var(--color-bg)' }}
          />
        </div>

        {error && (
          <div style={{ backgroundColor: "var(--color-danger)", color: "white", padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4px' }}>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '120px', height: '34px' }}>
            {loading ? "Creating..." : "Create Page"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePageForm;
