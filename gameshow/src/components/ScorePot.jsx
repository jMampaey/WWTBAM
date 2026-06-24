import { useEffect, useRef, useState } from 'react';

export function ScorePotWithNumber({ score, maxScore }) {
  const [displayScore, setDisplayScore] = useState(score);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, width: 140, flex: 1 }}>
      <ScorePot score={score} maxScore={maxScore} onDisplay={setDisplayScore} />
      <div style={{ fontWeight: 900, fontSize: '2.6rem', color: '#f59e0b', lineHeight: 1, textAlign: 'center', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', width: '100%' }}>
        {displayScore.toLocaleString()}
      </div>
    </div>
  );
}

export function ScorePot({ score, maxScore, onDisplay, noAnimation }) {
  const [displayScore, setDisplayScore] = useState(score);
  const rafRef  = useRef(null);
  const fromRef = useRef(score);

  useEffect(() => {
    if (noAnimation) { setDisplayScore(score); if (onDisplay) onDisplay(score); return; }
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

  const pct = maxScore > 0 ? Math.min(1, (noAnimation ? score : displayScore) / maxScore) : 0;
  const fillH = `${pct * 100}%`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
      <span style={{ fontSize: '1.6rem' }}>💰</span>
      <div style={{
        position: 'relative', width: 64, flex: 1, minHeight: 80,
        background: '#080e1a', border: '2px solid #1e3a8a',
        borderRadius: '10px 10px 32px 32px', overflow: 'hidden',
        boxShadow: 'inset 0 2px 10px #00000088, 0 0 12px #1e3a8a44',
      }}>
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: fillH,
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
            position: 'absolute', left: 4, right: 4, bottom: `${t * 100}%`,
            height: 1, background: 'rgba(255,255,255,0.08)',
          }} />
        ))}
      </div>
    </div>
  );
}
