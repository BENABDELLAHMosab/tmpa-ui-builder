import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';

const LoginCard = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login({ email, password });
      
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("authUser", JSON.stringify(response.user));
      
      if (response.user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/developer/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-card">
      <h2 className="login-title">Welcome Back</h2>
      <p className="login-subtitle">Sign in to access your developer workspace</p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="email">Email</label>
          <input 
            type="email" 
            id="email"
            className="form-input" 
            placeholder="user@tmpa.ma"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="password">Password</label>
          <input 
            type="password" 
            id="password"
            className="form-input" 
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
            disabled={loading}
          />
        </div>

        
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      {error && (
        <div className="login-message" style={{ backgroundColor: "#fee2e2", color: "#b91c1c" }}>
          {error}
        </div>
      )}

      <p className="login-help">
        Access reserved for Admin and User-Developer roles
      </p>
    </div>
  );
};

export default LoginCard;

