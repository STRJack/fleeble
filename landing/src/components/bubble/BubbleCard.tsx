'use client';

import { BubbleScenario } from '@/types';
import BubbleHeader from './BubbleHeader';
import BubbleMessage from './BubbleMessage';
import BubbleOptions from './BubbleOptions';
import BubbleDismiss from './BubbleDismiss';
import BubbleTimerBar from './BubbleTimerBar';

interface Props {
  scenario: BubbleScenario;
  isVisible: boolean;
}

export default function BubbleCard({ scenario, isVisible }: Props) {
  const hasOptions = !!scenario.options?.length;

  return (
    <div
      className="relative overflow-hidden transition-all duration-350"
      style={{
        background: 'var(--card-bg)',
        borderRadius: '12px',
        padding: '12px 14px',
        border: '1px solid rgba(var(--accent-rgb), 0.25)',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateX(0) scale(1)' : 'translateX(16px) scale(0.95)',
        transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        maxWidth: '360px',
        width: '100%',
      }}
    >
      <BubbleHeader source={scenario.source} type={scenario.type} project={scenario.project} />
      <BubbleMessage message={scenario.message} />
      {hasOptions && <BubbleOptions options={scenario.options!} />}
      <BubbleDismiss hasOptions={hasOptions} />
      {/* Terminal button */}
      <button
        className="flex items-center gap-1 mt-1.5 border-none bg-transparent cursor-pointer transition-colors duration-150"
        style={{
          padding: 0,
          color: 'rgba(var(--card-text-rgb), 0.35)',
          fontSize: '9px',
          fontWeight: 500,
          fontFamily: 'inherit',
        }}
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <polyline points="4 17 10 11 4 5" />
          <line x1="12" y1="19" x2="20" y2="19" />
        </svg>
        Open in terminal
      </button>
      {!hasOptions && <BubbleTimerBar />}
    </div>
  );
}
