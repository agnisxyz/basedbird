"use client";

import React from 'react';

interface GameOverProps {
  score: number;
  highScore: number;
  onPlayAgain: () => void;
  onSubmitScore: () => void;
  isSubmitting: boolean;
}

export const GameOver: React.FC<GameOverProps> = ({
  score,
  highScore,
  onPlayAgain,
  onSubmitScore,
  isSubmitting,
}) => {
  const isNewHighScore = score >= highScore;

  return (
    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
             <div className="bg-gradient-to-br from-violet-900 to-slate-900 p-8 rounded-3xl shadow-2xl border-2 border-violet-400 max-w-md w-full mx-4">
        {/* Game Over Title */}
        <div className="text-center mb-6">
          <h2 className="text-4xl font-bold text-white mb-2">🎯 Game Over!</h2>
          {isNewHighScore && (
            <div className="text-yellow-400 text-lg font-semibold animate-pulse">
              🏆 New Record!
            </div>
          )}
        </div>

        {/* Score Display */}
        <div className="bg-black/30 rounded-2xl p-6 mb-6 text-center">
          <div className="text-2xl text-gray-300 mb-2">Your Score</div>
          <div className="text-5xl font-bold text-yellow-400 mb-2">{score}</div>
          
          {highScore > 0 && (
            <div className="text-lg text-gray-400">
              High Score: <span className="text-green-400 font-semibold">{highScore}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={onSubmitScore}
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-4 px-6 rounded-2xl text-lg shadow-lg transform hover:scale-105 transition-all duration-200 border-2 border-green-400 disabled:border-gray-400"
          >
            {isSubmitting ? '⏳ Submitting...' : '🚀 Submit Score'}
          </button>
          
          <button
            onClick={onPlayAgain}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-2xl text-lg shadow-lg transform hover:scale-105 transition-all duration-200 border-2 border-blue-400"
          >
            🔄 Play Again
          </button>
        </div>

        {/* Encouragement */}
        <div className="text-center mt-6 text-gray-300 text-sm">
          {score < 5 && "Not bad for first time! 😊"}
          {score >= 5 && score < 15 && "Well played! 🎉"}
          {score >= 15 && score < 30 && "Amazing! You're a pro! 🏆"}
          {score >= 30 && "Incredible! You're a legend! 👑"}
        </div>
      </div>
    </div>
  );
};
