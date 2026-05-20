import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function History() {
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await axios.get('/api/sessions');
        setSessions(res.data.sessions);
        setStats(res.data.stats);
      } catch (err) {
        console.error('Could not load history:', err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  const fmtTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

  const fmtDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="page" style={{ justifyContent: 'flex-start', paddingTop: 32, maxWidth: 480, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>Session History</h1>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 2 }}>
            Welcome back, <span style={{ color: 'var(--accent)' }}>{user?.name}</span>
          </p>
        </div>
        <button className="btn btn-secondary" style={{ width: 'auto', padding: '8px 14px', fontSize: 13 }} onClick={logout}>
          Logout
        </button>
      </div>

      {/* Lifetime stats */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%', marginBottom: 20 }}>
          <StatCard label="Total Sessions" value={stats.totalSessions} color="var(--accent)" />
          <StatCard label="Avg Focus Score" value={`${stats.avgFocusScore}%`} color="var(--accent2)" />
          <StatCard label="Total Focus Time" value={fmtTime(stats.totalFocusTime)} color="var(--text)" />
          <StatCard label="Total Alerts" value={stats.totalAlerts} color="var(--danger)" />
        </div>
      )}

      <button className="btn btn-primary" onClick={() => navigate('/motivation')} style={{ width: '100%', marginBottom: 20 }}>
        + Start New Session
      </button>

      {/* Sessions list */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <p style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Recent Sessions
        </p>

        {loading && (
          <div style={{ textAlign: 'center', color: 'var(--muted)', padding: 24, fontFamily: 'var(--font-mono)', fontSize: 13 }}>
            Loading...
          </div>
        )}

        {!loading && sessions.length === 0 && (
          <div style={{
            textAlign: 'center', color: 'var(--muted)', padding: 32,
            background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
            <p style={{ fontWeight: 700, marginBottom: 4 }}>No sessions yet</p>
            <p style={{ fontSize: 13 }}>Complete your first focus session to see history here.</p>
          </div>
        )}

        {sessions.map((s) => (
          <div key={s._id} style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 14, padding: '14px 16px',
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)' }}>
                {fmtDate(s.createdAt)}
              </div>
              <div style={{
                padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                background: s.focusScore >= 70 ? 'var(--accent2)' : 'var(--danger-dim)',
                color: s.focusScore >= 70 ? '#0a0a0f' : 'var(--danger)',
              }}>
                {s.focusScore}%
              </div>
            </div>

            <div style={{ display: 'flex', gap: 16 }}>
              <MiniStat label="Duration" value={fmtTime(s.totalSeconds)} />
              <MiniStat label="Focused" value={fmtTime(s.focusSeconds)} />
              <MiniStat label="Alerts" value={s.alertCount} />
            </div>

            {s.motivation && (
              <div style={{ fontSize: 12, color: 'var(--muted)', fontStyle: 'italic', borderTop: '1px solid var(--border)', paddingTop: 8 }}>
                "{s.motivation.length > 70 ? s.motivation.slice(0, 70) + '...' : s.motivation}"
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px' }}>
      <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 700 }}>{value}</div>
    </div>
  );
}
