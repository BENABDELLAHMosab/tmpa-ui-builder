import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import DeveloperDashboardPage from '../pages/DeveloperDashboardPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
      <Route path="/developer/dashboard" element={<DeveloperDashboardPage />} />
    </Routes>
  );
};

export default AppRoutes;
