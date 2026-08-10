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
    <div className="save-custom-modal-overlay">
      <div className="save-custom-modal">
        <div className="save-custom-modal__header">
          <div className="save-custom-modal__title-group">
            <h2 className="save-custom-modal__title">Save as Custom Component</h2>
            <p className="save-custom-modal__subtitle">Create a reusable component from the selected container.</p>
          </div>
          <button type="button" className="save-custom-modal__close-btn" onClick={onClose} disabled={isSaving}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="save-custom-modal__body">
            <div className="save-custom-modal__field-group">
              <label className="save-custom-modal__label">Name *</label>
              <input
                type="text"
                className="save-custom-modal__input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Primary Login Card"
                disabled={isSaving}
              />
            </div>
            
            <div className="save-custom-modal__field-group">
              <label className="save-custom-modal__label">Description</label>
              <textarea
                className="save-custom-modal__textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
                rows={3}
                disabled={isSaving}
              />
            </div>

            {(validationError || error) && (
              <div className="save-custom-modal__error">
                {validationError || error}
              </div>
            )}
          </div>

          <div className="save-custom-modal__footer">
            <button 
              type="button" 
              className="save-custom-modal__btn-cancel" 
              onClick={onClose} 
              disabled={isSaving}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="save-custom-modal__btn-save" 
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Component"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaveCustomComponentModal;
