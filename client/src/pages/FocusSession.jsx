import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CameraFeed from '../components/CameraFeed';
import AlertOverlay from '../components/AlertOverlay';
import StatsPanel from '../components/StatsPanel';
import useFaceDetection from '../hooks/useFaceDetection';
import { useAuth } from '../context/AuthContext';

function playSound(type, motivation) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (type === 'beep') {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.connect(g); g.connect(ctx.destination);
      osc.frequency.value = 880;
      g.gain.setValueAtTime(0.35, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      osc.start(); osc.stop(ctx.currentTime + 0.45);
    } else if (type === 'bell') {
      [440, 554, 659].forEach((f, i) => {
        const o = ctx.createOscillator(), gn = ctx.createGain();
        o.connect(gn); gn.connect(ctx.destination);
        o.frequency.value = f;
        gn.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.12);
        gn.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.6);
        o.start(ctx.currentTime + i * 0.12); o.stop(ctx.currentTime + i * 0.12 + 0.6);
      });
    } else if (type === 'voice') {
      const short = motivation?.slice(0, 60) || 'Stay focused!';
      const u = new SpeechSynthesisUtterance(`Hey! Stay focused! ${short}`);
      u.rate = 0.9; u.pitch = 1.1;
      window.speechSynthesis.speak(u);
    }
  } catch {}
}

export default function FocusSession() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const motivation = location.state?.motivation || user?.motivation || 'Stay focused!';
const sensitivity = location.state?.sensitivity || 3;
const sound = location.state?.sound || 'beep';
const alertMessage = location.state?.alertMessage || '';

  const videoRef = useRef(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [cameraError, setCameraError] = useState('');

  // Timers
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [focusSeconds, setFocusSeconds] = useState(0);
  const [streakSeconds, setStreakSeconds] = useState(0);
  const [alertCount, setAlertCount] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const alertsLog = useRef([]);

  // Face detection hook
const { status, distraction, modelsLoaded, alerts } = useFaceDetection(
    videoRef,
    sessionActive,
    sensitivity,
    alertMessage
  );

  const isDistracted = status === 'distracted';
  const prevDistractedRef = useRef(false);

  // Play sound when new distraction starts
  useEffect(() => {
    if (isDistracted && !prevDistractedRef.current) {
      setAlertCount((c) => c + 1);
      alertsLog.current.push({ type: distraction?.type, timestamp: sessionSeconds });
      playSound(sound, motivation);
    }
    prevDistractedRef.current = isDistracted;
  }, [isDistracted, distraction]);

  // Main session timer
  useEffect(() => {
    if (!sessionActive) return;
    const id = setInterval(() => {
      setSessionSeconds((s) => s + 1);
      if (!isDistracted) {
        setFocusSeconds((f) => f + 1);
        setStreakSeconds((s) => {
          const next = s + 1;
          setLongestStreak((ls) => Math.max(ls, next));
          return next;
        });
      } else {
        setStreakSeconds(0);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [sessionActive, isDistracted]);

  // Start session once camera is ready
  const handleStreamReady = () => setSessionActive(true);
  const handleCameraError = (msg) => {
    setCameraError(msg);
    // Still start session in fallback mode without real detection
    setSessionActive(true);
  };

  const fmtTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const endSession = () => {
    setSessionActive(false);
    const focusPct = sessionSeconds > 0 ? Math.round((focusSeconds / sessionSeconds) * 100) : 100;
    navigate('/summary', {
      state: {
        motivation,
        totalSeconds: sessionSeconds,
        focusSeconds,
        focusScore: focusPct,
        alertCount,
        alerts: alertsLog.current,
        longestStreak,
      },
    });
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh',
      background: 'var(--bg)', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 20px',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: 15 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: isDistracted ? 'var(--danger)' : 'var(--accent2)',
            animation: 'blink 1.5s ease-in-out infinite',
          }} />
          {isDistracted ? 'Distracted!' : !modelsLoaded ? 'Loading AI...' : 'Focused'}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>
          {fmtTime(sessionSeconds)}
        </div>
        <button className="btn btn-danger" style={{ width: 'auto', padding: '8px 16px', fontSize: 13 }} onClick={endSession}>
          End Session
        </button>
      </div>

      {/* Camera */}
      <div style={{
        position: 'relative', flex: 1,
        background: '#05050a',
        overflow: 'hidden',
      }}>
        {cameraError ? (
          <div style={{
            height: '100%', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 12,
            color: 'var(--muted)', fontSize: 14, textAlign: 'center', padding: 24,
          }}>
            <div style={{ fontSize: 48 }}>📷</div>
            <div style={{ fontWeight: 700, color: 'var(--text)' }}>Camera not available</div>
            <div style={{ fontSize: 13 }}>{cameraError}</div>
            <div style={{ fontSize: 12, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
              Running in timer-only mode
            </div>
          </div>
        ) : (
          <CameraFeed ref={videoRef} onStreamReady={handleStreamReady} onError={handleCameraError} />
        )}

        {/* Face frame */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -58%)',
          width: 260, height: 300,
          border: `2px solid ${isDistracted ? 'rgba(255,107,107,0.8)' : 'rgba(78,205,196,0.6)'}`,
          borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
          transition: 'border-color 0.3s',
          pointerEvents: 'none',
        }} />

        {/* Red tint when distracted */}
        {isDistracted && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(255, 107, 107, 0.12)',
            pointerEvents: 'none',
          }} />
        )}

        <AlertOverlay distraction={distraction} motivation={motivation} />
      </div>

      {/* Bottom panel */}
      <div style={{
        padding: '14px 16px',
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', gap: 12,
        flexShrink: 0,
      }}>
        {/* Motivation strip */}
        <div style={{
          background: 'var(--surface2)', borderRadius: 10, padding: '10px 14px',
          display: 'flex', alignItems: 'flex-start', gap: 10,
        }}>
          <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>🔥</span>
          <div>
            <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>
              Your motivation
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.4 }}>
              {motivation.length > 80 ? motivation.slice(0, 80) + '...' : motivation}
            </div>
          </div>
        </div>

        <StatsPanel
          sessionSeconds={sessionSeconds}
          focusSeconds={focusSeconds}
          alertCount={alertCount}
          streakSeconds={streakSeconds}
        />

        {/* Detection badges */}
        <div>
          <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
            Live Detection
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[
              { key: 'eyes_closed', label: '👁 Eyes Closed' },
              { key: 'face_away', label: '👤 Face Away' },
              { key: 'yawning', label: '😮 Yawning' },
            ].map(({ key, label }) => (
              <div key={key} style={{
                padding: '4px 10px',
                borderRadius: 20,
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                background: distraction?.type === key ? 'var(--danger-dim)' : 'transparent',
                border: `1px solid ${distraction?.type === key ? 'rgba(255,107,107,0.4)' : 'var(--border)'}`,
                color: distraction?.type === key ? 'var(--danger)' : 'var(--muted)',
                transition: 'all 0.3s',
              }}>
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
