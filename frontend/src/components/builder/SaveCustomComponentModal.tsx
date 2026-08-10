import { useState } from 'react';
import '../../styles/builder.css';

interface SaveCustomComponentModalProps {
  onClose: () => void;
  onSave: (name: string, description: string) => Promise<void>;
  isSaving: boolean;
  error: string | null;
}

const SaveCustomComponentModal = ({ onClose, onSave, isSaving, error }: SaveCustomComponentModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setValidationError("Name is required");
      return;
    }
    if (trimmedName.length > 80) {
      setValidationError("Name must be less than 80 characters");
      return;
    }
    if (description.length > 240) {
      setValidationError("Description must be less than 240 characters");
      return;
    }

    await onSave(trimmedName, description.trim());
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <h2>Save as Custom Component</h2>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSaving}>×</button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Name *</label>
              <input
                type="text"
                className="input-field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Primary Login Card"
                disabled={isSaving}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
              />
            </div>
            
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Description</label>
              <textarea
                className="input-field"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
                rows={3}
                disabled={isSaving}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
              />
            </div>

            {(validationError || error) && (
              <div style={{ color: '#ef4444', marginBottom: '16px', fontSize: '14px' }}>
                {validationError || error}
              </div>
            )}

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={onClose} 
                disabled={isSaving}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={isSaving}
                style={{ backgroundColor: '#1e3a66', color: 'white', padding: '8px 16px', borderRadius: '4px', border: 'none' }}
              >
                {isSaving ? "Saving..." : "Save Component"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SaveCustomComponentModal;
