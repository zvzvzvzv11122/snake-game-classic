
import React from 'react';

interface GameOverScreenProps {
  score: number;
  highScore: number;
  onRestartGame: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ score, highScore, onRestartGame }) => {
  return (
    <div className="flex flex-col items-center justify-center text-white p-8 bg-slate-800 rounded-xl shadow-2xl max-w-sm mx-auto">
      <h2 className="text-4xl font-bold mb-4 text-red-500 font-mono">Game Over!</h2>
      <p className="text-2xl mb-2 text-slate-200">Your Score: <span className="font-bold text-yellow-400">{score}</span></p>
      {score >= highScore && score > 0 && (
        <p className="text-xl mb-1 text-green-400 animate-pulse">New High Score!</p>
      )}
       <p className="text-lg mb-6 text-slate-300">High Score: <span className="font-bold text-orange-400">{highScore}</span></p>
      <p className="text-sm mb-6 text-slate-400">Press Enter or click below to play again.</p>
      <button
        onClick={onRestartGame}
        className="px-8 py-3 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold text-xl rounded-lg shadow-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
      >
        Restart Game
      </button>
    </div>
  );
};

export default GameOverScreen;
