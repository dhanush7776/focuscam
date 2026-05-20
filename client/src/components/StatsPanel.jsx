export default function StatsPanel({ sessionSeconds, focusSeconds, alertCount, streakSeconds }) {
  const focusPct = sessionSeconds > 0 ? Math.round((focusSeconds / sessionSeconds) * 100) : 100;

  const fmt = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
      <StatCard
        label="Focus %"
        value={`${focusPct}%`}
        color={focusPct >= 70 ? 'var(--accent2)' : 'var(--danger)'}
      />
      <StatCard
        label="Alerts"
        value={alertCount}
        color={alertCount === 0 ? 'var(--accent2)' : 'var(--danger)'}
      />
      <StatCard
        label="Streak"
        value={`${streakSeconds}s`}
        color="var(--accent)"
      />
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{
      background: 'var(--surface2)',
      borderRadius: 10,
      padding: '10px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
    }}>
      <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color }}>
        {value}
      </div>
    </div>
  );
}
