'use client';
import React, { useState, useEffect } from 'react';
import { GameStatus } from '@/lib/definitions';
import { cn } from '@/lib/utils';

interface GameDisplayProps {
  status: GameStatus;
  monkeyPosition: number;
  columns: number;
  multiplier: number;
}

const vehicleChars = ['🚙', '🚌', '🚚', '🚗', '🚕', '🚓'];

const RoadAnimation = () => (
  <style jsx>{`
    .vehicle {
      position: absolute;
      will-change: transform;
    }
    @keyframes drive-down {
      from { transform: translateY(-10vh) translateX(-50%); }
      to { transform: translateY(110vh) translateX(-50%); }
    }
  `}</style>
);

const generateRandomVehicles = (cols: number) => {
  return Array.from({ length: cols * 2 }).map((_, i) => {
    const duration = Math.random() * 4 + 3; // 3s to 7s
    const delay = Math.random() * 5; // 0s to 5s
    const laneWidth = 100 / cols;
    const lane = Math.floor(Math.random() * cols);
    const left = lane * laneWidth + (laneWidth / 2);
    const vehicleChar = vehicleChars[Math.floor(Math.random() * vehicleChars.length)];
    return {
      key: `vehicle-${i}-${Math.random()}`,
      char: vehicleChar,
      style: {
        left: `${left}%`,
        transform: 'translateX(-50%)',
        animation: `drive-down ${duration}s linear ${delay}s infinite`,
      },
    };
  });
};


export default function GameDisplay({ status, monkeyPosition, columns, multiplier }: GameDisplayProps) {
  const monkeyPositionStyle = {
    left: `calc(${(monkeyPosition / columns) * 100}% + ${(1 / columns) * 50}%)`,
    transform: 'translateX(-50%)',
    transition: 'left 0.2s linear',
  };

  const [vehicleData, setVehicleData] = useState(() => generateRandomVehicles(columns));

  useEffect(() => {
    // This function will run once and the CSS animation will loop infinitely.
    setVehicleData(generateRandomVehicles(columns));
  }, [columns]);


  return (
    <div className="w-full h-full bg-secondary/30 flex flex-col items-center justify-center overflow-hidden relative">
      {/* Multiplier Display */}
      <div className="absolute top-4 left-4 bg-black/50 text-white p-4 rounded-lg z-10 font-headline">
        <span className="text-2xl block">{multiplier.toFixed(2)}x</span>
        <span className="text-sm text-muted-foreground">Multiplier</span>
      </div>

      <RoadAnimation />
      <div className="absolute inset-x-0 top-0 bottom-0 flex justify-evenly">
        {Array.from({ length: columns - 1 }).map((_, i) => (
          <div key={`lane-line-${i}`} className="h-full w-[2px] border-l-2 border-dashed border-foreground/10" />
        ))}
      </div>

      {vehicleData.map(data => (
        <div
          key={data.key}
          className="vehicle text-5xl"
          style={data.style}
        >
          {data.char}
        </div>
      ))}

      <div 
        className={cn(
          "absolute bottom-4 text-5xl transition-transform duration-300",
           status === 'busted' && 'animate-ping'
        )} 
        style={monkeyPositionStyle}
      >
        {status === 'busted' ? '💥' : '🐒'}
      </div>

      {status === 'busted' && (
        <div className="absolute inset-0 bg-destructive/50 flex items-center justify-center">
          <h2 className="text-6xl font-headline font-bold text-destructive-foreground animate-pulse">
            BUSTED!
          </h2>
        </div>
      )}
    </div>
  );
}
