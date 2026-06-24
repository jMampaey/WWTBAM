export default function OptionBtn({ letter, text, phase, selected, correct, eliminated, onClick, hidden }) {
  const isElim   = eliminated.includes(letter);
  const canClick = !isElim && !hidden && (phase === 'playing' || phase === 'timeout' || phase === 'selected');

  let bg, border = '#2563eb', textCol = '#e2e8f0', shadow = '';

  if (hidden) {
    bg = '#0a1628'; border = '#0f2040'; textCol = '#0a1628';
  } else if (isElim) {
    bg = '#08101e'; border = '#1e293b'; textCol = '#1e293b';
  } else if (phase === 'revealed') {
    if (letter === correct) {
      bg = 'linear-gradient(135deg,#14532d,#16a34a,#14532d)';
      border = '#4ade80'; shadow = '0 0 24px #16a34a88';
    } else if (letter === selected) {
      bg = 'linear-gradient(135deg,#7f1d1d,#dc2626,#7f1d1d)';
      border = '#f87171'; shadow = '0 0 18px #dc262666';
    } else {
      bg = '#0b1525'; border = '#1e3a8a'; textCol = '#334155';
    }
  } else if (letter === selected) {
    bg = 'linear-gradient(135deg,#78350f,#d97706,#78350f)';
    border = '#f59e0b'; shadow = '0 0 18px #d9770644';
  } else {
    bg = 'linear-gradient(135deg,#0d1b3e,#1a3570,#0d1b3e)';
  }

  return (
    <div
      role="button"
      onClick={() => canClick && onClick(letter)}
      style={{
        background: bg, border: `2px solid ${border}`, borderRadius: 14,
        padding: '22px 28px', display: 'flex', alignItems: 'center', gap: 20,
        height: '100%', boxSizing: 'border-box',
        opacity: (isElim || hidden) ? 0.15 : 1, cursor: canClick ? 'pointer' : 'default',
        transition: 'all 0.35s ease', userSelect: 'none',
        boxShadow: shadow || `0 0 10px ${border}28`,
      }}
    >
      <div style={{
        width: 56, height: 56, borderRadius: '50%',
        background: isElim ? '#1e293b' : border,
        color: '#000', fontWeight: 'bold', fontSize: 26,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, transition: 'background 0.35s',
      }}>
        {letter}
      </div>
      <span style={{ color: textCol, fontSize: 36, fontWeight: 500, lineHeight: 1.3, transition: 'color 0.35s' }}>
        {isElim ? '\u00a0' : text}
      </span>
    </div>
  );
}