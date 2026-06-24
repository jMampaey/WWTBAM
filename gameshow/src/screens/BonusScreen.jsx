import { useEffect, useRef, useState } from 'react';
import OptionBtn from '../components/OptionBtn';

const PAGE = {
  height: '100vh',
  background: 'radial-gradient(ellipse at center,#0d1b3e 0%,#050514 70%)',
  color: '#e2e8f0', fontFamily: "'Segoe UI',system-ui,sans-serif",
  display: 'flex', flexDirection: 'column', alignItems: 'center',
  padding: '32px 24px 72px 24px',
  boxSizing: 'border-box', gap: 32, overflow: 'hidden',
};

const isYouTube = url => /youtu\.?be/.test(url);

export default function BonusScreen({ bonusQ, scoreLog, score, playerName, setScore, setScreen, setBonusAttempted }) {
  const maxPossible = scoreLog.reduce((a, l) => a + l.max, 0);
  const q = bonusQ;
  const optLetters = ['A','B','C','D'].filter(l => q.options[l]);

  const [phase, setPhase]                = useState('revealing');
  const [revealedCount, setRevealedCount] = useState(0);
  const [selected, setSelected]          = useState(null);
  const [timeLeft, setTimeLeft]          = useState(q.timer);
  const [timerOn, setTimerOn]            = useState(false);
  const [bonusWon, setBonusWon]          = useState(null);
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
        if (q.options[k]) {
          if (selected === k && phase === 'selected') {
            setSelected(null); setPhase('playing');
          } else {
            setSelected(k); setPhase('selected');
          }
        }
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

  function doReveal() {
    const won = selected === q.correct;
    setBonusWon(won);
    setPhase('revealed');
    setTimerOn(false);
    if (won) setScore(maxPossible);
  }

  return (
    <div style={PAGE}>

      {/* ── Header ── */}
      <div style={{ width: '100%', maxWidth: '75vw', display: 'grid', gridTemplateColumns: '180px 1fr 180px', alignItems: 'center', gap: 20 }}>
        <div>
          <div style={{ color: '#334155', fontSize: 13, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Speler</div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', lineHeight: 1.3 }}>{playerName}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{
            fontSize: 'clamp(1.1rem,2.2vw,1.7rem)', fontWeight: 900, margin: 0, whiteSpace: 'nowrap',
            background: 'linear-gradient(135deg,#60a5fa,#a78bfa,#f472b6)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Who wants to be a milLEOnaire?</h2>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#334155', fontSize: 13, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Vraag</div>
          <div style={{ fontWeight: 700, fontSize: '1.6rem' }}>Bonus</div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div style={{ width: '100%', maxWidth: '75vw', flex: 1, display: 'flex', flexDirection: 'column' }}>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32, flex: 1 }}>

        {/* Row 1: spacer | question card | score pot */}
        <div style={{ display: 'flex', gap: '2vw', alignItems: 'stretch', flex: 1 }}>

          {/* Left spacer (matches lifelines width) */}
          <div style={{ width: 180, flexShrink: 0 }} />

          {/* Question card */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{
              width: '100%', background: 'linear-gradient(135deg,#0d1b3e,#101f4a)',
              border: '2px solid #1e3a8a', borderRadius: 18, padding: '26px 30px',
              boxShadow: '0 0 40px #1e3a8a30, inset 0 1px 0 #2563eb18',
              height: '100%', boxSizing: 'border-box',
              display: 'flex', flexDirection: 'column',
            }}>
              {(q.image || q.video) && (
                <div style={{ height: '55vh', marginBottom: 16 }}>
                  {q.image && (
                    <img src={q.image} alt="" style={{
                      width: '100%', height: '100%', objectFit: 'contain',
                      background: '#000', borderRadius: 10, display: 'block',
                    }} />
                  )}
                  {q.video && (
                    isYouTube(q.video)
                      ? <iframe src={q.video} title="question-video" style={{
                          width: '100%', height: '100%', border: 'none',
                          borderRadius: 10, display: 'block',
                        }} allowFullScreen />
                      : <video src={q.video} style={{
                          width: '100%', height: '100%', borderRadius: 10,
                          display: 'block', background: '#000',
                        }} />
                  )}
                </div>
              )}
              <p style={{ fontSize: 'clamp(1.3rem,2.5vw,1.7rem)', fontWeight: 600, lineHeight: 1.55, margin: 0, color: '#f1f5f9', textAlign: 'center' }}>
                <RichText text={q.question} />
              </p>
            </div>
          </div>

          {/* Score pot */}
          <div style={{
            width: 180, flexShrink: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10,
            marginRight: -16,
          }}>
            <div style={{ color: '#334155', fontSize: 13, textTransform: 'uppercase', letterSpacing: '1.5px', width: 100, textAlign: 'center' }}>Score</div>
            <ScorePotWithNumber score={score} maxScore={maxPossible} />
          </div>

        </div>

        {/* Row 2: left spacer | answers + controls | right spacer */}
        <div style={{ overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 40 }}>
          <div style={{ width: 180, flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 32 }}>

            {/* Answer grid */}
            <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {optLetters.map((letter, i) => (
                <OptionBtn
                  key={letter} letter={letter} text={q.options[letter]}
                  phase={phase} selected={selected} correct={q.correct}
                  eliminated={[]} onClick={l => {
                    if (phase === 'playing' || phase === 'timeout' || phase === 'selected') {
                      if (selected === l && phase === 'selected') {
                        setSelected(null); setPhase('playing');
                      } else {
                        setSelected(l); setPhase('selected');
                      }
                    }
                  }}
                  hidden={i >= revealedCount}
                />
              ))}
            </div>

            {/* Controls bar */}
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, minHeight: 56 }}>
              <span style={{ color: '#1e3a8a', fontSize: 15 }}>
                {phase === 'revealing' && revealedCount < optLetters.length && 'Space — reveal next option'}
                {phase === 'revealing' && revealedCount >= optLetters.length && 'Space — start timer'}
                {phase === 'playing'   && 'Press A B C D to select'}
                {(phase === 'selected' || phase === 'timeout') && 'Press Enter to reveal'}
                {phase === 'revealed'  && 'Press Enter to continue'}
              </span>
              <div style={{ flex: 1 }} />
              {(phase === 'selected' || phase === 'timeout') && (
                <ActionBtn onClick={doReveal} gradient="linear-gradient(135deg,#1d4ed8,#7c3aed)" glow="#2563eb55">
                  {phase === 'timeout' ? "⏱ Time's Up — Reveal" : '🎯 Antwoord tonen'}
                </ActionBtn>
              )}
              {phase === 'revealed' && (
                <ActionBtn
                  onClick={() => { setBonusAttempted(true); setScreen('result'); }}
                  gradient="linear-gradient(135deg,#059669,#2563eb)" glow="#05996855"
                >
                  Verder →
                </ActionBtn>
              )}
            </div>

          </div>
          <div style={{ width: 180, flexShrink: 0 }} />
        </div>
        </div>

        </div>
      </div>

      {/* ── Timer bar ── */}
      <TimerBar timeLeft={timeLeft} total={q.timer} timerOn={timerOn} />

    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

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

function ScorePotWithNumber({ score, maxScore }) {
  const [displayScore, setDisplayScore] = useState(score);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, flex: 1 }}>
      <ScorePot score={score} maxScore={maxScore} onDisplay={setDisplayScore} />
      <div style={{ fontWeight: 900, fontSize: '1.4rem', color: '#f59e0b', lineHeight: 1, textAlign: 'center', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
        {displayScore.toLocaleString()}
      </div>
    </div>
  );
}

function ScorePot({ score, maxScore, onDisplay }) {
  const [displayScore, setDisplayScore] = useState(score);
  const rafRef  = useRef(null);
  const fromRef = useRef(score);

  useEffect(() => {
    const from = fromRef.current;
    const to   = score;
    if (from === to) return;
    const DURATION = 1000;
    const start = performance.now();
    const animate = now => {
      const t = Math.min(1, (now - start) / DURATION);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = Math.round(from + (to - from) * eased);
      setDisplayScore(val);
      if (onDisplay) onDisplay(val);
      if (t < 1) rafRef.current = requestAnimationFrame(animate);
      else fromRef.current = to;
    };
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [score]);

  const pct = maxScore > 0 ? Math.min(1, displayScore / maxScore) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
      <span style={{ fontSize: '1.6rem' }}>💰</span>
      <div style={{
        position: 'relative', width: 64, flex: 1, minHeight: 80,
        background: '#080e1a',
        border: '2px solid #1e3a8a',
        borderRadius: '10px 10px 32px 32px',
        overflow: 'hidden',
        boxShadow: 'inset 0 2px 10px #00000088, 0 0 12px #1e3a8a44',
      }}>
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: `${pct * 100}%`,
          background: 'linear-gradient(to top, #78350f, #b45309, #f59e0b, #fde68a)',
          boxShadow: '0 0 18px #f59e0b88',
        }} />
        <div style={{
          position: 'absolute', top: 0, left: '22%', width: '14%', bottom: 0,
          background: 'linear-gradient(to bottom, transparent 10%, rgba(255,255,255,0.07) 50%, transparent 90%)',
          pointerEvents: 'none',
        }} />
        {[0.25, 0.5, 0.75].map(t => (
          <div key={t} style={{
            position: 'absolute', left: 4, right: 4,
            bottom: `${t * 100}%`,
            height: 1,
            background: 'rgba(255,255,255,0.08)',
          }} />
        ))}
      </div>
    </div>
  );
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
  const stateRef = useRef({ pct: timeLeft / total, lastTs: null, resetting: false });

  useEffect(() => {
    stateRef.current.resetting = true;
    stateRef.current.lastTs    = null;
  }, []);

  useEffect(() => {
    if (timerOn) {
      stateRef.current.resetting = false;
      stateRef.current.lastTs    = null;
    }
  }, [timerOn]);

  useEffect(() => {
    const FILL_SPEED = 1 / 0.35;
    const animate = now => {
      const dt = stateRef.current.lastTs ? (now - stateRef.current.lastTs) / 1000 : 0;
      stateRef.current.lastTs = now;
      if (stateRef.current.resetting) {
        stateRef.current.pct = Math.min(1, stateRef.current.pct + dt * FILL_SPEED);
        if (stateRef.current.pct >= 1) stateRef.current.resetting = false;
      } else if (timerOn) {
        stateRef.current.pct = Math.max(0, stateRef.current.pct - dt / total);
      }
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
