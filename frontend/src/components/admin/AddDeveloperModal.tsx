import { useState } from 'react';
import type { FormEvent } from 'react';
import { authService } from '../../services/auth.service';

interface AddDeveloperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

const AddDeveloperModal = ({ isOpen, onClose, onSuccess }: AddDeveloperModalProps) => {
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setFullName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setCreateError(null);
    setCreateSuccess(null);
  };

  const handleClose = () => {
    if (isCreating) return;
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreateError(null);
    setCreateSuccess(null);

    const trimmedFullName = fullName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedFullName) {
      setCreateError('Full name is required.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setCreateError('Please enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setCreateError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setCreateError('Passwords do not match.');
      return;
    }

    try {
      setIsCreating(true);
      const result = await authService.createDeveloperAccount({
        fullName: trimmedFullName,
        email: trimmedEmail.toLowerCase(),
        password
      });

      const message = result.message || 'Developer account created successfully';
      setCreateSuccess(message);
      resetForm();
      onSuccess(message);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create developer account.';
      setCreateError(message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="add-dev-title">
      <div className="modal-content" style={{ padding: '24px', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 id="add-dev-title" style={{ margin: 0, fontSize: '18px', color: 'var(--color-primary)' }}>
            Add Developer
          </h2>
          <button
            type="button"
            onClick={handleClose}
            disabled={isCreating}
            aria-label="Close"
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: isCreating ? 'not-allowed' : 'pointer',
              color: 'var(--color-muted)',
              lineHeight: 1
            }}
          >
            &times;
          </button>
        </div>

        {createError && (
          <div
            role="alert"
            style={{
              backgroundColor: 'var(--color-danger)',
              color: 'white',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '16px',
              fontSize: '14px'
            }}
          >
            {createError}
          </div>
        )}

        {createSuccess && (
          <div
            role="status"
            style={{
              backgroundColor: 'var(--color-success)',
              color: 'white',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '16px',
              fontSize: '14px'
            }}
          >
            {createSuccess}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="dev-fullName">Full Name</label>
            <input
              id="dev-fullName"
              type="text"
              placeholder="e.g. John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isCreating}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="dev-email">Email</label>
            <input
              id="dev-email"
              type="email"
              placeholder="developer@tmpa.ma"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isCreating}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="dev-password">Password</label>
            <input
              id="dev-password"
              type="password"
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isCreating}
              required
              minLength={8}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="dev-confirmPassword">Confirm Password</label>
            <input
              id="dev-confirmPassword"
              type="password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isCreating}
              required
              minLength={8}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
              disabled={isCreating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isCreating}
            >
              {isCreating ? 'Creating...' : 'Create Developer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDeveloperModal;
