import React, { useState } from 'react';

const LoginCard: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("Authentication will be implemented in the next sprint.");
  };

  return (
    <div className="login-card">
      <h2 className="login-title">Welcome back</h2>
      <p className="login-subtitle">Sign in to access your developer workspace</p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="email">Email</label>
          <input 
            type="email" 
            id="email"
            className="form-input" 
            placeholder="developer@tmpa.ma"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
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
          />
        </div>
        
        <button type="submit" className="btn-primary">Sign in</button>
      </form>

      {message && (
        <div className="login-message">
          {message}
        </div>
      )}

      <p className="login-help">
        Access reserved for Admin and User-Developer roles
      </p>
    </div>
  );
};

export default LoginCard;
