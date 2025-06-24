
import React from 'react';

interface StartScreenProps {
  onStartGame: () => void;
  highScore: number;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStartGame, highScore }) => {
  return (
    <div className="flex flex-col items-center justify-center text-white p-8 bg-slate-800 rounded-xl shadow-2xl max-w-sm mx-auto">
      <h1 className="text-5xl font-bold mb-3 text-green-400 tracking-wider font-mono">SNAKE</h1>
      <p className="text-lg mb-6 text-slate-300">Classic Snake Game</p>
      {highScore > 0 && (
         <p className="text-md mb-2 text-orange-400 font-mono">High Score: {highScore}</p>
      )}
      <p className="text-sm mb-6 text-slate-400">Use Arrow Keys or WASD to control. <br/> Press Enter or click below to start.</p>
      <button
        onClick={onStartGame}
        className="px-8 py-3 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-semibold text-xl rounded-lg shadow-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
      >
        Start Game
      </button>
    </div>
  );
};

export default StartScreen;
