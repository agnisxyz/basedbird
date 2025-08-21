"use client";

import React from 'react';
import Image from 'next/image';

interface BirdProps {
  y: number;
}

export const Bird: React.FC<BirdProps> = ({ y }) => {
  return (
    <div
      className="absolute left-[100px] w-20 h-20 transition-transform duration-100"
      style={{ top: y }}
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
