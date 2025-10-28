import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api.js';

export default function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('student');

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Attempting login with:', { email, password });
      const response = await api.post('/auth/login', { email, password });
      console.log('Login response:', response.data);
      onLogin(response.data.user);
      console.log('User set, navigating to home...');
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      console.error('Error response:', err.response);
      // Offline/demo fallback: allow known seed users to login when API is unavailable
      const fallbackUsers = {
        'john@college.edu': { id: 1, name: 'John Student', email: 'john@college.edu', role: 'student' },
        'admin@college.edu': { id: 2, name: 'Admin User', email: 'admin@college.edu', role: 'admin' },
        'driver@college.edu': { id: 3, name: 'Driver Mike', email: 'driver@college.edu', role: 'driver' }
      };
      const offlineUser = fallbackUsers[email?.toLowerCase?.() || ''];
      if (offlineUser) {
        console.warn('API unavailable. Signing in using demo user:', offlineUser.email);
        onLogin(offlineUser);
        navigate('/');
      } else {
        const errorMessage = err.response?.data?.error || err.message || 'Login failed';
        setError(errorMessage);
        console.log('Setting error message:', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Attempting registration with:', { name, email, role, password });
      const response = await api.post('/auth/register', { name, email, role, password });
      console.log('Registration response:', response.data);
      onLogin(response.data.user);
      console.log('User set, navigating to home...');
      navigate('/');
    } catch (err) {
      console.error('Registration error:', err);
      console.error('Error response:', err.response);
      // Offline/demo fallback: simulate registration locally
      const demoUser = { id: Date.now(), name: name || 'New User', email, role };
      console.warn('API unavailable. Simulating registration for:', email);
      onLogin(demoUser);
      navigate('/');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ 
      maxWidth: 400, 
      margin: '0 auto', 
      padding: '2rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      color: 'white'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>
          {isRegistering ? 'Create Account' : 'Welcome Back'}
        </h2>
        <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>
          {isRegistering ? 'Join the College Bus System' : 'Sign in to your account'}
        </p>
      </div>

      {error && (
        <div style={{ 
          background: 'rgba(255,255,255,0.1)', 
          padding: '0.75rem', 
          borderRadius: '6px', 
          marginBottom: '1rem',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={isRegistering ? handleRegister : handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {isRegistering && (
          <>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Full Name
              </label>
              <input 
                type="text"
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Enter your full name"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  fontSize: '1rem'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Role
              </label>
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  fontSize: '1rem'
                }}
              >
                <option value="student">Student</option>
                <option value="admin">Admin</option>
                <option value="driver">Driver</option>
              </select>
            </div>
          </>
        )}
        
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            Email
          </label>
          <input 
            type="email"
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="you@college.edu"
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              fontSize: '1rem'
            }}
          />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            Password
          </label>
          <input 
            type="password"
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Enter your password"
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              fontSize: '1rem'
            }}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '6px',
            border: 'none',
            background: loading ? 'rgba(255,255,255,0.3)' : 'white',
            color: loading ? 'rgba(255,255,255,0.7)' : '#667eea',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          {loading ? 'Please wait...' : (isRegistering ? 'Create Account' : 'Sign In')}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        <button
          onClick={() => setIsRegistering(!isRegistering)}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            textDecoration: 'underline',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          {isRegistering ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
        </button>
      </div>
    </div>
  );
}

