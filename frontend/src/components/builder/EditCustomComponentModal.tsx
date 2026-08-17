import { useState, useEffect } from 'react';
import '../../styles/builder.css';

interface EditCustomComponentModalProps {
  initialName: string;
  initialDescription: string;
  onClose: () => void;
  onSave: (name: string, description: string) => Promise<void>;
  isSaving: boolean;
  error: string | null;
}

const EditCustomComponentModal = ({ 
  initialName, 
  initialDescription, 
  onClose, 
  onSave, 
  isSaving, 
  error 
}: EditCustomComponentModalProps) => {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    setName(initialName);
    setDescription(initialDescription);
  }, [initialName, initialDescription]);

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setLocalError("Name is required");
      return;
    }
    if (trimmedName.length > 50) {
      setLocalError("Name is too long (maximum 50 characters)");
      return;
    }
    if (description && description.length > 200) {
      setLocalError("Description is too long (maximum 200 characters)");
      return;
    }

    setLocalError(null);
    await onSave(trimmedName, description);
  };

  const displayError = localError || error;

  return (
    <div className="save-custom-modal-overlay">
      <div className="save-custom-modal" style={{ maxWidth: 460 }}>
        <div className="save-custom-modal__header">
          <div className="save-custom-modal__title-group">
            <h2 className="save-custom-modal__title">Edit Component</h2>
          </div>
          <button 
            type="button" 
            className="save-custom-modal__close-btn" 
            onClick={onClose} 
            disabled={isSaving}
          >
            ×
          </button>
        </div>
        
        <div className="save-custom-modal__body">
          <div className="save-custom-modal__field">
            <label className="save-custom-modal__label">Name *</label>
            <input 
              type="text" 
              className="save-custom-modal__input" 
              placeholder="e.g. Navigation Bar"
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={isSaving}
              autoFocus
            />
          </div>

          <div className="save-custom-modal__field">
            <label className="save-custom-modal__label">Description (optional)</label>
            <textarea 
              className="save-custom-modal__input save-custom-modal__textarea" 
              placeholder="Brief description of what this component does..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              disabled={isSaving}
            />
          </div>

          {displayError && (
            <div className="save-custom-modal__error">
              {displayError}
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
            type="button" 
            className="save-custom-modal__btn-save" 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditCustomComponentModal;
