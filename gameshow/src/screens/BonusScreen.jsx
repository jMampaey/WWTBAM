import { useEffect, useRef, useState } from 'react';
import OptionBtn from '../components/OptionBtn';
import { DIFF_COLORS, DIFF_LABELS } from '../constants';

const PAGE = {
  minHeight: '100vh',
  background: 'radial-gradient(ellipse at center,#0d1b3e 0%,#050514 70%)',
  color: '#e2e8f0', fontFamily: "'Segoe UI',system-ui,sans-serif",
  display: 'flex', flexDirection: 'column', alignItems: 'center',
  justifyContent: 'space-between', padding: '20px 24px 72px 24px',
  boxSizing: 'border-box', gap: 14,
};

const isYouTube = url => /youtu\.?be/.test(url);

export default function BonusScreen({ bonusQ, scoreLog, setScore, setScreen, setBonusAttempted }) {
  const maxPossible = scoreLog.reduce((a, l) => a + l.max, 0);
  const q = bonusQ;
  const optLetters = ['A','B','C','D'].filter(l => q.options[l]);

  const [phase, setPhase]               = useState('revealing');
  const [revealedCount, setRevealedCount] = useState(0);
  const [selected, setSelected]         = useState(null);
  const [timeLeft, setTimeLeft]         = useState(q.timer);
  const [timerOn, setTimerOn]           = useState(false);
  const [bonusWon, setBonusWon]         = useState(null);
  const timerRef = useRef(null);

  // Timer
  useEffect(() => {
    clearInterval(timerRef.current);
    if (timerOn) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            setTimerOn(false);
            setPhase(p => p === 'playing' ? 'timeout' : p);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [timerOn]);

  // Keyboard
  useEffect(() => {
    const handler = e => {
      const k = e.key.toUpperCase();

      if (e.key === ' ' && phase === 'revealing') {
        e.preventDefault();
        if (revealedCount < optLetters.length) {
          setRevealedCount(c => c + 1);
        } else {
          setPhase('playing');
          setTimerOn(true);
        }
        return;
      }

      if (['A','B','C','D'].includes(k) && (phase === 'playing' || phase === 'timeout' || phase === 'selected')) {
        if (q.options[k]) { setSelected(k); setPhase('selected'); }
      }

      if ((k === 'ENTER' || e.key === ' ') && e.target.tagName !== 'BUTTON') {
        e.preventDefault();
        if (phase === 'selected' || phase === 'timeout') {
          const won = selected === q.correct;
          setBonusWon(won);
          setPhase('revealed');
          setTimerOn(false);
          if (won) setScore(maxPossible);
        } else if (phase === 'revealed') {
          setBonusAttempted(true);
          setScreen('result');
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase, selected, revealedCount, optLetters.length, maxPossible]);

  return (
    <div style={PAGE}>

      {/* ── Header ── */}
      <div style={{ width: '100%', maxWidth: 960, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <h2 style={{
          fontSize: 'clamp(1.1rem,2.2vw,1.7rem)', fontWeight: 900, margin: 0,
          background: 'linear-gradient(135deg,#60a5fa,#a78bfa,#f472b6)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>Who wants to be a miLEOnaire</h2>
      </div>

      {/* ── Bonus badge ── */}
      <div style={{ textAlign: 'center' }}>
        <span style={{
          background: 'linear-gradient(135deg,#b45309,#f59e0b)',
          color: '#000', fontWeight: 900, fontSize: '1rem',
          padding: '6px 24px', borderRadius: 9999, letterSpacing: '0.1em',
          textTransform: 'uppercase', boxShadow: '0 0 20px #f59e0b66',
        }}>
          ✨ Bonus Question
        </span>
        <div style={{ color: '#64748b', fontSize: 13, marginTop: 8 }}>
          Answer correctly to fill the pot o' gold!
        </div>
      </div>

      {/* ── Question card ── */}
      <div style={{ width: '100%', maxWidth: 960 }}>
        <div style={{
          width: '100%', background: 'linear-gradient(135deg,#0d1b3e,#101f4a)',
          border: '2px solid #b45309', borderRadius: 18, padding: '26px 30px',
          boxShadow: '0 0 40px #f59e0b22, inset 0 1px 0 #f59e0b18',
        }}>
          <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{
              background: DIFF_COLORS[q.difficulty], color: '#000',
              padding: '5px 16px', borderRadius: 9999, fontSize: 14, fontWeight: 900,
            }}>
              {DIFF_LABELS[q.difficulty]}
            </span>
            <span style={{ color: '#f59e0b', fontSize: 14, fontWeight: 700 }}>
              🏆 {maxPossible.toLocaleString()} pts — full pot!
            </span>
          </div>

          {(() => {
            const showAnswerMedia = phase === 'revealed' && (q.answerImage || q.answerVideo);
            const img = showAnswerMedia ? q.answerImage : q.image;
            const vid = showAnswerMedia ? q.answerVideo : q.video;
            return (<>
              {img && (
                <img src={img} alt="" style={{
                  width: '100%', height: 400, objectFit: 'contain',
                  background: '#000', borderRadius: 10, marginBottom: 16, display: 'block',
                }} />
              )}
              {vid && (
                isYouTube(vid)
                  ? <iframe src={vid} title="question-video" style={{
                      width: '100%', height: 400, border: 'none',
                      borderRadius: 10, marginBottom: 16, display: 'block',
                    }} allowFullScreen />
                  : <video src={vid} controls style={{
                      width: '100%', maxHeight: 400, borderRadius: 10,
                      marginBottom: 16, display: 'block', background: '#000',
                    }} />
              )}
            </>);
          })()}

          <p style={{ fontSize: 'clamp(1.3rem,2.5vw,1.7rem)', fontWeight: 600, lineHeight: 1.55, margin: 0, color: '#f1f5f9', textAlign: 'center' }}>
            <RichText text={q.question} />
          </p>
        </div>
      </div>

      {/* ── Answer grid ── */}
      <div style={{ width: '100%', maxWidth: 960, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {optLetters.map((letter, i) => (
          <OptionBtn
            key={letter} letter={letter} text={q.options[letter]}
            phase={phase} selected={selected} correct={q.correct}
            eliminated={[]} onClick={l => {
              if (phase === 'playing' || phase === 'timeout' || phase === 'selected') {
                setSelected(l); setPhase('selected');
              }
            }}
            hidden={i >= revealedCount}
          />
        ))}
      </div>

      {/* ── Controls bar ── */}
      <div style={{ width: '100%', maxWidth: 960, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ color: '#1e3a8a', fontSize: 15 }}>
          {phase === 'revealing' && revealedCount < optLetters.length && 'Space — reveal next option'}
          {phase === 'revealing' && revealedCount >= optLetters.length && 'Space — start timer'}
          {phase === 'playing'   && 'Press A B C D to select'}
          {(phase === 'selected' || phase === 'timeout') && 'Press Enter to reveal'}
          {phase === 'revealed'  && 'Press Enter to continue'}
        </span>
        <div style={{ flex: 1 }} />
        {phase === 'revealed' && bonusWon !== null && (
          <span style={{
            fontWeight: 900, fontSize: '1.1rem',
            color: bonusWon ? '#4ade80' : '#f87171',
          }}>
            {bonusWon ? '🏆 Bonus won! Full pot of gold!' : '😞 Bonus missed!'}
          </span>
        )}
      </div>

      {/* ── Timer bar ── */}
      <TimerBar timeLeft={timeLeft} total={q.timer} timerOn={timerOn} />

    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function RichText({ text }) {
  const tokens = [];
  const re = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;
  let last = 0, match;
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) tokens.push({ t: 'text', v: text.slice(last, match.index) });
    if (match[0].startsWith('**')) tokens.push({ t: 'bold', v: match[2] });
    else tokens.push({ t: 'italic', v: match[3] });
    last = match.index + match[0].length;
  }
  if (last < text.length) tokens.push({ t: 'text', v: text.slice(last) });
  return tokens.map((tok, i) => {
    if (tok.t === 'bold')   return <strong key={i} style={{ fontWeight: 900, color: '#f59e0b' }}>{tok.v}</strong>;
    if (tok.t === 'italic') return <em key={i}>{tok.v}</em>;
    return tok.v;
  });
}

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
      if (timerOn) stateRef.current.pct = Math.max(0, stateRef.current.pct - dt / total);
      setDisplayPct(stateRef.current.pct);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [total, timerOn]);

  const pct = displayPct;
  const [r,g,b] = pct > 0.5
    ? lerpColor('#3b82f6', '#f59e0b', (1 - pct) / 0.5)
    : lerpColor('#f59e0b', '#ef4444', (0.5 - pct) / 0.5);
  const color = `rgb(${r},${g},${b})`;

  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 52, background: '#0a1220', zIndex: 50, display: 'flex', alignItems: 'center' }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0,
        width: `${pct * 100}%`, backgroundColor: color,
        boxShadow: `0 0 12px ${color}`,
      }} />
      <span style={{
        position: 'relative', zIndex: 1, width: '100%', textAlign: 'center',
        fontWeight: 900, fontSize: 22, letterSpacing: '0.05em',
        color: '#fff', fontFamily: "'Segoe UI',system-ui,sans-serif",
        textShadow: '0 1px 4px #000a',
      }}>
        {timeLeft}s
      </span>
    </div>
  );
}
