import { NavLink } from 'react-router-dom';
import { getAuthUser, getDashboardPathByRole } from '../../utils/authStorage';

const Sidebar = () => {
  const user = getAuthUser();
  const homePath = user ? getDashboardPathByRole(user.role) : '/login';

  return (
    <aside className="portal-sidebar">
      <div className="portal-sidebar-logo">
        <img src="/assets/2-TMPA.png" alt="TMPA Logo" />
      </div>
      <nav className="portal-sidebar-nav">
        {user?.role === 'admin' ? (
          <>
            <NavLink
              to="/admin/pending-requests"
              className={({ isActive }) => `portal-nav-item ${isActive ? 'active' : ''}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              <span>Pending Requests</span>
            </NavLink>
            <NavLink
              to="/admin/publication"
              className={({ isActive }) => `portal-nav-item ${isActive ? 'active' : ''}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              <span>Publication</span>
            </NavLink>
          </>
        ) : (
          <NavLink
            to={homePath}
            className={({ isActive }) => `portal-nav-item ${isActive ? 'active' : ''}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            <span>Home</span>
          </NavLink>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
