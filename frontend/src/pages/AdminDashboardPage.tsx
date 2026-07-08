import { useNavigate } from 'react-router-dom';
import { clearAuthStorage } from '../utils/authStorage';

const AdminDashboardPage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuthStorage();
    navigate('/login', { replace: true });
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Admin Dashboard</h1>
      <p>Manage validation requests and monitor all developer pages.</p>
      <button 
        onClick={handleLogout}
        style={{
          marginTop: '1rem', padding: '0.75rem 1.5rem', 
          backgroundColor: '#0f172a', color: 'white', 
          border: 'none', borderRadius: '4px', cursor: 'pointer'
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default AdminDashboardPage;
