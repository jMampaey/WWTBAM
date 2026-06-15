import { useEffect, useState } from 'react';

const PAGE = {
  minHeight: '100vh',
  background: 'radial-gradient(ellipse at center,#0d1b3e 0%,#050514 70%)',
  color: '#e2e8f0', fontFamily: "'Segoe UI',system-ui,sans-serif",
  display: 'flex', flexDirection: 'column', alignItems: 'center',
  padding: '40px 24px 48px', boxSizing: 'border-box', gap: 36,
};

export default function FinalScreen() {
  const [grown, setGrown] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <div style={PAGE}>

      {/* ── Title ── */}
      <h1 style={{
        fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 900, margin: 0,
        background: 'linear-gradient(135deg,#60a5fa,#a78bfa,#f472b6)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        textAlign: 'center',
      }}>
        Who wants to be a milLEOnaire?
      </h1>

      {/* ── Answer text ── */}
      <p style={{
        fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 900,
        color: '#f59e0b', margin: 0, textAlign: 'center',
        textShadow: '0 0 40px #f59e0b66',
      }}>
        Een prachtige bruid!
      </p>

      {/* ── Picture ── */}
      <img
        src="/media/images/final.jpg"
        alt=""
        style={{
          maxWidth: '100%', maxHeight: '60vh',
          objectFit: 'contain', background: '#000',
          borderRadius: 18,
          boxShadow: '0 0 60px #1e3a8a55',
          transform: grown ? 'scale(1)' : 'scale(0)',
          transition: 'transform 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      />

    </div>
  );
}
