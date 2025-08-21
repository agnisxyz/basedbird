"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Bird } from './Bird';
import { Pipe } from './Pipe';
import { GameOver } from './GameOver';
import { Leaderboard } from './Leaderboard';
import { useGameScore } from '../hooks/useGameScore';

interface GameState {
  isPlaying: boolean;
  isGameOver: boolean;
  isCountdown: boolean;
  countdown: number;
  showLeaderboard: boolean;
  score: number;
  highScore: number;
  birdY: number;
  birdVelocity: number;
  pipes: Array<{ x: number; topHeight: number; bottomY: number }>;
  gameSpeed: number;
}

const GRAVITY = 0.06;
const JUMP_FORCE = -3.2;
const PIPE_WIDTH = 80;
const PIPE_GAP = 200;
const PIPE_SPEED = 1.5;
const BIRD_SIZE = 80;

export const Game: React.FC = () => {
  const { submitScore, isSubmitting } = useGameScore();
  
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    isGameOver: false,
    isCountdown: false,
    countdown: 3,
    showLeaderboard: false,
    score: 0,
    highScore: 0,
    birdY: 300,
    birdVelocity: 0,
    pipes: [],
    gameSpeed: 1,
  });

  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isCountdown: true,
      countdown: 3,
      showLeaderboard: false,
      isPlaying: false,
      isGameOver: false,
      score: 0,
      birdY: 300,
      birdVelocity: 0,
      pipes: [
        { x: 1200, topHeight: 200, bottomY: 400 },
        { x: 1400, topHeight: 150, bottomY: 350 },
        { x: 1600, topHeight: 250, bottomY: 450 },
      ],
      gameSpeed: 1,
    }));
  }, []);

  const jump = useCallback(() => {
    if (gameState.isPlaying && !gameState.isGameOver) {
      setGameState(prev => ({
        ...prev,
        birdVelocity: JUMP_FORCE,
      }));
    }
  }, [gameState.isPlaying, gameState.isGameOver]);

  const gameOver = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPlaying: false,
      isGameOver: true,
      highScore: Math.max(prev.highScore, prev.score),
    }));
  }, []);

  const resetGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPlaying: false,
      isGameOver: false,
      isCountdown: false,
      countdown: 3,
      showLeaderboard: false,
      score: 0,
      birdY: 300,
      birdVelocity: 0,
      pipes: [],
    }));
  }, []);

  const toggleLeaderboard = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      showLeaderboard: !prev.showLeaderboard,
    }));
  }, []);

  const handleSubmitScore = useCallback(async () => {
    const success = await submitScore(gameState.score);
    if (success) {
      // Show success message or update UI
      console.log('Score submitted successfully!');
    }
  }, [submitScore, gameState.score]);

  const updateGame = useCallback((deltaTime: number) => {
    if (!gameState.isPlaying || gameState.isGameOver) return;

    setGameState(prev => {
      // Update bird physics
      const newBirdVelocity = prev.birdVelocity + GRAVITY;
      const newBirdY = prev.birdY + newBirdVelocity;

      // Check if bird hits ground or ceiling
      if (newBirdY <= 0 || newBirdY >= 600 - BIRD_SIZE) {
        gameOver();
        return prev;
      }

      // Update pipes
      const newPipes = prev.pipes.map(pipe => ({
        ...pipe,
        x: pipe.x - PIPE_SPEED * prev.gameSpeed,
      })).filter(pipe => pipe.x > -PIPE_WIDTH);

      // Add new pipes
      if (newPipes.length === 0 || newPipes[newPipes.length - 1].x < 800) {
        const lastPipeX = newPipes.length > 0 ? newPipes[newPipes.length - 1].x : 1200;
        const topHeight = Math.random() * 200 + 100;
        const bottomY = topHeight + PIPE_GAP;
        newPipes.push({
          x: lastPipeX + 250,
          topHeight,
          bottomY,
        });
      }

      // Check collisions - working collision detection
      const birdRect = {
        x: 100,
        y: newBirdY,
        width: BIRD_SIZE,
        height: BIRD_SIZE,
      };

      const collision = newPipes.some(pipe => {
        // Check pipes that are close to bird
        if (pipe.x > 200 || pipe.x < 80) return false;
        
        // Top pipe collision
        if (birdRect.x < pipe.x + PIPE_WIDTH && 
            birdRect.x + BIRD_SIZE > pipe.x &&
            birdRect.y < pipe.topHeight) {
          return true;
        }
        
        // Bottom pipe collision
        if (birdRect.x < pipe.x + PIPE_WIDTH && 
            birdRect.x + BIRD_SIZE > pipe.x &&
            birdRect.y + BIRD_SIZE > pipe.bottomY) {
          return true;
        }
        
        return false;
      });

      if (collision) {
        gameOver();
        return prev;
      }

      // Update score
      let newScore = prev.score;
      newPipes.forEach(pipe => {
        if (pipe.x + PIPE_WIDTH < 100 && pipe.x + PIPE_WIDTH >= 100 - PIPE_SPEED) {
          newScore += 1;
        }
      });

      // Increase game speed
      const newGameSpeed = Math.min(2, 1 + newScore / 50);

      return {
        ...prev,
        birdY: newBirdY,
        birdVelocity: newBirdVelocity,
        pipes: newPipes,
        score: newScore,
        gameSpeed: newGameSpeed,
      };
    });
  }, [gameState.isPlaying, gameState.isGameOver, gameOver]);

  // Countdown effect
  useEffect(() => {
    if (gameState.isCountdown && gameState.countdown > 0) {
      const timer = setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          countdown: prev.countdown - 1,
        }));
      }, 1000);

      return () => clearTimeout(timer);
    } else if (gameState.isCountdown && gameState.countdown === 0) {
      setGameState(prev => ({
        ...prev,
        isCountdown: false,
        isPlaying: true,
      }));
    }
  }, [gameState.isCountdown, gameState.countdown]);

  useEffect(() => {
    const gameLoop = (currentTime: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = currentTime;
      }
      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      updateGame(deltaTime);
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    if (gameState.isPlaying) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.isPlaying, updateGame]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        jump();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [jump]);

  return (
    <div className="relative w-full h-[600px] bg-gradient-to-b from-amber-200 via-orange-300 to-amber-800 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-green-600 to-transparent"></div>
        
        {/* Clouds */}
        <div className="absolute top-20 left-20 w-24 h-16 bg-white/40 rounded-full animate-pulse"></div>
        <div className="absolute top-16 left-60 w-20 h12 bg-white/35 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-24 left-96 w-28 h-18 bg-white/30 rounded-full animate-pulse delay-2000"></div>
      </div>

      {/* Game elements - show pipes during countdown and gameplay */}
      {(gameState.isPlaying || gameState.isCountdown) && (
        <>
          <Bird y={gameState.birdY} />
          {gameState.pipes.map((pipe, index) => (
            <Pipe key={index} {...pipe} />
          ))}
        </>
      )}

      {/* Score display */}
      {gameState.isPlaying && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-black/50 text-white px-6 py-2 rounded-full font-bold text-2xl">
            {gameState.score}
          </div>
        </div>
      )}

      {/* Countdown screen */}
      {gameState.isCountdown && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-8xl font-bold text-white mb-4 animate-pulse">
              {gameState.countdown}
            </div>
            <div className="text-2xl text-white/80">
              Get Ready!
            </div>
          </div>
        </div>
      )}

      {/* Game over screen */}
      {gameState.isGameOver && (
        <GameOver
          score={gameState.score}
          highScore={gameState.highScore}
          onPlayAgain={resetGame}
          onSubmitScore={handleSubmitScore}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Start screen */}
      {!gameState.isPlaying && !gameState.isGameOver && !gameState.showLeaderboard && !gameState.isCountdown && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-white mb-8 drop-shadow-lg">
              <span style={{ filter: 'hue-rotate(240deg) saturate(2) brightness(1.2)', transform: 'scaleX(-1)' }}>🐦</span> Based Bird
            </h1>
            <div className="space-y-4">
              <button
                onClick={startGame}
                className="bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-4 px-8 rounded-full text-xl shadow-lg transform hover:scale-105 transition-all duration-200 w-full"
              >
                🚀 Start Game
              </button>
              
              <button
                onClick={toggleLeaderboard}
                className="bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-4 px-8 rounded-full text-xl shadow-lg transform hover:scale-105 transition-all duration-200 w-full"
              >
                🏆 Leaderboard
              </button>
            </div>
          </div>
        </div>
      )}

             {/* Leaderboard screen */}
       {!gameState.isPlaying && !gameState.isGameOver && gameState.showLeaderboard && !gameState.isCountdown && (
         <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
           <div className="text-center mb-4">
             <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
               🏆 Leaderboard
             </h2>
           </div>
           
                       <div className="mb-6">
              <Leaderboard onBack={toggleLeaderboard} />
            </div>
         </div>
       )}

      {/* Click to jump hint */}
      {gameState.isPlaying && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-black/30 text-white px-4 py-2 rounded-full text-sm">
          Click to jump or use SPACE key
        </div>
        </div>
      )}

      {/* Click handler for mobile */}
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={jump}
        style={{ pointerEvents: (gameState.isPlaying || gameState.isCountdown) ? 'auto' : 'none' }}
      />
    </div>
  );
};
