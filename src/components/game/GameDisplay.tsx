'use client';
import React, { useState, useEffect } from 'react';
import { GameStatus } from '@/lib/definitions';
import { cn } from '@/lib/utils';

interface GameDisplayProps {
  status: GameStatus;
  monkeyPosition: number;
  columns: number;
  multiplier: number;
  onBust: () => void;
  jumpCount: number;
  // Add next multiplier to show in the next lane
  nextMultiplier?: number;
}

const vehicleChars = ['🚙', '🚌', '🚚', '🚗', '🚕', '🚓'];

const RoadAnimation = () => (
  <style jsx>{`
    @keyframes drive-down {
      from { transform: translateY(-100%); }
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
    }
  `}</style>
);

export default function GameDisplay({ status, monkeyPosition, columns, multiplier, onBust, jumpCount, nextMultiplier }: GameDisplayProps) {
  // Calculate monkey position to be centered in the lane
  const monkeyPositionStyle = {
    left: `${((monkeyPosition + 0.5) / columns) * 100}%`,
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

  // Refs for collision detection and animation
  const vehicleRefs = React.useRef<{[key: string]: HTMLDivElement | null}>({});
  const monkeyRef = React.useRef<HTMLDivElement>(null);
  const animationFrameRef = React.useRef<number>();
  const lastCheckTime = React.useRef<number>(0);
  const isMounted = React.useRef(false);
  
  // State for vehicle data
  const [vehicles, setVehicles] = React.useState<Vehicle[]>([]);
  
  // Function to create a new vehicle with random speed and position
  const createVehicle = React.useCallback((lane: number, delay: number = 0): Vehicle => {
    const laneWidth = 100 / columns;
    // Position vehicles slightly to the left of lane center (half the jump width)
    const left = (lane + 0.4) * laneWidth;
    const duration = 2 + (Math.random() * 3); // 2-5s (faster cars)
    const key = `vehicle-${lane}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Start the vehicle just above the viewport and animate it down
    return {
      key,
      char: vehicleChars[Math.floor(Math.random() * vehicleChars.length)],
      style: {
        left: `${left}%`,
        transform: 'translateY(-100%)', // Start above the viewport
        animation: `drive-down ${duration}s ${delay}s linear 1 forwards`,
        willChange: 'transform',
      },
      lane,
      duration: duration * 1000,
    };
  }, [columns]);
  
  // Clean up on unmount
  React.useEffect(() => {
    isMounted.current = true;
    
    return () => {
      isMounted.current = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setVehicles([]);
    };
  }, []);
  
  // Track which lanes currently have active vehicles
  const activeLanes = React.useRef<Set<number>>(new Set());
  
  // Generate vehicles effect with staggered timing
  React.useEffect(() => {
    if (status !== 'playing') {
      setVehicles([]);
      activeLanes.current.clear();
      return;
    }
    
    const timeouts: NodeJS.Timeout[] = [];
    
    // Function to add a vehicle to a specific lane with a delay
    const addVehicleToLane = (lane: number, delay: number) => {
      const timeout = setTimeout(() => {
        if (status !== 'playing') return;
        
        // Only add a vehicle if the lane is currently empty
        if (!activeLanes.current.has(lane)) {
          activeLanes.current.add(lane);
          
          // Create a new vehicle with no delay to prevent the freeze
          const newVehicle = createVehicle(lane, 0);
          
          setVehicles(prev => [...prev, newVehicle]);
          
          // Calculate when this vehicle will be done
          const vehicleDuration = newVehicle.duration / 1000; // in seconds
          
          // Schedule the next vehicle for this lane after this one is done, plus some gap
          const gapBetweenVehicles = 1 + Math.random() * 2; // 1-3s gap
          const nextDelay = vehicleDuration + gapBetweenVehicles;
          
          // Remove the vehicle after its animation completes
          const removeTimeout = setTimeout(() => {
            setVehicles(prev => prev.filter(v => v.key !== newVehicle.key));
            activeLanes.current.delete(lane);
            
            // Schedule next vehicle for this lane
            addVehicleToLane(lane, 0);
          }, (vehicleDuration * 1000) * 1.1); // Add 10% buffer
          
          timeouts.push(removeTimeout);
        }
      }, delay * 1000);
      
      timeouts.push(timeout);
    };
    
    // Start vehicle generation for each lane with staggered initial delays
    for (let i = 0; i < columns; i++) {
      // Stagger the initial appearance of vehicles in each lane
      const initialDelay = Math.random() * 3;
      addVehicleToLane(i, initialDelay);
    }
    
    // Cleanup function
    return () => {
      timeouts.forEach(clearTimeout);
      setVehicles([]);
      activeLanes.current.clear();
    };
  }, [status, columns, createVehicle]);

  // Track which lanes are blocked by the safe barrier
  const blockedLanes = React.useRef<Set<number>>(new Set());
  
  // Reset blocked lanes when game resets
  React.useEffect(() => {
    if (status === 'idle') {
      blockedLanes.current.clear();
    }
  }, [status]);

  // Collision detection effect
  React.useEffect(() => {
    if (status !== 'playing') return;
    
    const checkCollisions = () => {
      const monkey = monkeyRef.current;
      if (!monkey) return;
      
      const monkeyRect = monkey.getBoundingClientRect();
      
      // Check collision with each vehicle
      Object.entries(vehicleRefs.current).forEach(([key, vehicle]) => {
        if (!vehicle) return;
        
        const vehicleRect = vehicle.getBoundingClientRect();
        
        // More precise collision detection
        const laneWidth = window.innerWidth / columns;
        const monkeyLane = Math.floor(monkeyPosition);
        const vehicleLane = Math.floor(parseFloat(vehicle.style.left) / 100 * columns);
        
        // Check if the vehicle is in the same lane as the monkey
        if (monkeyLane === vehicleLane) {
          // Check if vehicle is in the safe zone (just above the monkey)
          const safeZoneTop = monkeyRect.top - 50; // 50px above monkey
          const safeZoneBottom = monkeyRect.top + 10; // Just below the monkey's head
          
          // If vehicle is in the safe zone and we're in the first 5 jumps
          if (jumpCount < 5 && vehicleRect.bottom > safeZoneTop && vehicleRect.top < safeZoneBottom) {
            // Stop the vehicle's animation
            vehicle.style.animationPlayState = 'paused';
            // Mark this lane as blocked
            blockedLanes.current.add(vehicleLane);
            return;
          }
          
          // Check for collision with monkey (only if not in safe zone)
          if (vehicleRect.bottom > monkeyRect.top && vehicleRect.top < monkeyRect.bottom) {
            const verticalOverlap = Math.min(monkeyRect.bottom, vehicleRect.bottom) - Math.max(monkeyRect.top, vehicleRect.top);
            
            // Check if the vehicle is coming from above
            const isVehicleAbove = vehicleRect.bottom < (monkeyRect.top + (monkeyRect.height * 0.7));
            
            // Only trigger bust if not in first 5 jumps and there's significant overlap
            if (jumpCount >= 5 && isVehicleAbove && verticalOverlap > monkeyRect.height * 0.4) {
              onBust();
            }
          }
        }
      });
      
      animationFrameRef.current = requestAnimationFrame(checkCollisions);
    };
    
    animationFrameRef.current = requestAnimationFrame(checkCollisions);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [status, onBust, jumpCount]);

  // Render all lane multipliers
  const renderLaneMultipliers = () => {
    if (status !== 'playing') return null;
    
    const laneWidth = 100 / columns;
    
    return Array.from({ length: columns }).map((_, index) => {
      // Skip the first lane (starting position)
      if (index === 0) return null;
      
      const isReached = index <= monkeyPosition;
      const isNext = index === monkeyPosition + 1;
      const laneMultiplier = calculateLaneMultiplier(index);
      
      if (isReached && !isNext) return null; // Don't show passed lanes except current
      
      const left = (index + 0.5) * laneWidth;
      
      return (
        <div 
          key={`lane-multiplier-${index}`}
          className="absolute z-20 text-center pointer-events-none"
          style={{
            left: `${left}%`,
            bottom: '0.2rem',
            transform: 'translateX(-50%)',
            textShadow: '0 0 10px rgba(255,255,255,0.8)',
            transition: 'all 0.3s ease-out',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.25rem',
            opacity: isNext ? 1 : 0.7
          }}
        >
          <div className={`${
            isNext 
              ? 'bg-green-500/90 border-white/30' 
              : 'bg-yellow-500/80 border-yellow-200/30'
          } text-white font-bold rounded-full w-10 h-10 flex items-center justify-center text-md shadow-lg border-2`}>
            {laneMultiplier.toFixed(2)}x
          </div>
          {isNext && (
            <div className="bg-black/70 text-green-300 font-bold text-xs px-2 py-1 rounded-full">
              
            </div>
          )}
        </div>
      );
    });
  };
  
  // Helper function to calculate multiplier for a specific lane
  const calculateLaneMultiplier = (laneIndex: number) => {
    const difficultyMultiplier = 1; // Adjust based on your game's difficulty settings
    const baseMultiplier = 1 + (laneIndex * 0.2 * difficultyMultiplier);
    return parseFloat(baseMultiplier.toFixed(2));
  };
  
  // Keep the original function but rename it to maintain compatibility
  const renderNextMultiplier = () => {
    if (status !== 'playing' || !nextMultiplier) return null;
    
    const nextLane = Math.min(monkeyPosition + 1, columns - 1);
    const laneWidth = 100 / columns;
    const left = (nextLane + 0.5) * laneWidth;
    
    return (
      <div 
        className="absolute z-20 text-center pointer-events-none"
        style={{
          left: `${left}%`,
          bottom: '0.2rem',
          transform: 'translateX(-50%)',
          textShadow: '0 0 10px rgba(255,255,255,0.8)',
          transition: 'all 0.3s ease-out',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.25rem'
        }}
      >
        <div className="bg-green-500/90 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center text-md shadow-lg border-2 border-white/30">
          {nextMultiplier.toFixed(2)}x
        </div>
        <div className="bg-black/70 text-green-300 font-bold text-xs px-2 py-1 rounded-full">
          NEXT
        </div>
      </div>
    );
  };

  // Render vehicles
  const renderVehicles = () => {
    const laneWidth = 100 / columns;
    
    return vehicles.map((data) => {
      // Calculate position slightly to the left of lane center (half the jump width)
      const laneCenter = (data.lane + 0.2) * laneWidth;
      
      return (
        <div
          key={data.key}
          ref={el => {
            if (el) {
              vehicleRefs.current[data.key] = el;
            } else {
              delete vehicleRefs.current[data.key];
            }
          }}
          className="vehicle text-5xl absolute z-20"
          style={{
            ...data.style,
            left: `${laneCenter}%`,
            transform: 'translateX(-50%)',
          }}
        >
          {data.char}
        </div>
      );
    });
  };
  
  return (
    <div className="w-full h-full bg-gradient-to-b from-gray-800 to-gray-900 flex flex-col items-center justify-center overflow-hidden relative">
      {/* Road surface with subtle texture - more optimized */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900 to-gray-800">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c0 2.76-2.24 5-5 5s-5-2.24-5-5 2.24-5 5-5 5 2.24 5 5zm-1-15c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23ffffff\' fill-opacity=\'0.05\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
          backgroundSize: '200px 200px',
          backgroundRepeat: 'repeat'
        }} />
      </div>

      {/* Multiplier Display - More compact and modern */}
      <div className="absolute top-3 left-3 bg-black/80 text-white px-3 py-2 rounded-lg z-10 font-headline border border-white/10 shadow-lg backdrop-blur-sm">
        <div className="text-xl font-bold tracking-tight">{multiplier.toFixed(2)}x</div>
      </div>

      <RoadAnimation />
      
      {/* Road with perspective */}
      <div className="absolute inset-0 perspective-1000">
        <div className="relative w-full h-full transform-style-preserve-3d">
          {/* Lane lines - Create proper road sections with spacing */}
          <div className="absolute inset-0">
            {Array.from({ length: columns + 1 }).map((_, i) => {
              // Evenly distribute lines across the full width
              const linePosition = (i / columns) * 100;
              return (
                <div 
                  key={`lane-line-${i}`}
                  className="h-full w-[1px] bg-white/40 absolute top-0 bottom-0"
                  style={{ 
                    left: `${linePosition}%`,
                    boxShadow: '0 0 8px 1px rgba(255,255,255,0.3)'
                  }}
                >
                  <div 
                    className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-transparent via-white to-transparent animate-[moveDown_1.5s_linear_infinite]"
                    style={{ 
                      animationDelay: `${i * 0.2}s`,
                      height: '60px',
                      width: '100%',
                    }} 
                  />
                </div>
              );
            })}
          </div>
          
          {/* Game elements container */}
          <div className="relative w-full h-full">
            {renderVehicles()}
            {renderLaneMultipliers()}
          </div>
        </div>
      </div>

      <div 
        ref={monkeyRef}
        className={cn(
          "absolute bottom-4 transition-all duration-200 z-30",
          status === 'busted' ? 'animate-ping scale-150' : 'hover:scale-110'
        )} 
        style={monkeyPositionStyle}
      >
        {/* Protection barrier (only visible and active for first 5 jumps) */}
        {status !== 'busted' && jumpCount < 5 && (
          <div 
            className="absolute -top-10 left-1/2 -translate-x-1/2 w-24 h-8 bg-yellow-400/80 rounded-full z-40 flex items-center justify-center border-2 border-yellow-600"
            style={{ 
              boxShadow: '0 0 25px 10px rgba(255, 255, 0, 0.6)',
              transform: 'translateX(-50%) translateY(-10px)'
            }}
          >
            <span className="text-sm font-bold text-yellow-900 drop-shadow-sm">SAFE ZONE</span>
          </div>
        )}
        <div className="text-6xl drop-shadow-lg relative z-30">
          {status === 'busted' ? '💥' : '🐒'}
        </div>
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
