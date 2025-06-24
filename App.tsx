
import React from 'react';
import { useSnakeGame } from './hooks/useSnakeGame';
import GameBoard from './components/GameBoard';
import ScoreDisplay from './components/ScoreDisplay';
import Controls from './components/Controls';
import StartScreen from './components/StartScreen';
import GameOverScreen from './components/GameOverScreen';
import { GameState, Direction } from './constants';

const App: React.FC = () => {
  const {
    snake,
    food,
    score,
    highScore,
    gameState,
    startGame,
    changeDirectionHandler,
  } = useSnakeGame();

  const renderGameContent = () => {
    switch (gameState) {
      case GameState.START_SCREEN:
        return <StartScreen onStartGame={startGame} highScore={highScore} />;
      case GameState.GAME_OVER:
        return <GameOverScreen score={score} highScore={highScore} onRestartGame={startGame} />;
      case GameState.PLAYING:
        return (
          <div className="flex flex-col items-center justify-center p-2 sm:p-4">
            <ScoreDisplay score={score} highScore={highScore} />
            <GameBoard snake={snake} food={food} />
            <Controls onDirectionChange={changeDirectionHandler} />
            <p className="mt-4 text-xs text-slate-400 hidden sm:block">Use Arrow Keys or WASD to control the snake.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-900 touch-manipulation">
      {renderGameContent()}
    </div>
  );
};

export default App;
