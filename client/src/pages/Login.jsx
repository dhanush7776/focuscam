import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import styles from './Auth.module.css';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', form);
      login(
        {
          _id: res.data._id,
          name: res.data.name,
          username: res.data.username,
          motivation: res.data.motivation,
        },
        res.data.token
      );
      navigate('/motivation');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div style={{ textAlign: 'center', marginBottom: 28, animation: 'fadeUp 0.5s ease' }}>
        <div style={{
          width: 68, height: 68,
          background: 'linear-gradient(135deg, var(--accent), #5a4fd4)',
          borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 14px',
          fontSize: 30,
          animation: 'pulse 3s ease-in-out infinite',
        }}>👁</div>
        <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: -1 }}>
          Focus<span style={{ color: 'var(--accent)' }}>Cam</span>
        </h1>
        <p style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: 12, marginTop: 6 }}>
          // stay present. stay sharp.
        </p>
      </div>

      <div className="card" style={{ animation: 'fadeUp 0.5s ease 0.1s both' }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--surface2)', borderRadius: 10, padding: 4 }}>
          <div style={{ flex: 1, padding: '8px', background: 'var(--accent)', borderRadius: 8, textAlign: 'center', fontSize: 14, fontWeight: 700 }}>
            Login
          </div>
          <Link to="/signup" style={{ flex: 1, padding: '8px', textAlign: 'center', fontSize: 14, color: 'var(--muted)', display: 'block' }}>
            Sign Up
          </Link>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="field">
            <label>Username</label>
            <input
              name="username"
              type="text"
              placeholder="your username"
              value={form.username}
              onChange={handleChange}
              autoComplete="username"
            />
          </div>

          <div className="field">
            <label>Password</label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
          </div>

          {error && <div className="error-msg">{error}</div>}

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Enter Focus Mode →'}
          </button>

          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: 'var(--accent)' }}>Sign up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
