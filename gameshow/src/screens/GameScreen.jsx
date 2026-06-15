import { useEffect, useRef, useState } from 'react';
import OptionBtn from '../components/OptionBtn';


const PAGE = {
  minHeight: '100vh',
  background: 'radial-gradient(ellipse at center,#0d1b3e 0%,#050514 70%)',
  color: '#e2e8f0', fontFamily: "'Segoe UI',system-ui,sans-serif",
  display: 'flex', flexDirection: 'column', alignItems: 'center',
  padding: '32px 24px 72px 24px',
  boxSizing: 'border-box', gap: 32, overflowX: 'hidden',
};

const isYouTube = url => /youtu\.?be/.test(url);

export default function GameScreen({
  q, qIdx, questions, playerName, score,
  phase, selected, timeLeft, timerOn, eliminated, lifelines, usedLifeline,
  revealedCount, videoStarted, slidePhase,
  phoneOpen, setPhoneOpen, familyOpen, setFamilyOpen,
  selectOpt, reveal, next, do50, doPhone, doFamily,
}) {
  if (!q) return null;
  const optLetters = ['A','B','C','D'].filter(l => q.options[l]);
  const isLast     = qIdx + 1 >= questions.length;
  const ptsAvail   = usedLifeline ? Math.floor(q.points / 2) : q.points;
  const maxScore   = questions.reduce((sum, qq) => sum + qq.points, 0);
  const videoRef        = useRef(null);
  const crossfadeTimer  = useRef(null);
  const [slideX,   setSlideX]   = useState('0%');
  const [slideTx,  setSlideTx]  = useState('none');

  useEffect(() => {
    if (slidePhase === 'exit') {
      setSlideTx('transform 0.35s ease-in');
      setSlideX('-100vw');
    } else if (slidePhase === 'enter') {
      setSlideTx('none');
      setSlideX('100vw');
      requestAnimationFrame(() => requestAnimationFrame(() => {
        setSlideTx('transform 0.35s ease-out');
        setSlideX('0%');
      }));
    } else {
      setSlideTx('none');
      setSlideX('0%');
    }
  }, [slidePhase]);
  const [overlayOpacity, setOverlayOpacity] = useState(0);
  const [mediaSwapped,   setMediaSwapped]   = useState(false);

  useEffect(() => {
    if (videoStarted && videoRef.current) videoRef.current.play();
  }, [videoStarted]);

  useEffect(() => {
    clearTimeout(crossfadeTimer.current);
    if (phase === 'revealed' && (q?.answerImage || q?.answerVideo)) {
      setMediaSwapped(false);
      setOverlayOpacity(0);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        setOverlayOpacity(1);
        crossfadeTimer.current = setTimeout(() => {
          setMediaSwapped(true);  // swap while overlay is still fully black
          requestAnimationFrame(() =>
            requestAnimationFrame(() => setOverlayOpacity(0))  // fade out only after new media is painted
          );
        }, 600);
      }));
    } else {
      setMediaSwapped(false);
      setOverlayOpacity(0);
    }
    return () => clearTimeout(crossfadeTimer.current);
  }, [phase]);

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
            <div style={{ fontSize: '3.5rem', marginBottom: 14 }}>👫</div>
            <h3 style={{ fontSize: '1.6rem', margin: '0 0 24px', fontWeight: 900 }}>Phone a friend</h3>
            <button onClick={() => setPhoneOpen(false)} style={{
              background: 'linear-gradient(135deg,#2563eb,#7c3aed)', color: '#fff',
              border: 'none', borderRadius: 12, padding: '14px 36px',
              fontSize: '1rem', fontWeight: 800, cursor: 'pointer',
            }}>
              Geef antwoord
            </button>
          </div>
        </div>
      )}

      {/* ── Phone a Family Member overlay ── */}
      {familyOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999,
        }}>
          <div style={{
            background: '#0d1b3e', border: '2px solid #3b82f6', borderRadius: 24,
            padding: '48px 40px', textAlign: 'center', maxWidth: 400,
            boxShadow: '0 0 60px #3b82f655',
          }}>
            <div style={{ fontSize: '3.5rem', marginBottom: 14 }}>👨‍👩‍👧</div>
            <h3 style={{ fontSize: '1.6rem', margin: '0 0 24px', fontWeight: 900 }}>Phone a family member</h3>
            <button onClick={() => setFamilyOpen(false)} style={{
              background: 'linear-gradient(135deg,#2563eb,#7c3aed)', color: '#fff',
              border: 'none', borderRadius: 12, padding: '14px 36px',
              fontSize: '1rem', fontWeight: 800, cursor: 'pointer',
            }}>
              Geef antwoord
            </button>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div style={{ width: '100%', maxWidth: 1600, display: 'grid', gridTemplateColumns: '180px 1fr 180px', alignItems: 'center', gap: 20 }}>
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
          <div style={{ fontWeight: 700, fontSize: '1.6rem' }}>{qIdx + 1} / {questions.length}</div>
        </div>
      </div>

      {/* ── Middle ── */}
      <div style={{ width: '100%', maxWidth: 1600 }}>

        {/* Center column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

          {/* Row 1: Lifelines + Question card + Score */}
          <div style={{ display: 'flex', gap: 20, alignItems: 'stretch' }}>

            {/* Left: Lifelines */}
            <div style={{
              width: 180, flexShrink: 0, alignSelf: 'center',
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10,
            }}>
              <div style={{ color: '#334155', fontSize: 13, textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                Hulplijnen
              </div>
              <LifelineBtn label="50 : 50" active={lifelines.fifty} disabled={phase !== 'playing'} onClick={do50}
                title="Remove 2 wrong answers — halves score for this question" />
              <LifelineBtn label="👫 Friend" active={lifelines.phone} disabled={phase !== 'playing'} onClick={doPhone}
                title="Pause timer, consult a friend — halves score for this question" />
              <LifelineBtn label="👨‍👩‍👧 Family" active={lifelines.family} disabled={phase !== 'playing'} onClick={doFamily}
                title="Pause timer, consult a family member — halves score for this question" />

            </div>

            {/* Sliding question card */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{
              width: '100%',
              transform: `translateX(${slideX})`,
              transition: slideTx,
            }}>
              <div style={{
                width: '100%', background: 'linear-gradient(135deg,#0d1b3e,#101f4a)',
                border: '2px solid #1e3a8a', borderRadius: 18, padding: '26px 30px',
                boxShadow: '0 0 40px #1e3a8a30, inset 0 1px 0 #2563eb18',
                height: '100%', boxSizing: 'border-box',
              }}>

                {/* Media container — crossfades question → answer via black overlay */}
                {(q.image || q.video || q.answerImage || q.answerVideo) && (() => {
                  const hasAnswerMedia = q.answerImage || q.answerVideo;
                  const showAnswer = mediaSwapped && hasAnswerMedia;
                  const img = showAnswer ? q.answerImage : q.image;
                  const vid = showAnswer ? q.answerVideo : q.video;
                  return (
                    <div style={{ position: 'relative', marginBottom: 16 }}>
                      {img && (
                        <img key={showAnswer ? 'answer' : 'question'} src={img} alt="" style={{
                          width: '100%', height: 680, objectFit: 'contain',
                          background: '#000', borderRadius: 10, display: 'block',
                        }} />
                      )}
                      {vid && (
                        isYouTube(vid)
                          ? <iframe
                              key={showAnswer ? 'answer' : 'question'}
                              src={showAnswer ? vid + (vid.includes('?') ? '&' : '?') + 'autoplay=1' : vid}
                              title="video" allow="autoplay" style={{
                                width: '100%', height: 400, border: 'none',
                                borderRadius: 10, display: 'block',
                              }} allowFullScreen />
                          : <video
                              key={showAnswer ? 'answer' : 'question'}
                              ref={showAnswer ? undefined : videoRef}
                              src={vid} autoPlay={showAnswer} style={{
                                width: '100%', maxHeight: 680, borderRadius: 10,
                                display: 'block', background: '#000',
                              }} />
                      )}
                      {hasAnswerMedia && (
                        <div style={{
                          position: 'absolute', inset: 0, borderRadius: 10,
                          background: '#000', pointerEvents: 'none',
                          opacity: overlayOpacity,
                          transition: 'opacity 0.5s ease',
                        }} />
                      )}
                    </div>
                  );
                })()}

                <p style={{ fontSize: 'clamp(1.3rem,2.5vw,1.7rem)', fontWeight: 600, lineHeight: 1.55, margin: 0, color: '#f1f5f9', textAlign: 'center' }}>
                  <RichText text={q.question} />
                </p>
              </div>
            </div>
            </div>

            {/* Score (static, no slide) */}
            <div style={{
              width: 180, flexShrink: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10,
              marginRight: -16,
            }}>
              <div style={{ color: '#334155', fontSize: 13, textTransform: 'uppercase', letterSpacing: '1.5px', width: 100, textAlign: 'center' }}>Score</div>
              <ScorePotWithNumber score={score} maxScore={maxScore} />
            </div>

          </div>

          {/* Row 2: Left spacer + Answers + Right spacer */}
          <div style={{ overflow: 'hidden' }}>
          <div style={{
            display: 'flex', gap: 20,
            transform: `translateX(${slideX})`,
            transition: slideTx,
          }}>
          <div style={{ width: 180, flexShrink: 0 }} />{/* left spacer: matches lifelines width */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 32 }}>

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
                {phase === 'prereveal' && !videoStarted                      && 'Space — play video'}
                {phase === 'prereveal' && videoStarted                       && 'Space — show answers'}
                {phase === 'revealing' && revealedCount < optLetters.length  && 'Space — reveal next option'}
                {phase === 'revealing' && revealedCount >= optLetters.length && 'Space — start timer'}
                {phase === 'playing'                           && 'Press A B C D to select'}
                {(phase === 'selected' || phase === 'timeout') && 'Press Enter to reveal'}
                {phase === 'revealed'                          && 'Press Enter for next'}
              </span>
              <div style={{ flex: 1 }} />
              {(phase === 'selected' || phase === 'timeout') && (
                <ActionBtn onClick={reveal} gradient="linear-gradient(135deg,#1d4ed8,#7c3aed)" glow="#2563eb55">
                  {phase === 'timeout' ? "⏱ Time's Up — Reveal" : '🎯 Antwoord tonen'}
                </ActionBtn>
              )}
              {phase === 'revealed' && (
                <ActionBtn onClick={next} gradient="linear-gradient(135deg,#059669,#2563eb)" glow="#05996855">
                  {isLast ? '🏁 Final Results' : 'Verder →'}
                </ActionBtn>
              )}
            </div>

          </div>
          <div style={{ width: 180, flexShrink: 0 }} />{/* spacer: matches score width */}

          </div>
          </div>

        </div>

      </div>

      {/* ── Timer bar ── */}
      <TimerBar timeLeft={timeLeft} total={q.timer} timerOn={timerOn && !phoneOpen && !familyOpen} qIdx={qIdx} />

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

function TimerBar({ timeLeft, total, timerOn, qIdx }) {
  const [displayPct, setDisplayPct] = useState(timeLeft / total);
  const rafRef   = useRef(null);
  const stateRef = useRef({ pct: timeLeft / total, lastTs: null, resetting: false });

  // Smooth fill-to-full when question changes
  useEffect(() => {
    stateRef.current.resetting = true;
    stateRef.current.lastTs    = null;
  }, [qIdx]);

  // When timer starts/resumes, prevent dt spike on the first frame
  useEffect(() => {
    if (timerOn) {
      stateRef.current.resetting = false;
      stateRef.current.lastTs    = null;
    }
  }, [timerOn]);

  useEffect(() => {
    const FILL_SPEED = 1 / 0.35; // fills from 0 to full in ~350ms
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
      <div style={{ fontWeight: 900, fontSize: '1.4rem', color: '#f59e0b', lineHeight: 1, width: 100, textAlign: 'center', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
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
  const fillH = `${pct * 100}%`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
      <span style={{ fontSize: '1.6rem' }}>💰</span>

      {/* Pot body */}
      <div style={{
        position: 'relative', width: 64, flex: 1, minHeight: 80,
        background: '#080e1a',
        border: '2px solid #1e3a8a',
        borderRadius: '10px 10px 32px 32px',
        overflow: 'hidden',
        boxShadow: 'inset 0 2px 10px #00000088, 0 0 12px #1e3a8a44',
      }}>
        {/* Gold fill — rises from bottom */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: fillH,
          background: 'linear-gradient(to top, #78350f, #b45309, #f59e0b, #fde68a)',
          boxShadow: '0 0 18px #f59e0b88',
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
