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
    <div className="card">
      <h2 style={{ marginBottom: '1.25rem', fontSize: '1.25rem', color: 'var(--color-text)' }}>Create New Page</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input 
            type="text" 
            id="name"
            placeholder="Dashboard View"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required 
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description (optional)</label>
          <textarea 
            id="description"
            placeholder="A view for monitoring metrics"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
          />
        </div>
        
        {error && (
          <div style={{ backgroundColor: "var(--color-danger)", color: "white", marginBottom: '1rem', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
            {error}
          </div>
        )}

        <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%' }}>
          {loading ? "Creating..." : "Create page"}
        </button>
      </form>
    </div>
  );
};

export default CreatePageForm;
