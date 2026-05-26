import { useState, useEffect, useRef } from 'react';
import { parseMarkdown } from '../utils/parseMarkdown';

// Vite reads this glob at build time.
// Any .md file you add to src/questions/ is picked up automatically.
const RAW_FILES = import.meta.glob('../questions/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

function loadQuestionsFromGlob() {
  const parsed = Object.entries(RAW_FILES).map(([path, text]) => {
    const filename = path.split('/').pop();
    return parseMarkdown(filename, text);
  });

  const valid = parsed.filter(
    p => p.question && p.correct && Object.keys(p.options).length >= 2
  );

  valid.sort((a, b) => a.id.localeCompare(b.id));
  return valid;
}

export function useGameState() {
  const [screen, setScreen] = useState('setup');
  const [questions, setQuestions] = useState([]);
  const [playerName, setPlayerName] = useState('Lucas a.k.a. Future miLEOnaire');
  const [qIdx, setQIdx] = useState(0);
  const [phase, setPhase] = useState('revealing');
  const [revealedCount, setRevealedCount] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [scoreLog, setScoreLog] = useState([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerOn, setTimerOn] = useState(false);
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [eliminated, setEliminated] = useState([]);
  const [lifelines, setLifelines] = useState({ fifty: true, phone: true });
  const [usedLifeline, setUsedLifeline] = useState(false);
  const timerRef = useRef(null);

  const q = questions[qIdx] ?? null;

  // Load questions once on mount
  useEffect(() => {
    setQuestions(loadQuestionsFromGlob());
  }, []);

  // ── Timer ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    clearInterval(timerRef.current);

    if (timerOn && !phoneOpen) {
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
  }, [timerOn, phoneOpen]);

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    if (screen !== 'game') return;

    const handler = e => {
      const k = e.key.toUpperCase();

      // Space during reveal phase — show next option, or start timer when all shown
      if (e.key === ' ' && phase === 'revealing') {
        e.preventDefault();
        const optLetters = ['A', 'B', 'C', 'D'].filter(l => q?.options[l]);
        if (revealedCount < optLetters.length) {
          setRevealedCount(c => c + 1);
        } else {
          setPhase('playing');
          setTimerOn(true);
        }
        return;
      }

      // A/B/C/D — select answer (also allowed after time runs out)
      if (['A', 'B', 'C', 'D'].includes(k) && (phase === 'playing' || phase === 'timeout' || phase === 'selected')) {
        if (q?.options[k] && !eliminated.includes(k)) {
          setSelected(k);
          setPhase('selected');
        }
      }

      // Enter / Space — advance
      if ((k === 'ENTER' || e.key === ' ') && e.target.tagName !== 'BUTTON') {
        e.preventDefault();
        if (phase === 'selected' || phase === 'timeout') _reveal();
        else if (phase === 'revealed') _next();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [screen, phase, q, eliminated, selected, usedLifeline, qIdx, questions, revealedCount]);

  // ── Private helpers ────────────────────────────────────────────────────────
  function _reveal() {
    if (phase !== 'selected' && phase !== 'timeout') return;
    const isRight = selected === q.correct;
    const pts = isRight
      ? (usedLifeline ? Math.floor(q.points / 2) : q.points)
      : 0;

    setPhase('revealed');
    setTimerOn(false);
    if (isRight) setScore(s => s + pts);
    setScoreLog(l => [...l, {
      question: q.question,
      correct: isRight,
      earned: pts,
      max: q.points,
      diff: q.difficulty,
    }]);
  }

  function _next() {
    const ni = qIdx + 1;
    if (ni >= questions.length) { setScreen('result'); return; }

    setQIdx(ni);
    setTimeLeft(questions[ni].timer);
    setPhase('revealing'); setRevealedCount(0);
    setSelected(null);
    setEliminated([]);
    setPhoneOpen(false);
    setUsedLifeline(false);
    setTimerOn(false);
  }

  // ── Public actions ─────────────────────────────────────────────────────────
  function startGame() {
    setQIdx(0); setScore(0); setScoreLog([]);
    setPhase('revealing'); setRevealedCount(0);
    setSelected(null); setEliminated([]);
    setPhoneOpen(false); setLifelines({ fifty: true, phone: true });
    setUsedLifeline(false);
    setTimeLeft(questions[0]?.timer ?? 30);
    setTimerOn(false);
    setScreen('game');
  }

  function selectOpt(letter) {
    if ((phase !== 'playing' && phase !== 'timeout' && phase !== 'selected') || !q?.options[letter] || eliminated.includes(letter)) return;
    setSelected(letter);
    setPhase('selected');
  }

  function do50() {
    if (!lifelines.fifty || phase !== 'playing' || !q) return;
    const wrong = Object.keys(q.options).filter(k => k !== q.correct);
    const elim = wrong.sort(() => 0.5 - Math.random()).slice(0, 2);
    setEliminated(elim);
    setLifelines(l => ({ ...l, fifty: false }));
    setUsedLifeline(true);
  }

  function doPhone() {
    if (!lifelines.phone || phase !== 'playing') return;
    setPhoneOpen(true);
    setLifelines(l => ({ ...l, phone: false }));
    setUsedLifeline(true);
  }

  return {
    screen, questions, playerName, qIdx, phase, selected,
    score, scoreLog, timeLeft, timerOn, phoneOpen, eliminated, lifelines, usedLifeline,
    revealedCount,
    q,
    setPlayerName, setPhoneOpen, setScreen, setTimerOn,
    startGame, selectOpt,
    reveal: _reveal,
    next: _next,
    do50, doPhone,
  };
}