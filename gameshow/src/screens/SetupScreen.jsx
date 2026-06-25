import { useEffect, useRef } from 'react';

const PAGE = {
  minHeight: '100vh', position: 'relative', overflow: 'hidden',
  background: 'radial-gradient(ellipse at center,#0d1b3e 0%,#050514 70%)',
  color: '#e2e8f0', fontFamily: "'Montserrat',system-ui,sans-serif",
  display: 'flex', flexDirection: 'column', alignItems: 'center',
  justifyContent: 'center', padding: 24, boxSizing: 'border-box', gap: 16,
};

const COLORS = ['#60a5fa', '#a78bfa', '#f472b6', '#f59e0b', '#34d399', '#fde68a'];

export default function SetupScreen({ questions, startGame }) {
  const hasQuestions = questions.length > 0;
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const onKey = e => { if (e.code === 'Space' && hasQuestions) startGame(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [hasQuestions, startGame]);

  // Confetti canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    // Create particles
    const particles = Array.from({ length: 80 }, () => spawnParticle(canvas));

    function spawnParticle(canvas, fromTop = false) {
      return {
        x: Math.random() * canvas.width,
        y: fromTop ? -10 : Math.random() * canvas.height,
        size: Math.random() * 8 + 4,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        speedY: Math.random() * 1.5 + 0.5,
        speedX: (Math.random() - 0.5) * 1.2,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.08,
        opacity: Math.random() * 0.6 + 0.4,
        shape: Math.random() < 0.5 ? 'rect' : 'circle',
      };
    }

    function drawParticle(p) {
      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
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
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotationSpeed;
        if (p.y > canvas.height + 20) {
          particles[i] = spawnParticle(canvas, true);
        }
        drawParticle(p);
      });
      rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // Inject pulse animation for the title glow
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes titlePulse {
        0%, 100% { filter: drop-shadow(0 0 18px #60a5fa55) drop-shadow(0 0 40px #a78bfa33); }
        50%       { filter: drop-shadow(0 0 32px #60a5fa99) drop-shadow(0 0 70px #a78bfa66); }
      }
      @keyframes subtleBob {
        0%, 100% { transform: translateY(0); }
        50%       { transform: translateY(-6px); }
      }
      @keyframes btnGlow {
        0%, 100% { box-shadow: 0 0 40px #2563eb55, 0 0 80px #7c3aed22; }
        50%       { box-shadow: 0 0 60px #2563eb99, 0 0 120px #7c3aed55; }
      }
      @keyframes shimmer {
        0%   { left: -80%; }
        100% { left: 130%; }
      }
      .start-btn {
        position: relative; overflow: hidden;
      }
      .start-btn::after {
        content: '';
        position: absolute; top: 0; left: -80%;
        width: 60%; height: 100%;
        background: linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.28) 50%, transparent 100%);
        transform: skewX(-20deg);
        pointer-events: none;
      }
      .start-btn:hover {
        transform: scale(1.08) !important;
        background: linear-gradient(135deg,#3b82f6,#9333ea) !important;
        box-shadow: 0 0 80px #3b82f6aa, 0 0 140px #9333ea66, 0 8px 32px #00000055 !important;
        animation: none !important;
      }
      .start-btn:hover::after {
        animation: shimmer 0.65s ease forwards;
      }
      .start-btn:active {
        transform: scale(0.97) !important;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div style={PAGE}>

      {/* Confetti canvas */}
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>

        <h1 style={{
          fontSize: 'clamp(3rem,7vw,5rem)', fontWeight: 900, margin: 0,
          background: 'linear-gradient(135deg,#60a5fa,#a78bfa,#f472b6)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: -1,
          textAlign: 'center',
          animation: 'titlePulse 3s ease-in-out infinite, subtleBob 4s ease-in-out infinite',
        }}>
          Who wants to be a milLEOnaire?
        </h1>

        <p style={{
          color: '#64748b', margin: 0,
          fontSize: 'clamp(1rem,1.5vw,1.4rem)',
          letterSpacing: '0.2em', textTransform: 'uppercase',
        }}>
          1 speler · tegen de klok
        </p>

        {hasQuestions ? (
          <button onClick={startGame} className="start-btn" style={{
            marginTop: 40, padding: '20px 64px', borderRadius: 16, border: 'none',
            background: 'linear-gradient(135deg,#2563eb,#7c3aed)',
            color: '#fff', fontSize: 'clamp(2rem,3.5vw,3rem)', fontWeight: 900,
            cursor: 'pointer', letterSpacing: '0.06em',
            animation: 'btnGlow 2.5s ease-in-out infinite',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
            fontFamily: "'Montserrat',system-ui,sans-serif",
          }}>
            ▶ Start
          </button>
        ) : (
          <p style={{ color: '#475569', fontSize: 'clamp(1rem,1.5vw,1.4rem)', margin: '24px 0 0' }}>
            ⚠ No questions found in src/questions/
          </p>
        )}

      </div>

    </div>
  );
}
