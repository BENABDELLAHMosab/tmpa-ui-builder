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
    <header className="portal-topbar">
      <h1 className="portal-topbar-title">{title}</h1>
      <div>
        <button className="btn btn-primary" onClick={handleLogout} style={{ backgroundColor: '#0f172a', padding: '6px 14px', borderRadius: '6px', fontSize: '12px' }}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default Topbar;
