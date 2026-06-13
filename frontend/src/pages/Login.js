import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const result = await login(email, password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(typeof result.error === 'string' ? result.error : 'Login failed. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-background"></div>
      <div className="auth-card">
        <div className="auth-logo">
          <Logo size="large" />
        </div>
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Sign in to your Spreetail account</p>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="•••••••••"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block">
            Sign In
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <a href="/register">Create Account</a>
        </p>

        <div className="auth-features">
          <div className="feature">
            <div className="feature-icon">💰</div>
            <div className="feature-text">Track expenses</div>
          </div>
          <div className="feature">
            <div className="feature-icon">⚖️</div>
            <div className="feature-text">Split bills easily</div>
          </div>
          <div className="feature">
            <div className="feature-icon">👥</div>
            <div className="feature-text">Manage groups</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;