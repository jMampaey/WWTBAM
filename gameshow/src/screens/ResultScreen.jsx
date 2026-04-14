const PAGE = {
  minHeight: '100vh',
  background: 'radial-gradient(ellipse at center,#0d1b3e 0%,#050514 70%)',
  color: '#e2e8f0', fontFamily: "'Segoe UI',system-ui,sans-serif",
  display: 'flex', flexDirection: 'column', alignItems: 'center',
  justifyContent: 'center', padding: 24, boxSizing: 'border-box',
};

export default function ResultScreen({ playerName, score, scoreLog, setScreen, setTimerOn }) {
  const correctCount  = scoreLog.filter(l => l.correct).length;
  const maxPossible   = scoreLog.reduce((a, l) => a + l.max, 0);
  const pct           = maxPossible ? Math.round(score / maxPossible * 100) : 0;
  const trophy        = correctCount === scoreLog.length ? '🏆' : correctCount > scoreLog.length / 2 ? '🥈' : '🎮';

  function goBack() {
    setTimerOn(false);
    setScreen('setup');
  }

  return (
    <div style={PAGE}>
      <div style={{ width: '100%', maxWidth: 700, textAlign: 'center' }}>

        <div style={{ fontSize: '4.5rem', marginBottom: 12 }}>{trophy}</div>

        <div style={{ color: '#64748b', fontSize: 12, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 4 }}>
          Final Score
        </div>
        <div style={{ fontSize: '4rem', fontWeight: 900, color: '#f59e0b', lineHeight: 1, marginBottom: 8 }}>
          {score.toLocaleString()}
        </div>
        <div style={{ color: '#64748b', marginBottom: 32 }}>
          {playerName} · {correctCount}/{scoreLog.length} correct · {pct}% of max ({maxPossible.toLocaleString()} pts)
        </div>

        {/* Per-question breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32, textAlign: 'left' }}>
          {scoreLog.map((l, i) => (
            <div key={i} style={{
              background: '#0d1b3e', borderRadius: 10, padding: '12px 16px',
              border: `1px solid ${l.correct ? '#16a34a44' : '#dc262644'}`,
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{l.correct ? '✅' : '❌'}</span>
              <span style={{
                flex: 1, color: '#94a3b8', fontSize: 13,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {l.question}
              </span>
              <span style={{ flexShrink: 0, fontWeight: 700, fontSize: 14, color: l.correct ? '#4ade80' : '#f87171' }}>
                {l.correct ? `+${l.earned.toLocaleString()}` : '0'} / {l.max}
              </span>
            </div>
          ))}
        </div>

        <button onClick={goBack} style={{
          background: 'linear-gradient(135deg,#2563eb,#7c3aed)', color: '#fff',
          border: 'none', borderRadius: 12, padding: '14px 40px',
          fontSize: '1.05rem', fontWeight: 800, cursor: 'pointer',
        }}>
          ↩ Back to Setup
        </button>

      </div>
    </div>
  );
}