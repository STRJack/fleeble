'use client';

import { useState, useEffect } from 'react';

const COUNT = 18;

interface Particle {
  id: number;
  size: number;
  left: number;
  duration: number;
  delay: number;
}

export default function Particles() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: COUNT }, (_, i) => ({
        id: i,
        size: Math.random() * 4 + 2,
        left: Math.random() * 100,
        duration: Math.random() * 8 + 6,
        delay: Math.random() * 10,
      }))
    );
  }, []);

  if (particles.length === 0) return <div className="fixed inset-0 pointer-events-none z-0" />;

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full opacity-0"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: `${p.left}%`,
            bottom: '-10px',
            background: 'var(--accent)',
            animation: `particle-float ${p.duration}s linear infinite`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
