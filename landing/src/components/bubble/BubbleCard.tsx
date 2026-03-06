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
      className="relative rounded-2xl p-6 overflow-hidden transition-all duration-350"
      style={{
        background: 'var(--card-bg)',
        border: '1px solid rgba(var(--accent-rgb), 0.25)',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateX(0) scale(1)' : 'translateX(16px) scale(0.95)',
        transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        maxWidth: '520px',
        width: '100%',
      }}
    >
      <BubbleHeader source={scenario.source} type={scenario.type} project={scenario.project} />
      <BubbleMessage message={scenario.message} />
      {hasOptions && <BubbleOptions options={scenario.options!} />}
      <BubbleDismiss hasOptions={hasOptions} />
      {!hasOptions && <BubbleTimerBar />}
    </div>
  );
}
