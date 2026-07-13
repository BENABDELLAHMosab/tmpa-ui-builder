import { useState } from 'react';
import type { FormEvent } from 'react';
import { pageService } from '../../services/page.service';
import type { UiPage } from '../../types/page';
import '../../styles/auth.css'; // Reuse form styles

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
    <div className="card" style={{ marginBottom: '2rem' }}>
      <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem', color: '#0f172a' }}>Create New Page</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="name">Name</label>
          <input 
            type="text" 
            id="name"
            className="form-input" 
            placeholder="Dashboard View"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required 
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="description">Description (optional)</label>
          <textarea 
            id="description"
            className="form-input" 
            placeholder="A view for monitoring metrics"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
            rows={3}
            style={{ resize: 'vertical' }}
          />
        </div>
        
        {error && (
          <div className="login-message" style={{ backgroundColor: "#fee2e2", color: "#b91c1c", marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <button type="submit" className="btn-primary" disabled={loading} style={{ width: 'auto', padding: '0.5rem 1.5rem' }}>
          {loading ? "Creating..." : "Create page"}
        </button>
      </form>
    </div>
  );
};

export default CreatePageForm;
