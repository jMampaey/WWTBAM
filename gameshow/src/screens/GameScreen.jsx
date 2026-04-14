import TimerCircle from '../components/TimerCircle';
import OptionBtn   from '../components/OptionBtn';
import { DIFF_COLORS, DIFF_LABELS } from '../constants';

const PAGE = {
  minHeight: '100vh',
  background: 'radial-gradient(ellipse at center,#0d1b3e 0%,#050514 70%)',
  color: '#e2e8f0', fontFamily: "'Segoe UI',system-ui,sans-serif",
  display: 'flex', flexDirection: 'column', alignItems: 'center',
  justifyContent: 'space-between', padding: '20px 24px',
  boxSizing: 'border-box', gap: 14,
};

const isYouTube = url => /youtu\.?be/.test(url);

export default function GameScreen({
  q, qIdx, questions, playerName, score,
  phase, selected, timeLeft, eliminated, lifelines, usedLifeline,
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
      <div style={{ width: '100%', maxWidth: 960, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ color: '#334155', fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Player</div>
          <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{playerName}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#334155', fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Question</div>
          <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{qIdx + 1} / {questions.length}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#334155', fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Score</div>
          <div style={{ fontWeight: 900, fontSize: '1.4rem', color: '#f59e0b' }}>{score.toLocaleString()}</div>
        </div>
      </div>

      {/* ── Timer ── */}
      <TimerCircle time={timeLeft} total={q.timer} size={120} />

      {/* ── Question card ── */}
      <div style={{ width: '100%', maxWidth: 960 }}>
        <div style={{
          width: '100%', background: 'linear-gradient(135deg,#0d1b3e,#101f4a)',
          border: '2px solid #1e3a8a', borderRadius: 18, padding: '26px 30px',
          boxShadow: '0 0 40px #1e3a8a30, inset 0 1px 0 #2563eb18',
        }}>
          <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{
              background: DIFF_COLORS[q.difficulty], color: '#000',
              padding: '3px 12px', borderRadius: 9999, fontSize: 11, fontWeight: 900,
            }}>
              {DIFF_LABELS[q.difficulty]}
            </span>
            <span style={{ color: '#475569', fontSize: 13 }}>
              {ptsAvail.toLocaleString()} pts{usedLifeline ? ' (lifeline active)' : ''}
            </span>
          </div>

          {q.image && (
            <img src={q.image} alt="" style={{
              width: '100%', maxHeight: 200, objectFit: 'cover',
              borderRadius: 10, marginBottom: 16, display: 'block',
            }} />
          )}
          {q.video && (
            isYouTube(q.video)
              ? <iframe src={q.video} title="question-video" style={{
                  width: '100%', height: 200, border: 'none',
                  borderRadius: 10, marginBottom: 16, display: 'block',
                }} allowFullScreen />
              : <video src={q.video} controls style={{
                  width: '100%', maxHeight: 200, borderRadius: 10,
                  marginBottom: 16, display: 'block', background: '#000',
                }} />
          )}

          <p style={{ fontSize: 'clamp(1rem,2vw,1.3rem)', fontWeight: 600, lineHeight: 1.55, margin: 0, color: '#f1f5f9' }}>
            {q.question}
          </p>
        </div>
      </div>

      {/* ── Answer grid ── */}
      <div style={{ width: '100%', maxWidth: 960, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {optLetters.map(letter => (
          <OptionBtn
            key={letter} letter={letter} text={q.options[letter]}
            phase={phase} selected={selected} correct={q.correct}
            eliminated={eliminated} onClick={selectOpt}
          />
        ))}
      </div>

      {/* ── Controls bar ── */}
      <div style={{ width: '100%', maxWidth: 960, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>

        {/* Lifelines */}
        <LifelineBtn label="50 : 50" active={lifelines.fifty} disabled={phase !== 'playing'} onClick={do50}
          title="Remove 2 wrong answers — halves score for this question" />
        <LifelineBtn label="📞 Phone" active={lifelines.phone} disabled={phase !== 'playing'} onClick={doPhone}
          title="Pause timer, consult a friend — halves score for this question" />

        {usedLifeline && (phase === 'playing' || phase === 'selected') && (
          <span style={{ color: '#f59e0b', fontSize: 12, fontWeight: 700 }}>½ score active</span>
        )}

        <div style={{ flex: 1 }} />

        {/* Keyboard hint */}
        <span style={{ color: '#1e3a8a', fontSize: 12 }}>
          {phase === 'playing'                               && 'Press A B C D to select'}
          {(phase === 'selected' || phase === 'timeout')     && 'Press Enter to reveal'}
          {phase === 'revealed'                              && 'Press Enter for next'}
        </span>

        {/* Action button */}
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
  );
}

// Small internal sub-components to keep JSX readable ──────────────────────────

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
        borderRadius: 10, padding: '10px 18px',
        fontWeight: 800, fontSize: 14,
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
      background: gradient, color: '#fff', border: 'none', borderRadius: 10,
      padding: '12px 28px', fontSize: '1rem', fontWeight: 900,
      cursor: 'pointer', letterSpacing: '0.04em', boxShadow: `0 0 20px ${glow}`,
    }}>
      {children}
    </button>
  );
}