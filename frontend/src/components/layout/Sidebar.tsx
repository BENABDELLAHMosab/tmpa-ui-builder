import { NavLink } from 'react-router-dom';
import { getAuthUser, getDashboardPathByRole } from '../../utils/authStorage';

const Sidebar = () => {
  const user = getAuthUser();
  const homePath = user ? getDashboardPathByRole(user.role) : '/login';

  return (
    <aside className="portal-sidebar">
      <div className="portal-sidebar-logo">
        <img src="/assets/tmpa-logo.png" alt="TMPA Logo" />
      </div>
      <nav className="portal-sidebar-nav">
        {user?.role === 'admin' ? (
          <>
            <NavLink 
              to="/admin/pending-requests" 
              className={({ isActive }) => `portal-nav-item ${isActive ? 'active' : ''}`}
            >
              <span>📋 Pending Requests</span>
            </NavLink>
            <NavLink 
              to="/admin/publication" 
              className={({ isActive }) => `portal-nav-item ${isActive ? 'active' : ''}`}
            >
              <span>📢 Publication</span>
            </NavLink>
          </>
        ) : (
          <NavLink 
            to={homePath} 
            className={({ isActive }) => `portal-nav-item ${isActive ? 'active' : ''}`}
          >
            <span>🏠 Home</span>
          </NavLink>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
