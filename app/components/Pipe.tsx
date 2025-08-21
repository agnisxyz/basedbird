"use client";

import React from 'react';

interface PipeProps {
  x: number;
  topHeight: number;
  bottomY: number;
}

export const Pipe: React.FC<PipeProps> = ({ x, topHeight, bottomY }) => {
  return (
    <>
      {/* Top pipe */}
      <div
        className="absolute w-20 bg-gradient-to-b from-green-600 to-green-800 border-2 border-green-900 shadow-lg"
        style={{
          left: x,
          top: 0,
          height: topHeight,
        }}
      >
        {/* Pipe cap */}
        <div className="absolute -bottom-2 left-0 w-full h-4 bg-gradient-to-b from-green-700 to-green-900 border-2 border-green-900"></div>
        
        {/* Pipe highlight */}
        <div className="absolute top-2 left-2 w-2 h-4 bg-green-400 rounded-full opacity-60"></div>
        <div className="absolute top-8 left-2 w-2 h-4 bg-green-400 rounded-full opacity-60"></div>
      </div>

      {/* Bottom pipe */}
      <div
        className="absolute w-20 bg-gradient-to-b from-green-600 to-green-800 border-2 border-green-900 shadow-lg"
        style={{
          left: x,
          top: bottomY,
          height: 600 - bottomY,
        }}
      >
        {/* Pipe cap */}
        <div className="absolute -top-2 left-0 w-full h-4 bg-gradient-to-b from-green-700 to-green-900 border-2 border-green-900"></div>
        
        {/* Pipe highlight */}
        <div className="absolute top-2 left-2 w-2 h-4 bg-green-400 rounded-full opacity-60"></div>
        <div className="absolute top-8 left-2 w-2 h-4 bg-green-400 rounded-full opacity-60"></div>
      </div>
    </>
  );
};
