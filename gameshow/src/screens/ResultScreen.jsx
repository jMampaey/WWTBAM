import { useEffect, useRef, useState } from 'react';

const PAGE = {
  minHeight: '100vh',
  background: 'radial-gradient(ellipse at center,#0d1b3e 0%,#050514 70%)',
  color: '#e2e8f0', fontFamily: "'Segoe UI',system-ui,sans-serif",
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  padding: '40px 24px 48px', boxSizing: 'border-box', gap: 40,
};

export default function ResultScreen({ playerName, score, scoreLog, bonusQ, bonusAttempted, setScreen }) {
  const maxPossible  = scoreLog.reduce((a, l) => a + l.max, 0);
  const hasBonus     = bonusQ != null && score < maxPossible && !bonusAttempted;
  const isMillionaire = score >= maxPossible;

  const [animationStarted, setAnimationStarted] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);
  const [taglineVisible, setTaglineVisible] = useState(false);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!animationStarted) return;
    setTaglineVisible(false);
    const DURATION = 2000;
    const start = performance.now();
    const animate = now => {
      const t = Math.min(1, (now - start) / DURATION);
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      setDisplayScore(Math.round(eased * score));
      if (t < 1) rafRef.current = requestAnimationFrame(animate);
      else setTaglineVisible(true);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [animationStarted, score]);

  useEffect(() => {
    const onKey = e => {
      if (e.code !== 'Space') return;
      if (!animationStarted) {
        setAnimationStarted(true);
      } else if (taglineVisible) {
        setScreen(hasBonus ? 'bonus' : 'final');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [animationStarted, taglineVisible, setScreen, hasBonus]);

  return (
    <div style={PAGE}>

      {/* ── Title ── */}
      <h1 style={{
        fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 900, margin: 0,
        background: 'linear-gradient(135deg,#60a5fa,#a78bfa,#f472b6)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        textAlign: 'center',
      }}>
        {isMillionaire ? `${playerName} is now a milLEOnaire!` : 'Who wants to be a milLEOnaire?'}
      </h1>

      {/* ── Pot of gold ── */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: 240 }}>
        <ScorePot score={displayScore} maxScore={maxPossible} />
        <div style={{ fontWeight: 900, fontSize: '3.5rem', color: '#f59e0b', lineHeight: 1, width: '100%', textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
          {displayScore.toLocaleString()}
        </div>
      </div>

      {/* ── Tagline ── */}
      <p style={{
        fontSize: isMillionaire ? '2.2rem' : '1.5rem', fontWeight: 700, color: '#e2e8f0', margin: 0, textAlign: 'center',
        transform: taglineVisible ? 'scale(1)' : 'scale(0)',
        transition: taglineVisible ? 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
      }}>
        {!hasBonus && (isMillionaire
          ? 'En wat wint deze milLEOnaire?'
          : `${playerName}, what's in the pot o' gold..?`)}
      </p>

      {/* ── Hint ── */}
      <p style={{ color: '#1e3a8a', fontSize: 15, margin: 0 }}>
        {!animationStarted && 'Space — reveal score'}
        {animationStarted && taglineVisible && 'Space — continue'}
      </p>


    </div>
  );
}

// ── ScorePot ─────────────────────────────────────────────────────────────────

function ScorePot({ score, maxScore }) {
  const pct = maxScore > 0 ? Math.min(1, score / maxScore) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: '2rem' }}>🪙</span>

      {/* Pot body */}
      <div style={{
        position: 'relative', width: 100, height: 300,
        background: '#080e1a',
        border: '2px solid #1e3a8a',
        borderRadius: '14px 14px 48px 48px',
        overflow: 'hidden',
        boxShadow: 'inset 0 2px 10px #00000088, 0 0 20px #1e3a8a44',
      }}>
        {/* Gold fill */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: `${pct * 100}%`,
          background: 'linear-gradient(to top, #78350f, #b45309, #f59e0b, #fde68a)',
          boxShadow: '0 0 24px #f59e0b88',
        }} />
        {/* Gloss sheen */}
        <div style={{
          position: 'absolute', top: 0, left: '22%', width: '14%', bottom: 0,
          background: 'linear-gradient(to bottom, transparent 10%, rgba(255,255,255,0.07) 50%, transparent 90%)',
          pointerEvents: 'none',
        }} />
        {/* Tick marks */}
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
