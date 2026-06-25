import { useEffect, useRef, useState } from 'react';

const PAGE = {
  minHeight: '100vh',
  background: 'radial-gradient(ellipse at center,#0d1b3e 0%,#050514 70%)',
  color: '#e2e8f0', fontFamily: "'Montserrat',system-ui,sans-serif",
  display: 'flex', flexDirection: 'column', alignItems: 'center',
  padding: '4vh 2vw 5vh', boxSizing: 'border-box', gap: '6vh',
  position: 'relative', overflow: 'hidden',
};

function drawHeart(ctx, x, y, size, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.25);
  ctx.bezierCurveTo(x, y, x - size * 0.5, y, x - size * 0.5, y + size * 0.25);
  ctx.bezierCurveTo(x - size * 0.5, y + size * 0.55, x, y + size * 0.8, x, y + size);
  ctx.bezierCurveTo(x, y + size * 0.8, x + size * 0.5, y + size * 0.55, x + size * 0.5, y + size * 0.25);
  ctx.bezierCurveTo(x + size * 0.5, y, x, y, x, y + size * 0.25);
  ctx.fill();
}

export default function FinalScreen() {
  const [grown, setGrown] = useState(false);
  const [glowSize, setGlowSize] = useState(10);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const glowRef = useRef({ val: 0, dir: 1 });

  useEffect(() => {
    const t = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(t);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const COLORS = ['#f472b6', '#fb7185', '#f59e0b', '#fde68a', '#e879f9', '#f9a8d4'];
    const hearts = Array.from({ length: 30 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 18 + 8,
      speed: Math.random() * 1.2 + 0.4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      t: Math.random() * 100,
      opacity: Math.random() * 0.5 + 0.4,
    }));

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      hearts.forEach(h => {
        h.t += 0.02;
        h.y += h.speed;
        h.x += Math.sin(h.t) * 0.7;
        if (h.y > canvas.height + 30) {
          h.y = -30;
          h.x = Math.random() * canvas.width;
        }
        ctx.globalAlpha = h.opacity;
        drawHeart(ctx, h.x, h.y, h.size, h.color);
        ctx.globalAlpha = 1;
      });

      const g = glowRef.current;
      g.val += 0.01 * g.dir;
      if (g.val > 1) g.dir = -1;
      if (g.val < 0) g.dir = 1;
      setGlowSize(10 + Math.round(g.val * 12));

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div style={PAGE}>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }} />

      <p style={{
        fontSize: 56, fontWeight: 900,
        color: '#f59e0b', margin: 0, textAlign: 'center',
        textShadow: `0 0 ${glowSize}px #f59e0b, 0 0 ${glowSize * 2}px #f59e0b88`,
        position: 'relative', zIndex: 1,
      }}>
        Een prachtige bruid!
      </p>

      <img
        src="/media/images/SriLanka.JPEG"
        alt=""
        style={{
          maxWidth: '80vw', maxHeight: '75vh',
          objectFit: 'contain', background: '#000',
          borderRadius: 18,
          boxShadow: '0 0 60px #1e3a8a55',
          transform: grown ? 'scale(1)' : 'scale(0)',
          transition: 'transform 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
          position: 'relative', zIndex: 1,
        }}
      />
    </div>
  );
}
