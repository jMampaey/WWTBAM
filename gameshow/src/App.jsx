import { useGameState } from './hooks/useGameState';
import SetupScreen  from './screens/SetupScreen';
import GameScreen   from './screens/GameScreen';
import ResultScreen from './screens/ResultScreen';
import BonusScreen  from './screens/BonusScreen';
import FinalScreen  from './screens/FinalScreen';

export default function App() {
  const state = useGameState();

  if (state.screen === 'setup')  return <SetupScreen  {...state} />;
  if (state.screen === 'result') return <ResultScreen {...state} />;
  if (state.screen === 'bonus')  return <BonusScreen  {...state} />;
  if (state.screen === 'final')  return <FinalScreen  {...state} />;
  return <GameScreen {...state} />;
}