import { useEffect, useState } from 'react';
import { authService } from '../services/auth.service';
import type { DeveloperAccount, AccountStatus } from '../types/auth';
import PortalLayout from '../components/layout/PortalLayout';
import StatusBadge from '../components/ui/StatusBadge';
import AddDeveloperModal from '../components/admin/AddDeveloperModal';
import '../styles/dashboard.css';

const AdminDevelopersPage = () => {
  const [developers, setDevelopers] = useState<DeveloperAccount[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [updatingDeveloperId, setUpdatingDeveloperId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isAddDevModalOpen, setIsAddDevModalOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchDevelopers();
  }, []);

  const fetchDevelopers = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const data = await authService.getDevelopers();
      setDevelopers(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load developers';
      setLoadError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (developer: DeveloperAccount) => {
    const nextStatus: AccountStatus = developer.accountStatus === 'active' ? 'suspended' : 'active';
    const actionLabel = nextStatus === 'suspended' ? 'suspend' : 'reactivate';

    const confirmed = window.confirm(
      `Are you sure you want to ${actionLabel} the account for "${developer.fullName}"?`
    );
    if (!confirmed) return;

    try {
      setUpdatingDeveloperId(developer.id);
      const updatedDeveloper = await authService.updateDeveloperStatus(developer.id, nextStatus);

      setDevelopers((current) =>
        current.map((dev) => (dev.id === updatedDeveloper.id ? updatedDeveloper : dev))
      );

      setSuccessMessage(
        `Developer account "${developer.fullName}" has been ${
          nextStatus === 'suspended' ? 'suspended' : 'reactivated'
        } successfully.`
      );
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update developer status';
      alert(message);
    } finally {
      setUpdatingDeveloperId(null);
    }
  };

  const handleDeveloperCreated = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 4000);
    fetchDevelopers();
  };

  if (isLoading) {
    return (
      <PortalLayout>
        <p style={{ color: 'var(--color-muted)' }}>Loading developers...</p>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      {loadError && (
        <div
          role="alert"
          style={{
            color: 'white',
            backgroundColor: 'var(--color-danger)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem'
          }}
        >
          {loadError}
        </div>
      )}
      {successMessage && (
        <div
          role="status"
          style={{
            color: 'white',
            backgroundColor: 'var(--color-success)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem'
          }}
        >
          {successMessage}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '20px', color: 'var(--color-primary)', margin: '0 0 4px 0' }}>
              Developers
            </h2>
            <p style={{ margin: 0, color: 'var(--color-muted)', fontSize: '14px' }}>
              Manage developer accounts, access permissions, and account status.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsAddDevModalOpen(true)}
          >
            Add Developer
          </button>
        </div>

        <section className="stats-grid">
          <article className="stat-card">
            <span className="stat-card__label">Total Developers</span>
            <strong className="stat-card__value">{developers.length}</strong>
          </article>
        </section>

        <div className="card" style={{ padding: '0' }}>
          {developers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
              <p style={{ fontSize: '1.1rem', fontWeight: 500, margin: '0 0 8px 0' }}>
                No developers found.
              </p>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>
                Create a developer account to get started.
              </p>
            </div>
          ) : (
            <div className="portal-table-container" style={{ border: 'none', boxShadow: 'none' }}>
              <table className="portal-table">
                <thead>
                  <tr>
                    <th>Developer</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Created at</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {developers.map((dev) => {
                    const isUpdating = updatingDeveloperId === dev.id;
                    const isActive = dev.accountStatus === 'active';

                    return (
                      <tr key={dev.id}>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {dev.fullName}
                        </td>
                        <td>{dev.email}</td>
                        <td>
                          <StatusBadge status={dev.accountStatus} />
                        </td>
                        <td>{new Date(dev.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div className="table-actions">
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(dev)}
                              className={isActive ? 'btn btn-danger' : 'btn btn-success'}
                              disabled={isUpdating}
                            >
                              {isUpdating
                                ? 'Updating...'
                                : isActive
                                ? 'Suspend'
                                : 'Reactivate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <AddDeveloperModal
        isOpen={isAddDevModalOpen}
        onClose={() => setIsAddDevModalOpen(false)}
        onSuccess={handleDeveloperCreated}
      />
    </PortalLayout>
  );
};

export default AdminDevelopersPage;
