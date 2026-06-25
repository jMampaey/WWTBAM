import { useEffect, useRef, useState } from 'react';
import { ScorePot } from '../components/ScorePot';

const PAGE = {
  minHeight: '100vh',
  background: 'radial-gradient(ellipse at center,#0d1b3e 0%,#050514 70%)',
  color: '#e2e8f0', fontFamily: "'Montserrat',system-ui,sans-serif",
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
  const rafRef    = useRef(null);
  const canvasRef = useRef(null);
  const confettiRef = useRef(null);

  // Confetti burst when tagline appears
  useEffect(() => {
    if (!taglineVisible || !isMillionaire) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const COLORS = ['#60a5fa','#a78bfa','#f472b6','#f59e0b','#34d399','#fde68a','#fff'];
    const particles = Array.from({ length: 160 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * 0.5 - canvas.height * 0.1,
      vx: (Math.random() - 0.5) * 6,
      vy: Math.random() * -8 - 4,
      size: Math.random() * 10 + 4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.15,
      shape: Math.random() < 0.5 ? 'rect' : 'circle',
      opacity: 1,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      particles.forEach(p => {
        p.vy += 0.25; // gravity
        p.x  += p.vx;
        p.y  += p.vy;
        p.rotation += p.rotSpeed;
        p.opacity = Math.max(0, p.opacity - 0.008);
        if (p.opacity > 0) alive = true;
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle   = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });
      if (alive) confettiRef.current = requestAnimationFrame(animate);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    cancelAnimationFrame(confettiRef.current);
    confettiRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(confettiRef.current);
  }, [taglineVisible]);

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
    <div style={{ ...PAGE, position: 'relative', overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }} />

      {/* ── Title ── */}
      <div style={{ position: 'relative', width: '100%', height: 56 }}>
        {/* Intro text — fades out on animation start */}
        <h1 style={{
          position: 'absolute', inset: 0, margin: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 56, fontWeight: 900,
          color: '#e2e8f0', textAlign: 'center',
          opacity: animationStarted ? 0 : 1,
          filter: animationStarted ? 'blur(12px)' : 'blur(0px)',
          transition: 'opacity 2s ease-in-out, filter 2s ease-in-out',
          pointerEvents: 'none', whiteSpace: 'nowrap',
        }}>
          Laten we naar je score kijken...
        </h1>
        {/* Real title — fades in on animation start */}
        <h1 style={{
          position: 'absolute', inset: 0, margin: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 56, fontWeight: 900,
          background: 'linear-gradient(135deg,#60a5fa,#a78bfa,#f472b6)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          textAlign: 'center',
          opacity: animationStarted ? 1 : 0,
          filter: animationStarted ? 'blur(0px)' : 'blur(12px)',
          transition: 'opacity 2s ease-in-out, filter 2s ease-in-out',
          whiteSpace: 'nowrap',
        }}>
          {isMillionaire ? `${playerName} is now a milLEOnaire!` : 'Oei... Dat is niet voldoende'}
        </h1>
      </div>

      {/* ── Pot of gold ── */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: 240, height: '30vh' }}>
        <ScorePot score={displayScore} maxScore={maxPossible} noAnimation />
        <div style={{ fontWeight: 900, fontSize: 50, color: '#f59e0b', lineHeight: 1, width: '100%', textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
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
      <p style={{ color: '#1e3a8a', fontSize: 15, margin: 0, opacity: (animationStarted && !taglineVisible) ? 0 : 1, transition: 'opacity 0.3s ease' }}>
        {!animationStarted ? 'Space — reveal score' : 'Space — continue'}
      </p>


    </div>
  );
}

