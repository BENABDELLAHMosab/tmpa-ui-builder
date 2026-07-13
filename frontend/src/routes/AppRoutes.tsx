import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import DeveloperDashboardPage from '../pages/DeveloperDashboardPage';
import BuilderPage from '../pages/BuilderPage';
import PreviewPage from '../pages/PreviewPage';
import ProtectedRoute from './ProtectedRoute';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route 
        path="/admin/dashboard" 
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboardPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/developer/dashboard" 
        element={
          <ProtectedRoute allowedRoles={["user-developer","admin"]}>
            <DeveloperDashboardPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/builder/:pageId" 
        element={
          <ProtectedRoute allowedRoles={["user-developer","admin"]}>
            <BuilderPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/preview/:pageId" 
        element={
          <ProtectedRoute allowedRoles={["user-developer","admin"]}>
            <PreviewPage />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
