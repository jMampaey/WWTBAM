import { useEffect, useRef, useState } from 'react';
import OptionBtn from '../components/OptionBtn';
import { DIFF_COLORS, DIFF_LABELS } from '../constants';

const PAGE = {
  minHeight: '100vh',
  background: 'radial-gradient(ellipse at center,#0d1b3e 0%,#050514 70%)',
  color: '#e2e8f0', fontFamily: "'Segoe UI',system-ui,sans-serif",
  display: 'flex', flexDirection: 'column', alignItems: 'center',
  padding: '20px 24px 72px 24px',
  boxSizing: 'border-box', gap: 14,
};

const isYouTube = url => /youtu\.?be/.test(url);

export default function GameScreen({
  q, qIdx, questions, playerName, score,
  phase, selected, timeLeft, timerOn, eliminated, lifelines, usedLifeline,
  revealedCount,
  phoneOpen, setPhoneOpen,
  selectOpt, reveal, next, do50, doPhone,
}) {
  if (!q) return null;
  const optLetters = ['A','B','C','D'].filter(l => q.options[l]);
  const isLast     = qIdx + 1 >= questions.length;
  const ptsAvail   = usedLifeline ? Math.floor(q.points / 2) : q.points;

  return (
    <div style={PAGE}>

      {/* ── Phone a Friend overlay ── */}
      {phoneOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999,
        }}>
          <div style={{
            background: '#0d1b3e', border: '2px solid #3b82f6', borderRadius: 24,
            padding: '48px 40px', textAlign: 'center', maxWidth: 400,
            boxShadow: '0 0 60px #3b82f655',
          }}>
            <div style={{ fontSize: '3.5rem', marginBottom: 14 }}>📞</div>
            <h3 style={{ fontSize: '1.6rem', margin: '0 0 10px', fontWeight: 900 }}>Phone a Friend</h3>
            <p style={{ color: '#64748b', margin: '0 0 8px' }}>Timer is paused.</p>
            <p style={{ color: '#94a3b8', fontSize: 14, margin: '0 0 20px', lineHeight: 1.6 }}>
              Consult your friend, then resume when ready.
            </p>
            <div style={{ background: '#1e293b', borderRadius: 10, padding: '10px 16px', marginBottom: 24 }}>
              <span style={{ color: '#f59e0b', fontSize: 13, fontWeight: 700 }}>
                ⚠ Score for this question is halved
              </span>
            </div>
            <button onClick={() => setPhoneOpen(false)} style={{
              background: 'linear-gradient(135deg,#2563eb,#7c3aed)', color: '#fff',
              border: 'none', borderRadius: 12, padding: '14px 36px',
              fontSize: '1rem', fontWeight: 800, cursor: 'pointer',
            }}>
              Resume ▶
            </button>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div style={{ width: '100%', maxWidth: 1280, display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 16 }}>
        <div>
          <div style={{ color: '#334155', fontSize: 13, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Player</div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', lineHeight: 1.3 }}>{playerName}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{
            fontSize: 'clamp(1.1rem,2.2vw,1.7rem)', fontWeight: 900, margin: 0, whiteSpace: 'nowrap',
            background: 'linear-gradient(135deg,#60a5fa,#a78bfa,#f472b6)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Who wants to be a miLEOnaire</h2>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#334155', fontSize: 13, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Question</div>
          <div style={{ fontWeight: 700, fontSize: '1.6rem' }}>{qIdx + 1} / {questions.length}</div>
        </div>
      </div>

      {/* ── Middle: 3-column layout ── */}
      <div style={{ width: '100%', maxWidth: 1280, display: 'flex', gap: 20, alignItems: 'center', flex: 1 }}>

        {/* Left: Lifelines */}
        <div style={{
          width: 180, flexShrink: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10,
          paddingTop: 6,
        }}>
          <div style={{ color: '#334155', fontSize: 13, textTransform: 'uppercase', letterSpacing: '1.5px' }}>
            Lifelines
          </div>
          <LifelineBtn label="50 : 50" active={lifelines.fifty} disabled={phase !== 'playing'} onClick={do50}
            title="Remove 2 wrong answers — halves score for this question" />
          <LifelineBtn label="📞 Phone" active={lifelines.phone} disabled={phase !== 'playing'} onClick={doPhone}
            title="Pause timer, consult a friend — halves score for this question" />
          {usedLifeline && (phase === 'playing' || phase === 'selected') && (
            <span style={{ color: '#f59e0b', fontSize: 13, fontWeight: 700 }}>½ score active</span>
          )}
        </div>

        {/* Center: Question card + Answer grid + Controls */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Question card */}
          <div style={{
            width: '100%', background: 'linear-gradient(135deg,#0d1b3e,#101f4a)',
            border: '2px solid #1e3a8a', borderRadius: 18, padding: '26px 30px',
            boxShadow: '0 0 40px #1e3a8a30, inset 0 1px 0 #2563eb18',
          }}>
            <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{
                background: DIFF_COLORS[q.difficulty], color: '#000',
                padding: '5px 16px', borderRadius: 9999, fontSize: 14, fontWeight: 900,
              }}>
                {DIFF_LABELS[q.difficulty]}
              </span>
              <span style={{ color: '#475569', fontSize: 16 }}>
                {ptsAvail.toLocaleString()} pts{usedLifeline ? ' (lifeline active)' : ''}
              </span>
            </div>

            {q.image && (
              <img src={q.image} alt="" style={{
                width: '100%', height: 400, objectFit: 'cover',
                borderRadius: 10, marginBottom: 16, display: 'block',
              }} />
            )}
            {q.video && (
              isYouTube(q.video)
                ? <iframe src={q.video} title="question-video" style={{
                    width: '100%', height: 400, border: 'none',
                    borderRadius: 10, marginBottom: 16, display: 'block',
                  }} allowFullScreen />
                : <video src={q.video} controls style={{
                    width: '100%', maxHeight: 400, borderRadius: 10,
                    marginBottom: 16, display: 'block', background: '#000',
                  }} />
            )}

            <p style={{ fontSize: 'clamp(1.3rem,2.5vw,1.7rem)', fontWeight: 600, lineHeight: 1.55, margin: 0, color: '#f1f5f9' }}>
              {q.question}
            </p>
          </div>

          {/* Answer grid */}
          <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {optLetters.map((letter, i) => (
              <OptionBtn
                key={letter} letter={letter} text={q.options[letter]}
                phase={phase} selected={selected} correct={q.correct}
                eliminated={eliminated} onClick={selectOpt}
                hidden={i >= revealedCount}
              />
            ))}
          </div>

          {/* Controls bar */}
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: '#1e3a8a', fontSize: 15 }}>
              {phase === 'revealing' && revealedCount < optLetters.length && 'Space — reveal next option'}
              {phase === 'revealing' && revealedCount >= optLetters.length && 'Space — start timer'}
              {phase === 'playing'                           && 'Press A B C D to select'}
              {(phase === 'selected' || phase === 'timeout') && 'Press Enter to reveal'}
              {phase === 'revealed'                          && 'Press Enter for next'}
            </span>
            <div style={{ flex: 1 }} />
            {(phase === 'selected' || phase === 'timeout') && (
              <ActionBtn onClick={reveal} gradient="linear-gradient(135deg,#1d4ed8,#7c3aed)" glow="#2563eb55">
                {phase === 'timeout' ? "⏱ Time's Up — Reveal" : '🎯 Reveal Answer'}
              </ActionBtn>
            )}
            {phase === 'revealed' && (
              <ActionBtn onClick={next} gradient="linear-gradient(135deg,#059669,#2563eb)" glow="#05996855">
                {isLast ? '🏁 Final Results' : 'Next →'}
              </ActionBtn>
            )}
          </div>

        </div>

        {/* Right: Score */}
        <div style={{
          width: 180, flexShrink: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4,
          paddingTop: 6,
        }}>
          <div style={{ color: '#334155', fontSize: 13, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Score</div>
          <div style={{ fontWeight: 900, fontSize: '2.4rem', color: '#f59e0b', lineHeight: 1 }}>{score.toLocaleString()}</div>
        </div>

      </div>

      {/* ── Timer bar ── */}
      <TimerBar timeLeft={timeLeft} total={q.timer} timerOn={timerOn} />

    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function lerpColor(a, b, t) {
  const parse = hex => [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)];
  const [ar,ag,ab] = parse(a);
  const [br,bg,bb] = parse(b);
  return [Math.round(ar+(br-ar)*t), Math.round(ag+(bg-ag)*t), Math.round(ab+(bb-ab)*t)];
}

function TimerBar({ timeLeft, total, timerOn }) {
  const [displayPct, setDisplayPct] = useState(timeLeft / total);
  const rafRef   = useRef(null);
  const stateRef = useRef({ pct: timeLeft / total, lastTs: null });

  // When timer starts/resumes, sync pct to current timeLeft
  useEffect(() => {
    if (timerOn) {
      stateRef.current.pct    = timeLeft / total;
      stateRef.current.lastTs = null;
    }
  }, [timerOn]);

  useEffect(() => {
    const animate = now => {
      const dt = stateRef.current.lastTs ? (now - stateRef.current.lastTs) / 1000 : 0;
      stateRef.current.lastTs = now;
      if (timerOn) {
        stateRef.current.pct = Math.max(0, stateRef.current.pct - dt / total);
      }
      setDisplayPct(stateRef.current.pct);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [total, timerOn]);

  const pct     = displayPct;
  const [r,g,b] = pct > 0.5
    ? lerpColor('#3b82f6', '#f59e0b', (1 - pct) / 0.5)
    : lerpColor('#f59e0b', '#ef4444', (0.5 - pct) / 0.5);
  const color = `rgb(${r},${g},${b})`;

  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 52, background: '#0a1220', zIndex: 50, display: 'flex', alignItems: 'center' }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0,
        width: `${pct * 100}%`,
        backgroundColor: color,
        boxShadow: `0 0 12px ${color}`,
      }} />
      <span style={{
        position: 'relative', zIndex: 1,
        width: '100%', textAlign: 'center',
        fontWeight: 900, fontSize: 22, letterSpacing: '0.05em',
        color: '#fff', fontFamily: "'Segoe UI',system-ui,sans-serif",
        textShadow: '0 1px 4px #000a',
      }}>
        {timeLeft}s
      </span>
    </div>
  );
}

function LifelineBtn({ label, active, disabled, onClick, title }) {
  return (
    <button
      onClick={onClick}
      disabled={!active || disabled}
      title={title}
      style={{
        background: active ? '#0d1b3e' : '#080e1a',
        border: `2px solid ${active ? '#3b82f6' : '#1e293b'}`,
        color: active ? '#60a5fa' : '#334155',
        borderRadius: 10, padding: '14px 22px',
        fontWeight: 800, fontSize: 17,
        cursor: (active && !disabled) ? 'pointer' : 'not-allowed',
        transition: 'all 0.2s',
      }}
    >
      {label}
    </button>
  );
}

function ActionBtn({ children, onClick, gradient, glow }) {
  return (
    <button onClick={onClick} style={{
      background: gradient, color: '#fff', border: 'none', borderRadius: 12,
      padding: '16px 36px', fontSize: '1.2rem', fontWeight: 900,
      cursor: 'pointer', letterSpacing: '0.04em', boxShadow: `0 0 20px ${glow}`,
    }}>
      {children}
    </button>
  );
}
