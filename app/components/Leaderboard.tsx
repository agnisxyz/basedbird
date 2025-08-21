"use client";

import React, { useState, useEffect } from 'react';

interface LeaderboardEntry {
  id: string;
  player: string;
  score: number;
  timestamp: number;
}

// Mock data - gerçek uygulamada bu veriler blockchain'den gelecek
const mockLeaderboard: LeaderboardEntry[] = [
  { id: '1', player: '0x1234...5678', score: 42, timestamp: Date.now() - 3600000 },
  { id: '2', player: '0x8765...4321', score: 38, timestamp: Date.now() - 7200000 },
  { id: '3', player: '0x1111...2222', score: 35, timestamp: Date.now() - 10800000 },
  { id: '4', player: '0x3333...4444', score: 31, timestamp: Date.now() - 14400000 },
  { id: '5', player: '0x5555...6666', score: 28, timestamp: Date.now() - 18000000 },
  { id: '6', player: '0x7777...8888', score: 25, timestamp: Date.now() - 21600000 },
  { id: '7', player: '0x9999...0000', score: 22, timestamp: Date.now() - 25200000 },
  { id: '8', player: '0xaaaa...bbbb', score: 19, timestamp: Date.now() - 28800000 },
  { id: '9', player: '0xcccc...dddd', score: 16, timestamp: Date.now() - 32400000 },
  { id: '10', player: '0xeeee...ffff', score: 13, timestamp: Date.now() - 36000000 },
];

interface LeaderboardProps {
  onBack?: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ onBack }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(mockLeaderboard);
  const [isLoading, setIsLoading] = useState(false);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    return `${Math.floor(diff / 86400000)} days ago`;
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-400 to-yellow-600 border-yellow-300';
      case 2: return 'bg-gradient-to-r from-gray-300 to-gray-500 border-gray-200';
      case 3: return 'bg-gradient-to-r from-orange-400 to-orange-600 border-orange-300';
      default: return 'bg-gradient-to-r from-slate-600 to-slate-800 border-slate-500';
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="bg-gradient-to-br from-slate-900/95 via-emerald-900/90 to-slate-900/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-emerald-500/30">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-full mb-4 shadow-lg">
            <span className="text-3xl">🏆</span>
          </div>
          <h3 className="text-3xl font-bold text-white mb-2">
            Top 10 Champions
          </h3>
        </div>

        {/* Leaderboard List - Single Column */}
        <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
          {leaderboard.map((entry, index) => (
            <div
              key={entry.id}
              className={`flex items-center justify-between p-4 rounded-xl ${getRankStyle(index + 1)} text-white shadow-lg border-2`}
            >
              {/* Left Side - Rank and Player */}
              <div className="flex items-center space-x-4">
                {/* Rank Badge */}
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold">
                  {getRankIcon(index + 1)}
                </div>
                
                {/* Player Info */}
                <div>
                  <div className="font-bold text-lg">
                    {formatAddress(entry.player)}
                  </div>
                  <div className="text-sm opacity-80">
                    {formatTime(entry.timestamp)}
                  </div>
                </div>
              </div>

              {/* Right Side - Score */}
              <div className="text-right">
                <div className="text-2xl font-bold">
                  {entry.score}
                </div>
                <div className="text-xs opacity-80 uppercase tracking-wider">
                  Points
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-6">
          {/* Back Button */}
          {onBack && (
            <button
              onClick={onBack}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 px-6 rounded-xl text-base shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-red-400"
            >
              ← Back
            </button>
          )}

          {/* Refresh Button */}
          <button
            onClick={() => {
              setIsLoading(true);
              // Simulate refresh
              setTimeout(() => setIsLoading(false), 1000);
            }}
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-500 disabled:to-gray-600 text-white px-6 py-3 rounded-xl text-base font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Refreshing...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span>🔄</span>
                <span>Refresh</span>
              </div>
            )}
          </button>
        </div>

        {/* Info */}
        <div className="text-center mt-4">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 px-4 py-2 rounded-full border border-emerald-500/30">
            <span className="text-emerald-300">🔗</span>
            <span className="text-gray-300 text-xs">Scores stored on Base network</span>
          </div>
        </div>
      </div>
    </div>
  );
};
