'use client';

import { useState, useEffect } from 'react';

const COUNT = 8;

interface BgFleeble {
  id: number;
  x: number;
  y: number;
  scale: number;
  opacity: number;
  duration: number;
  delay: number;
  rotation: number;
}

function FleebleSilhouette({ scale, opacity, rotation }: { scale: number; opacity: number; rotation: number }) {
  return (
    <div style={{ transform: `scale(${scale}) rotate(${rotation}deg)`, opacity }}>
      <div className="relative" style={{ width: '40px', height: '48px' }}>
        {/* Antenna */}
        <div
          className="absolute rounded"
          style={{
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '2px',
            height: '10px',
            background: 'var(--accent)',
          }}
        >
          <div
            className="absolute rounded-full"
            style={{
              top: '-4px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '7px',
              height: '7px',
              background: 'var(--accent-tip)',
            }}
          />
        </div>
        {/* Body */}
        <div
          className="absolute rounded-full"
          style={{
            top: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '32px',
            height: '32px',
            background: 'linear-gradient(165deg, var(--accent-light) 0%, var(--accent) 40%, var(--accent-dark) 100%)',
          }}
        >
          {/* Left eye */}
          <div
            className="absolute bg-white rounded-full overflow-hidden"
            style={{ top: '9px', left: '6px', width: '8px', height: '8px' }}
          >
            <div
              className="absolute rounded-full"
              style={{
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -45%)',
                width: '4.5px',
                height: '4.5px',
                background: '#1e1b4b',
                animation: 'look 5s ease-in-out infinite',
              }}
            />
          </div>
          {/* Right eye */}
          <div
            className="absolute bg-white rounded-full overflow-hidden"
            style={{ top: '9px', right: '6px', width: '8px', height: '8px' }}
          >
            <div
              className="absolute rounded-full"
              style={{
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -45%)',
                width: '4.5px',
                height: '4.5px',
                background: '#1e1b4b',
                animation: 'look 5s ease-in-out infinite',
              }}
            />
          </div>
        </div>
        {/* Arms */}
        <div
          className="absolute rounded-full"
          style={{ top: '28px', left: '1px', width: '7px', height: '8px', background: 'var(--accent-dark)', transform: 'rotate(15deg)' }}
        />
        <div
          className="absolute rounded-full"
          style={{ top: '28px', right: '1px', width: '7px', height: '8px', background: 'var(--accent-dark)', transform: 'rotate(-15deg)' }}
        />
      </div>
    </div>
  );
}

export default function BackgroundFleebles() {
  const [fleebles, setFleebles] = useState<BgFleeble[]>([]);

  useEffect(() => {
    setFleebles(
      Array.from({ length: COUNT }, (_, i) => ({
        id: i,
        x: 5 + Math.random() * 90,
        y: 8 + Math.random() * 84,
        scale: 0.6 + Math.random() * 0.8,
        opacity: 0.04 + Math.random() * 0.06,
        duration: 10 + Math.random() * 12,
        delay: Math.random() * 8,
        rotation: -15 + Math.random() * 30,
      }))
    );
  }, []);

  if (fleebles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {fleebles.map((f) => (
        <div
          key={f.id}
          className="absolute"
          style={{
            left: `${f.x}%`,
            top: `${f.y}%`,
            animation: `bg-fleeble-drift ${f.duration}s ease-in-out infinite`,
            animationDelay: `${f.delay}s`,
          }}
        >
          <FleebleSilhouette scale={f.scale} opacity={f.opacity} rotation={f.rotation} />
        </div>
      ))}
    </div>
  );
}
