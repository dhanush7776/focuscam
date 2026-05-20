export default function AlertOverlay({ distraction, motivation }) {
  if (!distraction) return null;

  return (
    <div style={{
      position: 'absolute',
      top: 12, left: 12, right: 12,
      background: 'rgba(10, 10, 15, 0.95)',
      border: '1px solid rgba(255, 107, 107, 0.5)',
      borderRadius: 12,
      padding: '14px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      animation: 'slideDown 0.3s ease',
      zIndex: 10,
    }}>
      <div style={{
        fontSize: 11, fontFamily: 'var(--font-mono)',
        color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: 1,
      }}>
        ⚠ Distraction Detected
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
        {distraction.message}
      </div>
      {motivation && (
        <div style={{ fontSize: 12, color: 'var(--accent2)', fontStyle: 'italic', marginTop: 2 }}>
          ✦ {motivation.length > 80 ? motivation.slice(0, 80) + '...' : motivation}
        </div>
      )}
    </div>
  );
}
