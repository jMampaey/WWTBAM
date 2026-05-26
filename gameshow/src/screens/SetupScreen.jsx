import { DIFF_COLORS, DIFF_LABELS, MD_EXAMPLE } from '../constants';

const PAGE = {
  minHeight: '100vh',
  background: 'radial-gradient(ellipse at center,#0d1b3e 0%,#050514 70%)',
  color: '#e2e8f0', fontFamily: "'Segoe UI',system-ui,sans-serif",
  display: 'flex', flexDirection: 'column', alignItems: 'center',
  justifyContent: 'center', padding: 24, boxSizing: 'border-box',
};

export default function SetupScreen({ questions, playerName, setPlayerName, startGame }) {
  const hasQuestions = questions.length > 0;

  return (
    <div style={PAGE}>
      <div style={{ width: '100%', maxWidth: 680 }}>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{
            fontSize: 'clamp(2rem,5vw,3.2rem)', fontWeight: 900, margin: '0 0 8px',
            background: 'linear-gradient(135deg,#60a5fa,#a78bfa,#f472b6)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: -1,
          }}>Who wants to be a miLEOnaire</h1>
          <p style={{ color: '#475569', margin: 0, fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            One Player · vs The Clock
          </p>
        </div>

        {/* Player name */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 8 }}>
            Player Name
          </label>
          <input
            value={playerName}
            onChange={e => setPlayerName(e.target.value)}
            placeholder="Enter name…"
            style={{
              width: '100%', boxSizing: 'border-box', background: '#0d1b3e',
              border: '2px solid #1e3a8a', borderRadius: 10, color: '#e2e8f0',
              fontSize: 18, padding: '12px 18px', outline: 'none', textAlign: 'center',
            }}
          />
        </div>

        {/* Loaded question list */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 10 }}>
            {hasQuestions
              ? `✅ ${questions.length} Question${questions.length !== 1 ? 's' : ''} loaded from src/questions/`
              : '⚠ No questions found — add .md files to src/questions/'}
          </div>

          {hasQuestions && (
            <div style={{ maxHeight: 260, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {questions.map((q, i) => (
                <div key={i} style={{
                  background: '#0d1b3e', border: '1px solid #1e3a8a', borderRadius: 8,
                  padding: '10px 14px', display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', gap: 12,
                }}>
                  <span style={{ color: '#94a3b8', fontSize: 13, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {i + 1}. {q.question}
                  </span>
                  <div style={{ flexShrink: 0, display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span style={{ background: DIFF_COLORS[q.difficulty], color: '#000', padding: '2px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 800 }}>
                      {DIFF_LABELS[q.difficulty]}
                    </span>
                    <span style={{ color: '#f59e0b', fontSize: 12, fontWeight: 700 }}>{q.points}pt</span>
                    <span style={{ color: '#475569', fontSize: 11 }}>⏱{q.timer}s</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Start button */}
        <button onClick={startGame} disabled={!hasQuestions} style={{
          width: '100%', padding: 16, borderRadius: 12, border: 'none', marginBottom: 24,
          background: hasQuestions ? 'linear-gradient(135deg,#2563eb,#7c3aed)' : '#1e293b',
          color: hasQuestions ? '#fff' : '#475569',
          fontSize: '1.1rem', fontWeight: 800,
          cursor: hasQuestions ? 'pointer' : 'not-allowed',
          letterSpacing: '0.06em',
          boxShadow: hasQuestions ? '0 0 24px #2563eb44' : 'none',
          transition: 'all 0.2s',
        }}>
          {hasQuestions ? '▶  Start Game' : 'No questions found in src/questions/'}
        </button>

        {/* Format reference */}
        <details style={{ borderRadius: 10, overflow: 'hidden' }}>
          <summary style={{ color: '#475569', cursor: 'pointer', fontSize: 13, padding: '6px 0', userSelect: 'none' }}>
            📋 Question file format (src/questions/my-question.md)
          </summary>
          <pre style={{
            background: '#0d1b3e', border: '1px solid #1e3a8a', borderRadius: '0 0 10px 10px',
            padding: 16, margin: '8px 0 0', fontSize: 12, color: '#94a3b8',
            overflowX: 'auto', lineHeight: 1.8, fontFamily: 'monospace',
          }}>
            {MD_EXAMPLE}
          </pre>
          <p style={{ color: '#475569', fontSize: 11, marginTop: 6 }}>
            difficulty 1–5 → 100 / 250 / 500 / 1000 / 2000 pts · timer defaults to 30s
          </p>
        </details>

      </div>
    </div>
  );
}