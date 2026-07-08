import '../../styles/auth.css';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="auth-left-overlay"></div>
        <div className="auth-left-content">
          <img src="/assets/tmpa-logo.png" alt="TMPA Logo" className="auth-logo" />
          <h1 className="auth-title">TMPA UI Builder</h1>
          <h2 className="auth-subtitle">Internal interface builder for developer teams</h2>
         
          
        </div>
      </div>
      <div className="auth-right">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
