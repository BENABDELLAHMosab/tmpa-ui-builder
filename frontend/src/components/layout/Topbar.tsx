import { useNavigate } from 'react-router-dom';
import { clearAuthStorage } from '../../utils/authStorage';

interface TopbarProps {
  title: string;
}

const Topbar = ({ title }: TopbarProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuthStorage();
    navigate('/login', { replace: true });
  };

  return (
    <header className="portal-topbar" style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 2rem' }}>
      <button 
        className="btn btn-primary" 
        onClick={handleLogout}
        style={{ 
          padding: '0.5rem 1.25rem', 
          fontSize: '14px', 
          fontWeight: 500, 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px' 
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
        Logout
      </button>
    </header>
  );
};

export default Topbar;
