import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const PRESET_QUOTES = [
  '🎓 I want to ace my exams and make my family proud',
  '💻 I am building something that will change my life',
  '🚀 Every focused hour brings me closer to my dream',
  '💪 I am stronger than my distractions',
  '📚 Hard work today means freedom tomorrow',
  '🔥 I do not stop when I am tired. I stop when I am done.',
];

export default function Motivation() {
  const { user, updateMotivation } = useAuth();
  const [motivation, setMotivation] = useState(user?.motivation || '');
  const [sensitivity, setSensitivity] = useState(3);
  const [sound, setSound] = useState('beep');
  const [alertMessage, setAlertMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const pickPreset = (quote) => {
    setMotivation(quote.replace(/^[^\w]+/, '').trim());
  };

  const playPreview = (type) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (type === 'beep') {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.connect(g); g.connect(ctx.destination);
        osc.frequency.value = 880;
        g.gain.setValueAtTime(0.3, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start(); osc.stop(ctx.currentTime + 0.4);
      } else if (type === 'bell') {
        [440, 554, 659].forEach((f, i) => {
          const o = ctx.createOscillator(), gn = ctx.createGain();
          o.connect(gn); gn.connect(ctx.destination);
          o.frequency.value = f;
          gn.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.12);
          gn.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.5);
          o.start(ctx.currentTime + i * 0.12); o.stop(ctx.currentTime + i * 0.12 + 0.5);
        });
      } else {
        window.speechSynthesis.speak(new SpeechSynthesisUtterance('Voice alert preview'));
      }
    } catch {}
  };

  const handleStart = async () => {
    if (!motivation.trim()) {
      setError('Please enter your motivation to continue');
      return;
    }
    setLoading(true);
    try {
      await axios.put('/api/motivation', { motivation: motivation.trim() });
      updateMotivation(motivation.trim());
      navigate('/session', {
        state: {
          motivation: motivation.trim(),
          sensitivity,
          sound,
          alertMessage: alertMessage.trim(),
        },
      });
    } catch (err) {
      setError('Could not save motivation. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ justifyContent: 'flex-start', paddingTop: 40, maxWidth: 480, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28, animation: 'fadeUp 0.4s ease', width: '100%' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
          Step 01 — Before we begin
        </p>
        <h1 style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.25, marginBottom: 8 }}>
          What's driving you today,{' '}
          <span style={{ color: 'var(--accent)' }}>{user?.name?.split(' ')[0] || user?.username}?</span>
        </h1>
        <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>
          Your answer appears on screen when you lose focus — a personal reminder from yourself.
        </p>
      </div>

      {/* Motivation input */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16,
        padding: 20, marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 12,
        animation: 'fadeUp 0.4s ease 0.1s both', width: '100%',
      }}>
        <div className="field">
          <label>Your motivation</label>
          <textarea
            value={motivation}
            onChange={(e) => { setMotivation(e.target.value); setError(''); }}
            placeholder="e.g. I want to get a 9 CGPA to make my parents proud..."
          />
        </div>
        <p style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>or pick one ↓</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {PRESET_QUOTES.map((q) => (
            <button
              key={q}
              onClick={() => pickPreset(q)}
              style={{
                padding: '10px 14px',
                background: motivation.includes(q.replace(/^[^\w]+/, '').trim()) ? 'var(--accent-dim)' : 'var(--surface2)',
                border: `1px solid ${motivation.includes(q.replace(/^[^\w]+/, '').trim()) ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 10, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
                color: 'var(--text)', textAlign: 'left',
              }}
            >{q}</button>
          ))}
        </div>
      </div>

      {/* Custom Alert Message */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16,
        padding: 20, marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 10,
        animation: 'fadeUp 0.4s ease 0.15s both', width: '100%',
      }}>
        <p style={{ fontWeight: 700, fontSize: 14 }}>Custom Alert Message</p>
        <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
          This message will show on screen every time you get distracted. Leave empty to use default messages.
        </p>
        <div className="field">
          <label>Alert Message</label>
          <input
            type="text"
            value={alertMessage}
            onChange={(e) => setAlertMessage(e.target.value)}
            placeholder="e.g. Stop it Dhanush! Get back to work! 💪"
          />
        </div>
      </div>

      {/* Session settings */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16,
        padding: 20, marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 16,
        animation: 'fadeUp 0.4s ease 0.2s both', width: '100%',
      }}>
        <p style={{ fontWeight: 700, fontSize: 14 }}>Session Settings</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 14 }}>Alert sensitivity</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              type="range" min="1" max="5" value={sensitivity}
              onChange={(e) => setSensitivity(Number(e.target.value))}
              style={{ width: 120, accentColor: 'var(--accent)' }}
            />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--accent)', minWidth: 16 }}>
              {sensitivity}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 14 }}>Alert sound</span>
          <div style={{ display: 'flex', gap: 6 }}>
            {['beep', 'bell', 'voice'].map((s) => (
              <button
                key={s}
                onClick={() => { setSound(s); playPreview(s); }}
                style={{
                  padding: '6px 12px',
                  background: sound === s ? 'var(--accent-dim)' : 'var(--surface2)',
                  border: `1px solid ${sound === s ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 8, fontSize: 12, cursor: 'pointer', color: sound === s ? 'var(--accent)' : 'var(--muted)',
                  fontFamily: 'var(--font-mono)', transition: 'all 0.2s',
                }}
              >{s}</button>
            ))}
          </div>
        </div>
      </div>

      {error && <div className="error-msg" style={{ marginBottom: 12, width: '100%' }}>{error}</div>}

      <button
        className="btn btn-primary"
        onClick={handleStart}
        disabled={loading}
        style={{ animation: 'fadeUp 0.4s ease 0.3s both', width: '100%' }}
      >
        {loading ? 'Saving...' : '📷 Start Focus Session →'}
      </button>

      <button
        className="btn btn-secondary"
        onClick={() => navigate('/history')}
        style={{ marginTop: 10, width: '100%' }}
      >
        View Session History
      </button>
    </div>
  );
}