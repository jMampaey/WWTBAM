import { useGameState } from './hooks/useGameState';
import SetupScreen  from './screens/SetupScreen';
import GameScreen   from './screens/GameScreen';
import ResultScreen from './screens/ResultScreen';

export default function App() {
  const state = useGameState();

  if (state.screen === 'setup')  return <SetupScreen  {...state} />;
  if (state.screen === 'result') return <ResultScreen {...state} />;
  return <GameScreen {...state} />;
}