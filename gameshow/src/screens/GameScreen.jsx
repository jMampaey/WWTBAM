import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import OptionBtn from '../components/OptionBtn';
import FitText from '../components/FitText';
import { ScorePotWithNumber } from '../components/ScorePot';


const PAGE = {
  height: '100vh',
  background: 'radial-gradient(ellipse at center,#0d1b3e 0%,#050514 70%)',
  color: '#e2e8f0', fontFamily: "'Montserrat',system-ui,sans-serif",
  display: 'flex', flexDirection: 'column', alignItems: 'center',
  padding: '12px 24px calc(52px + 1vh) 24px',
  boxSizing: 'border-box', gap: 12, overflow: 'hidden',
};

const isYouTube = url => /youtu\.?be/.test(url);

export default function GameScreen({
  q, qIdx, questions, playerName, score,
  phase, selected, timeLeft, timerOn, eliminated, lifelines, usedLifeline,
  revealedCount, videoStarted, slidePhase,
  phoneOpen, setPhoneOpen, familyOpen, setFamilyOpen,
  selectOpt, reveal, next, goBack, do50, doPhone, doFamily, setVideoStarted,
}) {
  if (!q) return null;
  const optLetters = ['A','B','C','D'].filter(l => q.options[l]);
  const isLast     = qIdx + 1 >= questions.length;
  const ptsAvail   = usedLifeline ? Math.floor(q.points / 2) : q.points;
  const maxScore   = questions.reduce((sum, qq) => sum + qq.points, 0);
  const videoRef        = useRef(null);
  const answerVideoRef  = useRef(null);
  const mediaContainerRef = useRef(null);
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
  const [overlayOpacity,      setOverlayOpacity]      = useState(0);
  const [mediaSwapped,        setMediaSwapped]        = useState(false);
  const [answerVideoStarted,  setAnswerVideoStarted]  = useState(false);

  useEffect(() => {
    if (videoStarted && videoRef.current) videoRef.current.play();
  }, [videoStarted]);

  useEffect(() => {
    if (answerVideoStarted && answerVideoRef.current) answerVideoRef.current.play();
  }, [answerVideoStarted]);

  useEffect(() => {
    setAnswerVideoStarted(false);
  }, [phase]);

  useEffect(() => {
    document.body.style.cursor = 'none';
    return () => { document.body.style.cursor = ''; };
  }, []);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      :fullscreen video { width: 100% !important; height: 100% !important; max-height: none !important; object-fit: contain !important; }
      :-webkit-full-screen video { width: 100% !important; height: 100% !important; max-height: none !important; object-fit: contain !important; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    const handler = e => {
      if (e.key === ' ' && document.fullscreenElement) {
        e.preventDefault();
        e.stopImmediatePropagation();
        document.exitFullscreen?.();
        return;
      }
      if (e.key === ' ' && phase === 'revealed' && q?.answerVideo && !answerVideoStarted) {
        e.preventDefault();
        e.stopImmediatePropagation();
        setAnswerVideoStarted(true);
        return;
      }
      if (e.key === 'f' || e.key === 'F') {
        if (document.fullscreenElement) {
          document.exitFullscreen?.();
        } else if (mediaContainerRef.current) {
          mediaContainerRef.current.requestFullscreen?.();
          const vid = answerVideoRef.current ?? videoRef.current;
          if (vid) vid.play?.();
          if (answerVideoRef.current) setAnswerVideoStarted(true);
          else setVideoStarted(true);
        }
      }
    };
    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, [phase, q, answerVideoStarted]);

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
      <div style={{ width: '100%', maxWidth: '92vw', display: 'grid', gridTemplateColumns: '300px 1fr 140px', alignItems: 'center', gap: 20 }}>
        <div>
          <div style={{ color: '#334155', fontSize: 20, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Speler</div>
          <div style={{ fontWeight: 700, fontSize: '1.9rem', lineHeight: 1.3 }}>{playerName}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{
            fontSize: 'clamp(1.8rem,3.2vw,2.8rem)', fontWeight: 900, margin: 0, whiteSpace: 'nowrap',
            background: 'linear-gradient(135deg,#60a5fa,#a78bfa,#f472b6)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Who wants to be a milLEOnaire?</h2>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#334155', fontSize: 20, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Vraag</div>
          <div style={{ fontWeight: 700, fontSize: '2.4rem' }}>{qIdx + 1} / {questions.length}</div>
        </div>
      </div>

      {/* ── Middle ── */}
      <div style={{ width: '100%', maxWidth: '92vw', flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Center column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1vh', flex: 1, minHeight: 0 }}>

          {/* Row 1: Lifelines + Question card + Score */}
          <div style={{ display: 'flex', gap: '4vw', alignItems: 'stretch', flex: 1, minHeight: 0 }}>

            {/* Left: Lifelines */}
            <div style={{
              width: 300, flexShrink: 0, alignSelf: 'center',
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10,
            }}>
              <div style={{ color: '#334155', fontSize: 20, textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                Hulplijnen
              </div>
              <LifelineBtn label="50 : 50" active={lifelines.fifty} disabled={phase !== 'playing' && phase !== 'timeout'} onClick={do50}
                title="Remove 2 wrong answers — halves score for this question" />
              <LifelineBtn label="👫 Friend" active={lifelines.phone} disabled={phase !== 'playing' && phase !== 'timeout'} onClick={doPhone}
                title="Pause timer, consult a friend — halves score for this question" />
              <LifelineBtn label="👨‍👩‍👧 Family" active={lifelines.family} disabled={phase !== 'playing' && phase !== 'timeout'} onClick={doFamily}
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
                display: 'flex', flexDirection: 'column',
              }}>

                {/* Media container — crossfades question → answer via black overlay */}
                {(q.image || q.video || q.answerImage || q.answerVideo) && (() => {
                  const hasAnswerMedia = q.answerImage || q.answerVideo;
                  const showAnswer = mediaSwapped && hasAnswerMedia;
                  const img = showAnswer ? q.answerImage : q.image;
                  const vid = showAnswer ? q.answerVideo : q.video;
                  return (
                    <div ref={mediaContainerRef} style={{ position: 'relative', marginBottom: 16, height: '55vh' }}>
                      {img && (
                        <img key={showAnswer ? 'answer' : 'question'} src={img} alt="" style={{
                          width: '100%', height: '100%', objectFit: 'contain',
                          background: '#000', borderRadius: 10, display: 'block',
                        }} />
                      )}
                      {vid && (
                        isYouTube(vid)
                          ? <iframe
                              key={showAnswer ? 'answer' : 'question'}
                              src={showAnswer ? vid + (vid.includes('?') ? '&' : '?') + 'autoplay=1' : vid}
                              title="video" allow="autoplay" style={{
                                width: '100%', height: '100%', border: 'none',
                                borderRadius: 10, display: 'block',
                              }} allowFullScreen />
                          : <video
                              key={showAnswer ? 'answer' : 'question'}
                              ref={showAnswer ? answerVideoRef : videoRef}
                              src={vid} autoPlay={showAnswer && answerVideoStarted} style={{
                                width: '100%', height: '100%', borderRadius: 10,
                                display: 'block', background: '#000',
                              }} />
                      )}
                      {(img || (vid && !isYouTube(vid))) && (
                        <button onClick={() => mediaContainerRef.current?.requestFullscreen?.()} style={{
                          position: 'absolute', bottom: 10, right: 10,
                          background: 'rgba(0,0,0,0.6)', border: '1px solid #334155',
                          borderRadius: 8, padding: '6px 10px', cursor: 'pointer',
                          color: '#94a3b8', fontSize: 16,
                        }}>⛶</button>
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

                <FitText maxSize={56} minSize={16} style={{ textAlign: 'center', fontWeight: 600, lineHeight: 1.4, color: '#f1f5f9', fontSize: 56 }}>
                  <RichText text={q.question} />
                </FitText>
              </div>
            </div>
            </div>

            {/* Score (static, no slide) */}
            <div style={{
              width: 140, flexShrink: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10,
            }}>
              <div style={{ color: '#334155', fontSize: 20, textTransform: 'uppercase', letterSpacing: '1.5px', width: 140, textAlign: 'center' }}>Score</div>
              <ScorePotWithNumber score={score} maxScore={maxScore} />
            </div>

          </div>

          {/* Row 2: Left spacer + Answers + Right spacer */}
          <div style={{ overflow: 'hidden', height: '20vh', flexShrink: 0, width: '100%' }}>
          <div style={{
            display: 'flex', gap: '4vw', height: '100%',
            transform: `translateX(${slideX})`,
            transition: slideTx,
          }}>
          <div style={{ width: 300, flexShrink: 0, position: 'relative' }}>
            {qIdx > 0 && (
              <button onClick={goBack} style={{
                position: 'absolute', bottom: ['selected','timeout','revealed'].includes(phase) ? 16 : 0, left: 0,
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                color: '#334155', fontSize: 18, fontFamily: "'Montserrat',system-ui,sans-serif",
                letterSpacing: '0.05em',
              }}>
                ← Terug
              </button>
            )}
          </div>{/* left spacer: matches lifelines width */}
          <div style={{ flex: 1, height: '100%' }}>

            {/* Answer grid */}
            <div style={{ width: '100%', height: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 12 }}>
              {optLetters.map((letter, i) => (
                <OptionBtn
                  key={letter} letter={letter} text={q.options[letter]}
                  phase={phase} selected={selected} correct={q.correct}
                  eliminated={eliminated} onClick={selectOpt}
                  hidden={i >= revealedCount}
                />
              ))}
            </div>

          </div>
          <div style={{ width: 140, flexShrink: 0 }} />{/* spacer: matches score width */}

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
        fontWeight: 900, fontSize: 28, letterSpacing: '0.05em',
        color: '#fff', fontFamily: "'Montserrat',system-ui,sans-serif",
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
        borderRadius: 10, padding: '28px 28px', width: '100%',
        fontWeight: 800, fontSize: 40,
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


function ActionBtn({ children, onClick, gradient, glow }) {
  return (
    <button onClick={onClick} style={{
      background: gradient, color: '#fff', border: 'none', borderRadius: 12,
      padding: '16px 36px', fontSize: '1.6rem', fontWeight: 900,
      cursor: 'pointer', letterSpacing: '0.04em', boxShadow: `0 0 20px ${glow}`,
    }}>
      {children}
    </button>
  );
}
