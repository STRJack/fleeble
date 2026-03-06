'use client';

import { useBubbleCycle } from '@/hooks/useBubbleCycle';
import BubbleCard from './BubbleCard';

export default function BubbleShowcase() {
  const { scenario, isVisible, index } = useBubbleCycle(4000);

  return (
    <div className="flex flex-col items-center gap-8">
      <BubbleCard scenario={scenario} isVisible={isVisible} />
      {/* Dots indicator */}
      <div className="flex gap-2.5">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="w-2.5 h-2.5 rounded-full transition-all duration-300"
            style={{
              background: i === index ? 'var(--accent)' : 'rgba(var(--accent-rgb), 0.2)',
              transform: i === index ? 'scale(1.3)' : 'scale(1)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
