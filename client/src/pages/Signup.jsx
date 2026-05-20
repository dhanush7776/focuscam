import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [form, setForm] = useState({ name: '', username: '', password: '' });
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
    if (!form.name || !form.username || !form.password) {
      setError('Please fill in all fields');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/signup', form);
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
      setError(err.response?.data?.message || 'Signup failed. Try again.');
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
          margin: '0 auto 14px', fontSize: 30,
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
          <Link to="/login" style={{ flex: 1, padding: '8px', textAlign: 'center', fontSize: 14, color: 'var(--muted)', display: 'block' }}>
            Login
          </Link>
          <div style={{ flex: 1, padding: '8px', background: 'var(--accent)', borderRadius: 8, textAlign: 'center', fontSize: 14, fontWeight: 700 }}>
            Sign Up
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="field">
            <label>Full Name</label>
            <input name="name" type="text" placeholder="your full name" value={form.name} onChange={handleChange} />
          </div>

          <div className="field">
            <label>Username</label>
            <input name="username" type="text" placeholder="choose a username" value={form.username} onChange={handleChange} autoComplete="username" />
          </div>

          <div className="field">
            <label>Password</label>
            <input name="password" type="password" placeholder="min. 6 characters" value={form.password} onChange={handleChange} autoComplete="new-password" />
          </div>

          {error && <div className="error-msg">{error}</div>}

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account →'}
          </button>

          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent)' }}>Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
