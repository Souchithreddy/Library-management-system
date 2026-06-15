import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../api';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const fn = mode === 'login' ? login : register;
      const res = await fn(form);
      const user = res.data.user;
      setUser(user);
      navigate(user.role === 'librarian' ? '/librarian/dashboard' : '/student/browse');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>📖 LibraryOS</h1>
        <p>{mode === 'login' ? 'Sign in to your account' : 'Create a new account'}</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="form-group">
              <label>Full Name</label>
              <input value={form.name} onChange={e => update('name', e.target.value)}
                placeholder="Your full name" required />
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={e => update('email', e.target.value)}
              placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={form.password} onChange={e => update('password', e.target.value)}
              placeholder="••••••••" required />
          </div>
          {mode === 'register' && (
            <div className="form-group">
              <label>Role</label>
              <select value={form.role} onChange={e => update('role', e.target.value)}>
                <option value="student">Student</option>
                <option value="librarian">Librarian</option>
              </select>
            </div>
          )}

          <button className="btn btn-primary" type="submit" disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--muted)' }}>
          {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
            style={{ border: 'none', background: 'none', color: 'var(--navy)', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
            {mode === 'login' ? 'Register' : 'Sign In'}
          </button>
        </p>

        <div style={{ marginTop: 24, padding: 14, background: 'var(--cream)', borderRadius: 8, fontSize: 12, color: 'var(--muted)' }}>
          <strong>Demo credentials:</strong><br />
          Librarian: librarian@library.com / librarian123<br />
          Student: arjun@student.com / student123
        </div>
      </div>
    </div>
  );
}
