import '../../styles/builder.css';

interface DeleteCustomComponentModalProps {
  componentName: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
  error: string | null;
}

const DeleteCustomComponentModal = ({ componentName, onClose, onConfirm, isDeleting, error }: DeleteCustomComponentModalProps) => {
  return (
    <div className="save-custom-modal-overlay">
      <div className="save-custom-modal" style={{ maxWidth: 400 }}>
        <div className="save-custom-modal__header">
          <div className="save-custom-modal__title-group">
            <h2 className="save-custom-modal__title">Delete "{componentName}"?</h2>
          </div>
          <button type="button" className="save-custom-modal__close-btn" onClick={onClose} disabled={isDeleting}>×</button>
        </div>
        
        <div className="save-custom-modal__body">
          <p style={{ margin: '0 0 16px 0', fontSize: 14, color: '#334155', lineHeight: 1.5 }}>
            This will remove it from My Components.
            Existing instances already placed on pages will not be affected.
          </p>

          {error && (
            <div className="save-custom-modal__error">
              {error}
            </div>
          )}
        </div>

        <div className="save-custom-modal__footer">
          <button 
            type="button" 
            className="save-custom-modal__btn-cancel" 
            onClick={onClose} 
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button 
            type="button" 
            className="save-custom-modal__btn-save" 
            style={{ backgroundColor: '#ef4444', borderColor: '#ef4444' }}
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteCustomComponentModal;
