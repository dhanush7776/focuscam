import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Summary() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(true);

  const data = location.state || {};
  const {
    motivation = '',
    totalSeconds = 0,
    focusSeconds = 0,
    focusScore = 100,
    alertCount = 0,
    alerts = [],
    longestStreak = 0,
  } = data;

  const fmtTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

  const getGrade = (score) => {
    if (score >= 90) return { label: 'Excellent! 🏆', color: 'var(--accent2)' };
    if (score >= 75) return { label: 'Great Job! 🎯', color: 'var(--accent)' };
    if (score >= 60) return { label: 'Good Effort 👍', color: 'var(--warning)' };
    return { label: 'Keep Trying 💪', color: 'var(--danger)' };
  };

  const grade = getGrade(focusScore);

  // Save session to backend
  useEffect(() => {
    async function saveSession() {
      try {
        await axios.post('/api/sessions', {
          motivation,
          totalSeconds,
          focusSeconds,
          alertCount,
          alerts,
          longestStreak,
        });
        setSaved(true);
      } catch (err) {
        console.error('Could not save session:', err.message);
      } finally {
        setSaving(false);
      }
    }
    if (totalSeconds > 0) saveSession();
    else setSaving(false);
  }, []);

  return (
    <div className="page" style={{ gap: 20 }}>
      {/* Trophy */}
      <div style={{
        width: 80, height: 80, borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--accent2), var(--accent))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 36, animation: 'pop 0.5s ease',
      }}>🏆</div>

      <div style={{ textAlign: 'center', animation: 'fadeUp 0.4s ease 0.1s both' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Session Complete!</h1>
        <p style={{ color: grade.color, fontWeight: 700, fontSize: 16 }}>{grade.label}</p>
      </div>

      {/* Stats */}
      <div className="card" style={{ width: '100%', maxWidth: 420, animation: 'fadeUp 0.4s ease 0.2s both', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <StatBox label="Total Time" value={fmtTime(totalSeconds)} color="var(--text)" fullWidth />
          <StatBox label="Focus Score" value={`${focusScore}%`} color={focusScore >= 70 ? 'var(--accent2)' : 'var(--danger)'} />
          <StatBox label="Alerts Fired" value={alertCount} color={alertCount === 0 ? 'var(--accent2)' : 'var(--danger)'} />
          <StatBox label="Best Streak" value={fmtTime(longestStreak)} color="var(--accent)" />
        </div>

        {motivation && (
          <div style={{
            background: 'var(--surface2)', borderRadius: 10, padding: '12px 14px',
            borderLeft: '3px solid var(--accent)',
          }}>
            <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
              Your motivation
            </div>
            <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>{motivation}</div>
          </div>
        )}

        <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: saving ? 'var(--muted)' : saved ? 'var(--accent2)' : 'var(--danger)', textAlign: 'center' }}>
          {saving ? '⏳ Saving session...' : saved ? '✅ Session saved' : '⚠ Could not save session'}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 420, animation: 'fadeUp 0.4s ease 0.3s both' }}>
        <button className="btn btn-primary" onClick={() => navigate('/motivation')}>
          Start New Session →
        </button>
        <button className="btn btn-secondary" onClick={() => navigate('/history')}>
          View All Sessions
        </button>
      </div>
    </div>
  );
}

function StatBox({ label, value, color, fullWidth }) {
  return (
    <div style={{
      background: 'var(--surface2)', borderRadius: 10, padding: '12px 14px',
      gridColumn: fullWidth ? '1 / -1' : undefined,
    }}>
      <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: fullWidth ? 26 : 20, fontWeight: 700, color }}>
        {value}
      </div>
    </div>
  );
}
