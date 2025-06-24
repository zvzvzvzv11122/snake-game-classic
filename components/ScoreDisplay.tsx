
import React from 'react';

interface ScoreDisplayProps {
  score: number;
  highScore: number;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score, highScore }) => {
  return (
    <div className="text-white text-center my-4 w-full max-w-md mx-auto px-2">
      <div className="flex justify-between items-center text-xl sm:text-2xl font-mono">
        <div className="p-2 bg-slate-700 rounded-md shadow-md">
            Score: <span className="font-bold text-yellow-400">{score}</span>
        </div>
        <div className="p-2 bg-slate-700 rounded-md shadow-md">
            High Score: <span className="font-bold text-orange-400">{highScore}</span>
        </div>
      </div>
    </div>
  );
};

export default ScoreDisplay;
