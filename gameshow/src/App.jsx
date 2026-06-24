import { useState, useEffect, useRef } from 'react';
import { useGameState } from './hooks/useGameState';
import SetupScreen  from './screens/SetupScreen';
import GameScreen   from './screens/GameScreen';
import ResultScreen from './screens/ResultScreen';
import BonusScreen  from './screens/BonusScreen';
import FinalScreen  from './screens/FinalScreen';

function renderScreen(screen, state) {
  if (screen === 'setup')  return <SetupScreen  {...state} />;
  if (screen === 'result') return <ResultScreen {...state} />;
  if (screen === 'bonus')  return <BonusScreen  {...state} />;
  if (screen === 'final')  return <FinalScreen  {...state} />;
  return <GameScreen {...state} />;
}

const FADE_MS = 600;

export default function App() {
  const state = useGameState();
  const [visibleScreen, setVisibleScreen] = useState(state.screen);
  const [overlayOpacity, setOverlayOpacity] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (state.screen === visibleScreen) return;

    // Fade to black
    setOverlayOpacity(1);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setVisibleScreen(state.screen);
      // Fade back in after screen has swapped
      requestAnimationFrame(() => requestAnimationFrame(() => setOverlayOpacity(0)));
    }, FADE_MS);
  }, [state.screen]);

  return (
    <>
      {renderScreen(visibleScreen, state)}
      <div style={{
        position: 'fixed', inset: 0, background: '#000',
        opacity: overlayOpacity,
        transition: `opacity ${FADE_MS}ms ease-in-out`,
        pointerEvents: overlayOpacity > 0 ? 'all' : 'none',
        zIndex: 9999,
      }} />
    </>
  );
}
