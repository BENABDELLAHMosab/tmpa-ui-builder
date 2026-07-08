import React from 'react';
import AuthLayout from '../components/layout/AuthLayout';
import LoginCard from '../components/auth/LoginCard';

const LoginPage: React.FC = () => {
  return (
    <AuthLayout>
      <LoginCard />
    </AuthLayout>
  );
};

export default LoginPage;
