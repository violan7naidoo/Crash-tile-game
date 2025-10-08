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
    @keyframes drive-down {
      from { transform: translateY(-20vh); }
      to { transform: translateY(120vh); }
    }
    @keyframes moveDown {
      from { transform: translateY(-100%); }
      to { transform: translateY(100vh); }
    }
    .vehicle {
      position: absolute;
      will-change: transform;
      animation-timing-function: linear;
      animation-iteration-count: 1;
      filter: drop-shadow(0 0 4px rgba(0,0,0,0.5));
      z-index: 5;
    }
    .perspective-1000 {
      perspective: 1000px;
    }
    .transform-style-preserve-3d {
      transform-style: preserve-3d;
    }
  `}</style>
);

const generateRandomVehicles = (cols: number) => {
  const vehicles = [];
  const baseDuration = 3; // Base duration in seconds
  const speedVariation = 2; // Speed variation in seconds
  
  // Track which lanes already have vehicles
  const usedLanes = new Set();
  
  // Generate one vehicle per lane with unique speed
  for (let i = 0; i < cols; i++) {
    let lane;
    // Find an unused lane
    do {
      lane = Math.floor(Math.random() * cols);
    } while (usedLanes.has(lane));
    
    usedLanes.add(lane);
    const laneWidth = 100 / cols;
    const left = lane * laneWidth + (laneWidth / 2);
    
    // Each lane gets one vehicle with a unique speed
    const duration = baseDuration + (Math.random() * speedVariation);
    const vehicleChar = vehicleChars[Math.floor(Math.random() * vehicleChars.length)];
    
    vehicles.push({
      key: `vehicle-${lane}-${Date.now()}`,
      char: vehicleChar,
      style: {
        left: `${left}%`,
        animation: `drive-down ${duration}s 0s 1`, // Remove infinite, run once
      },
      lane: lane,
      duration: duration * 1000, // Convert to ms
    });
  }
  
  return vehicles;
};


export default function GameDisplay({ status, monkeyPosition, columns, multiplier }: GameDisplayProps) {
  const monkeyPositionStyle = {
    left: `calc(${(monkeyPosition / columns) * 100}% + ${(1 / columns) * 50}%)`,
    transform: 'translateX(-50%)',
    transition: 'left 0.2s linear',
  };

  interface Vehicle {
    key: string;
    char: string;
    style: React.CSSProperties;
    lane: number;
    duration: number;
  }

  const [vehicleData, setVehicleData] = useState<Vehicle[]>([]);

  useEffect(() => {
    // Function to create a new vehicle in a specific lane
    const createVehicle = (lane: number): Vehicle => {
      const laneWidth = 100 / columns;
      const left = lane * laneWidth + (laneWidth / 2);
      const duration = 3 + (Math.random() * 2); // 3-5s
      
      return {
        key: `vehicle-${lane}-${Date.now()}`,
        char: vehicleChars[Math.floor(Math.random() * vehicleChars.length)],
        style: {
          left: `${left}%`,
          animation: `drive-down ${duration}s 0s 1`,
        },
        lane: lane,
        duration: duration * 1000, // Store duration in milliseconds
      };
    };

    // Initial set of vehicles
    const initialVehicles = Array.from({ length: columns }, (_, i) => createVehicle(i));
    setVehicleData(initialVehicles);
    
    // Function to replace a vehicle when its animation ends
    const replaceVehicle = (lane: number): NodeJS.Timeout => {
      const newVehicle = createVehicle(lane);
      
      setVehicleData(prev => [
        ...prev.filter(v => v.lane !== lane),
        newVehicle
      ]);
      
      // Schedule next vehicle for this lane
      const duration = parseFloat(newVehicle.style.animation?.toString().split(' ')[1] || '3');
      return setTimeout(() => {
        replaceVehicle(lane);
      }, duration * 1000);
    };
    
    // Start the cycle for each lane
    const timeouts: NodeJS.Timeout[] = [];
    
    initialVehicles.forEach((vehicle, i) => {
      const duration = parseFloat(vehicle.style.animation?.toString().split(' ')[1] || '3');
      const delay = Math.random() * 2000; // Stagger initial appearance
      
      const timeoutId = setTimeout(() => {
        const newTimeoutId = replaceVehicle(i);
        timeouts.push(newTimeoutId);
      }, delay);
      
      timeouts.push(timeoutId);
    });
    
    // Cleanup function
    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [columns]);
  
  return (
    <div className="w-full h-full bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col items-center justify-center overflow-hidden relative">
      {/* road surface with subtle texture */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/svg%3E")',
          backgroundSize: '60px 60px',
          backgroundRepeat: 'repeat'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
      </div>

      {/* Multiplier Display */}
      <div className="absolute top-4 left-4 bg-black/70 text-white p-4 rounded-lg z-10 font-headline border border-white/10 shadow-lg">
        <div className="text-2xl font-bold">{multiplier.toFixed(2)}x</div>
        <div className="text-xs text-muted-foreground">Multiplier</div>
      </div>

      <RoadAnimation />
      
      {/* Road with perspective */}
      <div className="absolute inset-0 perspective-1000">
        <div className="relative w-full h-full transform-style-preserve-3d">
          {/* Lane lines */}
          <div className="absolute inset-0 flex justify-evenly">
            {Array.from({ length: columns - 1 }).map((_, i) => (
              <div 
                key={`lane-line-${i}`} 
                className="h-full w-[1px] bg-white/30 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-12 bg-white/80 animate-[moveDown_1.5s_linear_infinite]" 
                     style={{ animationDelay: `${i * 0.2}s` }} />
              </div>
            ))}
          </div>
          
          {/* Vehicles container */}
          <div className="relative w-full h-full">
            {vehicleData.map((data) => (
              <div
                key={data.key}
                className="vehicle text-5xl absolute"
                style={{
                  ...data.style,
                  transform: 'translateX(-50%)',
                }}
                onAnimationEnd={() => {
                  // Remove the vehicle when its animation ends
                  // The replacement is handled by the effect
                }}
              >
                {data.char}
              </div>
            ))}
          </div>
        </div>
      </div>

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
