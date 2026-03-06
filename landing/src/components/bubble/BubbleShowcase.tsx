'use client';

import { useBubbleCycle } from '@/hooks/useBubbleCycle';
import BubbleCard from './BubbleCard';
import MascotMini from '@/components/mascot/MascotMini';

export default function BubbleShowcase() {
  const { scenario, isVisible, index } = useBubbleCycle(4000);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-start" style={{ gap: '14px' }}>
        <div className="shrink-0" style={{ marginTop: '10px' }}>
          <MascotMini />
        </div>
        <BubbleCard scenario={scenario} isVisible={isVisible} />
      </div>
      {/* Dots indicator */}
      <div className="flex" style={{ gap: '8px' }}>
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: '8px',
              height: '8px',
              background: i === index ? 'var(--accent)' : 'rgba(var(--accent-rgb), 0.2)',
              transform: i === index ? 'scale(1.3)' : 'scale(1)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
