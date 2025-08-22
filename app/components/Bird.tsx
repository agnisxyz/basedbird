"use client";

import React from 'react';
import Image from 'next/image';

interface BirdProps {
  y: number;
  velocity: number;
}

export const Bird: React.FC<BirdProps> = ({ y, velocity }) => {
  // Calculate rotation based on velocity
  const rotation = Math.min(Math.max(velocity * 15, -30), 30);
  
  return (
    <div
      className="absolute left-[100px] w-20 h-20 transition-transform duration-100"
      style={{ 
        top: y,
        transform: `rotate(${rotation}deg)`
      }}
    >
      {/* Pixel Art Flappy Bird */}
      <div className="relative w-full h-full">
        <Image 
          src="/bird.png" 
          alt="Based Bird" 
          width={80} 
          height={80} 
          className="w-full h-full object-contain"
          priority
        />
      </div>
    </div>
  );
};
