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
  coins: Array<{ x: number; y: number; collected: boolean }>;
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
    coins: [],
  });

  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);

  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const backgroundMusicRef = useRef<NodeJS.Timeout | null>(null);
  
  // Enhanced jump sound effect
  const playJumpSound = useCallback(() => {
    if (isMuted) return;
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const audioContext = audioContextRef.current;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const filterNode = audioContext.createBiquadFilter();
      
      oscillator.connect(filterNode);
      filterNode.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Create a more pleasant jump sound
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.15);
      
      // Add filter for softer sound
      filterNode.type = 'lowpass';
      filterNode.frequency.setValueAtTime(800, audioContext.currentTime);
      filterNode.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.15);
      
      // Smooth volume envelope
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.15 * volume, audioContext.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01 * volume, audioContext.currentTime + 0.15);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
    } catch (error) {
      console.log('Sound not supported');
    }
  }, [isMuted, volume]);

  // Enhanced background music with better composition
  const playBackgroundMusic = useCallback(() => {
    if (isMuted) return;
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const audioContext = audioContextRef.current;
      
      // Create a more sophisticated ambient melody
      const createNote = (frequency: number, duration: number, startTime: number, volume: number = 0.03) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filterNode = audioContext.createBiquadFilter();
        
        oscillator.connect(filterNode);
        filterNode.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Use triangle wave for softer, more ambient sound
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime + startTime);
        
        // Add subtle filter movement
        filterNode.type = 'lowpass';
        filterNode.frequency.setValueAtTime(frequency * 1.5, audioContext.currentTime + startTime);
        filterNode.frequency.exponentialRampToValueAtTime(frequency * 0.8, audioContext.currentTime + startTime + duration);
        
        // Smooth volume envelope
        gainNode.gain.setValueAtTime(0, audioContext.currentTime + startTime);
        gainNode.gain.linearRampToValueAtTime(volume * 0.03, audioContext.currentTime + startTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(volume * 0.003, audioContext.currentTime + startTime + duration);
        
        oscillator.start(audioContext.currentTime + startTime);
        oscillator.stop(audioContext.currentTime + startTime + duration);
      };

      // Create a more engaging, game-appropriate melody
      const melody = [
        // Main theme - uplifting progression
        { freq: 261, duration: 0.8, start: 0, vol: 0.03 },       // C4
        { freq: 329, duration: 0.8, start: 0.8, vol: 0.03 },     // E4
        { freq: 392, duration: 0.8, start: 1.6, vol: 0.03 },     // G4
        { freq: 523, duration: 1.2, start: 2.4, vol: 0.03 },     // C5
        
        // Second phrase
        { freq: 392, duration: 0.8, start: 3.6, vol: 0.03 },     // G4
        { freq: 329, duration: 0.8, start: 4.4, vol: 0.03 },     // E4
        { freq: 261, duration: 0.8, start: 5.2, vol: 0.03 },     // C4
        { freq: 196, duration: 1.2, start: 6.0, vol: 0.03 },     // G3
        
        // Third phrase - variation
        { freq: 261, duration: 0.8, start: 7.2, vol: 0.03 },     // C4
        { freq: 349, duration: 0.8, start: 8.0, vol: 0.03 },     // F4
        { freq: 440, duration: 0.8, start: 8.8, vol: 0.03 },     // A4
        { freq: 523, duration: 1.2, start: 9.6, vol: 0.03 },     // C5
        
        // Fourth phrase - resolution
        { freq: 440, duration: 0.8, start: 10.8, vol: 0.03 },    // A4
        { freq: 349, duration: 0.8, start: 11.6, vol: 0.03 },    // F4
        { freq: 261, duration: 1.6, start: 12.4, vol: 0.03 },    // C4
        
        // Harmonic layer - subtle background
        { freq: 523, duration: 3.2, start: 0, vol: 0.015 },      // C5 (harmony)
        { freq: 392, duration: 3.2, start: 3.2, vol: 0.015 },    // G4 (harmony)
        { freq: 329, duration: 3.2, start: 6.4, vol: 0.015 },    // E4 (harmony)
        { freq: 261, duration: 3.2, start: 9.6, vol: 0.015 },    // C4 (harmony)
        { freq: 196, duration: 3.2, start: 12.8, vol: 0.015 },   // G3 (harmony)
      ];

      melody.forEach(note => {
        createNote(note.freq, note.duration, note.start, note.vol);
      });

      // Loop the melody every 14 seconds for continuous background music
      if (gameState.isPlaying && !gameState.isGameOver) {
        backgroundMusicRef.current = setTimeout(() => {
          // Double check if game is still playing before continuing
          if (gameState.isPlaying && !gameState.isGameOver) {
            playBackgroundMusic();
          }
        }, 14000);
      } else {
        // Stop music if game is not playing or game over
        if (backgroundMusicRef.current) {
          clearTimeout(backgroundMusicRef.current);
          backgroundMusicRef.current = null;
        }
      }

    } catch (error) {
      console.log('Background music not supported');
    }
  }, [gameState.isPlaying, gameState.isGameOver, isMuted, volume]);

  // Continuous background music player
  const startContinuousMusic = useCallback(() => {
    if (isMuted) return;
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const audioContext = audioContextRef.current;
      
      // Create a continuous ambient loop
      const createContinuousNote = (frequency: number, duration: number, startTime: number) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Use sine wave for smoother continuous sound
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime + startTime);
        
        // Very subtle volume for continuous background
        gainNode.gain.setValueAtTime(0, audioContext.currentTime + startTime);
        gainNode.gain.linearRampToValueAtTime(0.008 * volume, audioContext.currentTime + startTime + 2);
        gainNode.gain.setValueAtTime(0.008 * volume, audioContext.currentTime + startTime + 2);
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + startTime + duration - 2);
        
        oscillator.start(audioContext.currentTime + startTime);
        oscillator.stop(audioContext.currentTime + startTime + duration);
      };

      // Create a longer, more varied continuous melody
      const continuousMelody = [
        // Extended theme with more variety
        { freq: 261, duration: 4, start: 0 },      // C4
        { freq: 329, duration: 4, start: 4 },      // E4
        { freq: 392, duration: 4, start: 8 },      // G4
        { freq: 523, duration: 4, start: 12 },     // C5
        { freq: 392, duration: 4, start: 16 },     // G4
        { freq: 329, duration: 4, start: 20 },     // E4
        { freq: 261, duration: 4, start: 24 },     // C4
        { freq: 196, duration: 4, start: 28 },     // G3
        { freq: 261, duration: 4, start: 32 },     // C4
        { freq: 349, duration: 4, start: 36 },     // F4
        { freq: 440, duration: 4, start: 40 },     // A4
        { freq: 523, duration: 4, start: 44 },     // C5
        { freq: 440, duration: 4, start: 48 },     // A4
        { freq: 349, duration: 4, start: 52 },     // F4
        { freq: 261, duration: 4, start: 56 },     // C4
      ];

      continuousMelody.forEach(note => {
        createContinuousNote(note.freq, note.duration, note.start);
      });

      // Loop every 60 seconds for continuous background music
      if (gameState.isPlaying && !gameState.isGameOver) {
        backgroundMusicRef.current = setTimeout(() => {
          // Double check if game is still playing before continuing
          if (gameState.isPlaying && !gameState.isGameOver) {
            startContinuousMusic();
          }
        }, 60000);
      } else {
        // Stop music if game is not playing or game over
        if (backgroundMusicRef.current) {
          clearTimeout(backgroundMusicRef.current);
          backgroundMusicRef.current = null;
        }
      }

    } catch (error) {
      console.log('Continuous music not supported');
    }
  }, [gameState.isPlaying, gameState.isGameOver, isMuted, volume]);

  // Sound effect for scoring points
  const playScoreSound = useCallback(() => {
    if (isMuted) return;
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const audioContext = audioContextRef.current;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Pleasant scoring sound
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1 * volume, audioContext.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01 * volume, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.log('Score sound not supported');
    }
  }, [isMuted, volume]);

  // Sound effect for game over
  const playGameOverSound = useCallback(() => {
    if (isMuted) return;
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const audioContext = audioContextRef.current;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Sad descending tone
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.3);
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.15 * volume, audioContext.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01 * volume, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('Game over sound not supported');
    }
  }, [isMuted, volume]);

  // Sound effect for game start
  const playGameStartSound = useCallback(() => {
    if (isMuted) return;
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const audioContext = audioContextRef.current;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Upward ascending tone for game start
      oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.12 * volume, audioContext.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01 * volume, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.log('Game start sound not supported');
    }
  }, [isMuted, volume]);

  // Sound effect for countdown numbers
  const playCountdownSound = useCallback(() => {
    if (isMuted) return;
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const audioContext = audioContextRef.current;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Short beep for countdown
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1 * volume, audioContext.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01 * volume, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.log('Countdown sound not supported');
    }
  }, [isMuted, volume]);

  // Sound effect for collision/hit
  const playCollisionSound = useCallback(() => {
    if (isMuted) return;
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const audioContext = audioContextRef.current;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Impact sound - quick burst
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2 * volume, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01 * volume, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.log('Collision sound not supported');
    }
  }, [isMuted, volume]);

  // Sound effect for collecting coins
  const playCoinSound = useCallback(() => {
    if (isMuted) return;
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const audioContext = audioContextRef.current;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Pleasant coin collection sound
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1500, audioContext.currentTime + 0.15);
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.15 * volume, audioContext.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01 * volume, audioContext.currentTime + 0.15);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
    } catch (error) {
      console.log('Coin sound not supported');
    }
  }, [isMuted, volume]);

  // Cleanup function for audio
  const cleanupAudio = useCallback(() => {
    if (backgroundMusicRef.current) {
      clearTimeout(backgroundMusicRef.current);
      backgroundMusicRef.current = null;
    }
    // Resume audio context if it was suspended
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  }, []);


  const startGame = useCallback(() => {
    // Initialize audio context on first user interaction
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        // Resume audio context if it was suspended
        if (audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume();
        }
      } catch (error) {
        console.log('Audio context not supported');
      }
    }
    
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
      coins: [
        // Randomly decide which pipes get coins (50% chance each)
        ...(Math.random() < 0.5 ? [{ x: 1200 + PIPE_WIDTH / 2 - 5, y: 200 + PIPE_GAP / 2, collected: false }] : []),
        ...(Math.random() < 0.5 ? [{ x: 1400 + PIPE_WIDTH / 2 - 5, y: 150 + PIPE_GAP / 2, collected: false }] : []),
        ...(Math.random() < 0.5 ? [{ x: 1600 + PIPE_WIDTH / 2 - 5, y: 250 + PIPE_GAP / 2, collected: false }] : []),
      ],
    }));
  }, []);

  const jump = useCallback(() => {
    // Only allow jumping during gameplay, not during countdown
    if (gameState.isPlaying && !gameState.isGameOver) {
      playJumpSound();
      setGameState(prev => ({
        ...prev,
        birdVelocity: JUMP_FORCE,
      }));
    }
  }, [gameState.isPlaying, gameState.isGameOver, playJumpSound]);

  const gameOver = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPlaying: false,
      isGameOver: true,
      highScore: Math.max(prev.highScore, prev.score),
    }));
    
    // Stop all background music when game over
    if (backgroundMusicRef.current) {
      clearTimeout(backgroundMusicRef.current);
      backgroundMusicRef.current = null;
    }
    
    // Force stop any ongoing audio context
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        if (audioContextRef.current.state !== 'suspended') {
          audioContextRef.current.suspend();
        }
        audioContextRef.current.close();
      } catch (error) {
        console.log('Could not stop audio context');
      }
    }
    
    playGameOverSound();
  }, [playGameOverSound]);

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
      coins: [],
    }));
    cleanupAudio(); // Clean up audio on reset
  }, [cleanupAudio]);

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
    if (!gameState.isPlaying || gameState.isGameOver) {
      // Stop music if game is not playing
      if (backgroundMusicRef.current) {
        clearTimeout(backgroundMusicRef.current);
        backgroundMusicRef.current = null;
      }
      
      // Also completely stop audio context when game is over
      if (gameState.isGameOver && audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try {
          if (audioContextRef.current.state !== 'suspended') {
            audioContextRef.current.suspend();
          }
          audioContextRef.current.close();
          audioContextRef.current = null;
        } catch (error) {
          console.log('Could not stop audio context');
        }
      }
      return;
    }

    setGameState(prev => {
      // Update bird physics
      const newBirdVelocity = prev.birdVelocity + GRAVITY;
      const newBirdY = prev.birdY + newBirdVelocity;

      // Check if bird hits ground or ceiling
      if (newBirdY <= 0 || newBirdY >= 600 - BIRD_SIZE) {
        playCollisionSound();
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

      // Check collisions - balanced collision detection
      const birdRect = {
        x: 100 + 8,
        y: newBirdY + 8,
        width: BIRD_SIZE - 16,
        height: BIRD_SIZE - 16,
      };

      const collision = newPipes.some(pipe => {
        // Check pipes that are close to bird
        if (pipe.x > 200 || pipe.x < 80) return false;
        
        // Top pipe collision
        if (birdRect.x < pipe.x + PIPE_WIDTH && 
            birdRect.x + birdRect.width > pipe.x &&
            birdRect.y < pipe.topHeight) {
          return true;
        }
        
        // Bottom pipe collision
        if (birdRect.x < pipe.x + PIPE_WIDTH && 
            birdRect.x + birdRect.width > pipe.x &&
            birdRect.y + birdRect.height > pipe.bottomY) {
          return true;
        }
        
        return false;
      });

      if (collision) {
        playCollisionSound();
        gameOver();
        return prev;
      }

      // Update coins and score
      let newScore = prev.score;
      const newCoins = prev.coins.map(coin => {
        // Check if bird collected the coin
        const birdRect = {
          x: 100 + 8,
          y: newBirdY + 8,
          width: BIRD_SIZE - 16,
          height: BIRD_SIZE - 16,
        };
        
        if (!coin.collected && 
            birdRect.x < coin.x + 30 && 
            birdRect.x + birdRect.width > coin.x &&
            birdRect.y < coin.y + 30 && 
            birdRect.y + birdRect.height > coin.y) {
          // Coin collected!
          newScore += 10;
          playCoinSound();
          return { ...coin, collected: true };
        }
        return coin;
      }).filter(coin => coin.x > -50); // Remove coins that are off screen

      // Move coins with the game
      const updatedCoins = newCoins.map(coin => ({
        ...coin,
        x: coin.x - PIPE_SPEED * prev.gameSpeed,
      }));

      // Add new coins when needed
      if (updatedCoins.length === 0 || updatedCoins[updatedCoins.length - 1].x < 800) {
        const lastCoinX = updatedCoins.length > 0 ? updatedCoins[updatedCoins.length - 1].x : 1200;
        
        // Randomly decide if we should add a coin (50% chance for variety)
        if (Math.random() < 0.5) {
                      // Find the nearest pipe to place coin in its gap
            const nearestPipe = newPipes.find(pipe => pipe.x > lastCoinX + 200);
            if (nearestPipe) {
              // Calculate the center of the pipe gap (between top and bottom pipes)
              const gapCenter = nearestPipe.topHeight + PIPE_GAP / 2;
              // Add some random variation around the center (smaller range for better positioning)
              const coinY = gapCenter + (Math.random() - 0.5) * 20;
              
              // Ensure coin is within safe bounds
              const safeY = Math.max(120, Math.min(480, coinY));
              
              updatedCoins.push({
                x: nearestPipe.x + PIPE_WIDTH / 2 - 5, // 10 pixels to the right from previous position
                y: safeY,
                collected: false,
              });
            }
        }
      }

      // Increase game speed
      const newGameSpeed = Math.min(2, 1 + newScore / 100);

      return {
        ...prev,
        birdY: newBirdY,
        birdVelocity: newBirdVelocity,
        pipes: newPipes,
        coins: updatedCoins,
        score: newScore,
        gameSpeed: newGameSpeed,
      };
    });
  }, [gameState.isPlaying, gameState.isGameOver, gameOver, playCoinSound, playCollisionSound]);

  // Countdown effect
  useEffect(() => {
    if (gameState.isCountdown && gameState.countdown > 0) {
      // Play countdown sound for each number
      if (gameState.countdown <= 3) {
        playCountdownSound();
      }
      
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
      
      // Start background music when game starts
      playBackgroundMusic();
      // Start continuous background music
      startContinuousMusic();
      // Play game start sound
      playGameStartSound();
      
      // Ensure audio context is running
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
    }
  }, [gameState.isCountdown, gameState.countdown, playBackgroundMusic, startContinuousMusic, playGameStartSound, playCountdownSound]);

  // Start music when countdown begins
  useEffect(() => {
    if (gameState.isCountdown && gameState.countdown === 3) {
      // Start background music when countdown begins
      playBackgroundMusic();
      startContinuousMusic();
      
      // Ensure audio context is running
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
    }
  }, [gameState.isCountdown, gameState.countdown, playBackgroundMusic, startContinuousMusic]);

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
      cleanupAudio(); // Clean up audio on component unmount
    };
  }, [gameState.isPlaying, updateGame, cleanupAudio]);

  // Stop music when game over
  useEffect(() => {
    if (gameState.isGameOver) {
      // Stop all background music
      if (backgroundMusicRef.current) {
        clearTimeout(backgroundMusicRef.current);
        backgroundMusicRef.current = null;
      }
      
      // Completely stop audio context
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try {
          if (audioContextRef.current.state !== 'suspended') {
            audioContextRef.current.suspend();
          }
          audioContextRef.current.close();
          audioContextRef.current = null;
        } catch (error) {
          console.log('Could not stop audio context');
        }
      }
    }
  }, [gameState.isGameOver]);

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
      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        input[type="range"]::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        input[type="range"]::-ms-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
        }
      `}</style>
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
          <Bird y={gameState.birdY} velocity={gameState.birdVelocity} />
          {gameState.pipes.map((pipe, index) => (
            <Pipe key={index} {...pipe} />
          ))}
          
          {/* Render coins */}
          {gameState.coins.map((coin, index) => (
            !coin.collected && (
              <div
                key={`coin-${index}`}
                className="absolute w-12 h-12 text-4xl drop-shadow-lg pointer-events-none"
                style={{
                  left: coin.x,
                  top: coin.y,
                  transform: 'translate(-50%, -50%)',
                  filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.6))',
                  zIndex: 10,
                }}
              >
                🪙
                {/* Glowing effect */}
                <div 
                  className="absolute inset-0 w-12 h-12 rounded-full animate-pulse"
                  style={{
                    background: 'radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%)',
                    zIndex: -1,
                  }}
                />
              </div>
            )
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
            
            {/* Sound control button on start screen */}
            <div className="mt-6 space-y-3">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="bg-black/30 text-white p-3 rounded-full hover:bg-black/50 transition-all duration-200"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? "🔇 Sound Off" : "🔊 Sound On"}
              </button>
              
              {/* Volume control on start screen */}
              <div className="flex items-center space-x-3">
                <span className="text-white/80 text-sm">Volume:</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-24 h-2 bg-white/30 rounded-lg appearance-none cursor-pointer"
                  title="Volume"
                />
              </div>
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
