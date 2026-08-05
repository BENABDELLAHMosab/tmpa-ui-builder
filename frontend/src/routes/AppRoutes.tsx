import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import AdminDevelopersPage from '../pages/AdminDevelopersPage';
import DeveloperDashboardPage from '../pages/DeveloperDashboardPage';
import BuilderPage from '../pages/BuilderPage';
import PreviewPage from '../pages/PreviewPage';
import ProtectedRoute from './ProtectedRoute';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin/dashboard" element={<Navigate to="/admin/pending-requests" replace />} />
      <Route 
        path="/admin/pending-requests" 
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboardPage view="pending" />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/publication" 
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboardPage view="publication" />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/developers" 
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDevelopersPage />
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
      <Route 
        path="/pages/:pageId/versions/:versionNumber/preview" 
        element={
          <ProtectedRoute allowedRoles={["user-developer", "admin"]}>
            <PreviewPage />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
