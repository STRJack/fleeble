'use client';

import { useState, useCallback } from 'react';

const reactions = ['✨', '💜', '🎉', '😄', '🚀', '⚡'];

export default function MascotSVG() {
  const [clickCount, setClickCount] = useState(0);
  const [reaction, setReaction] = useState({ emoji: '✨', visible: false });

  const handleClick = useCallback(() => {
    const next = clickCount + 1;
    setClickCount(next);
    const emoji = reactions[next % reactions.length];

    setReaction({ emoji, visible: false });
    requestAnimationFrame(() => {
      setReaction({ emoji, visible: true });
      setTimeout(() => setReaction((r) => ({ ...r, visible: false })), 600);
    });
  }, [clickCount]);

  return (
    <div
      className="relative w-[260px] h-[260px] cursor-pointer max-md:w-[200px] max-md:h-[200px]"
      style={{ animation: 'mascot-float 3s ease-in-out infinite' }}
      onClick={handleClick}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1024 1024"
        role="img"
        aria-label="Fleeble mascot"
        className="w-full h-full transition-transform duration-300"
        style={{
          filter: 'drop-shadow(0 12px 40px rgba(var(--accent-rgb), 0.4))',
          transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as SVGSVGElement).style.transform = 'scale(1.08) rotate(-3deg)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as SVGSVGElement).style.transform = '';
        }}
      >
        <defs>
          <linearGradient id="body-grad" x1="0.2" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor="var(--body-grad-0, #a78bfa)" />
            <stop offset="40%" stopColor="var(--body-grad-1, #8b5cf6)" />
            <stop offset="100%" stopColor="var(--body-grad-2, #7c3aed)" />
          </linearGradient>
          <radialGradient id="glow" cx="0.5" cy="0.45" r="0.4">
            <stop offset="0%" stopColor="rgba(var(--accent-rgb),0.25)" />
            <stop offset="100%" stopColor="rgba(var(--accent-rgb),0)" />
          </radialGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="16" floodColor="var(--accent)" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* Glow */}
        <circle cx="512" cy="512" r="320" fill="url(#glow)" />

        {/* Antenna stem */}
        <rect x="499" y="215" width="26" height="110" rx="13" fill="var(--accent)" />

        {/* Antenna tip */}
        <circle cx="512" cy="205" r="38" fill="var(--accent-tip)">
          <animate attributeName="r" values="38;42;38" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="512" cy="205" r="38" fill="none" stroke="var(--accent-tip)" strokeWidth="4" opacity="0.4">
          <animate attributeName="r" values="42;55;42" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
        </circle>

        {/* Body */}
        <ellipse cx="512" cy="520" rx="230" ry="230" fill="url(#body-grad)" filter="url(#shadow)" />
        <ellipse cx="468" cy="455" rx="105" ry="62" fill="rgba(255,255,255,0.08)" transform="rotate(-20, 468, 455)" />

        {/* Left arm */}
        <ellipse cx="270" cy="560" rx="52" ry="58" fill="var(--accent-dark)" transform="rotate(15, 270, 560)" />

        {/* Right arm (wave) */}
        <g style={{ transformOrigin: '700px 520px', animation: 'wave 2.5s ease-in-out infinite' }}>
          <ellipse cx="754" cy="560" rx="52" ry="58" fill="var(--accent-dark)" transform="rotate(-15, 754, 560)" />
        </g>

        {/* Eyes (blink) */}
        <g style={{ transformOrigin: 'center', animation: 'blink 4s ease-in-out infinite' }}>
          <ellipse cx="428" cy="495" rx="58" ry="60" fill="#ffffff" />
          <circle cx="436" cy="500" r="32" fill="#1e1b4b" />
          <circle cx="447" cy="487" r="11" fill="rgba(255,255,255,0.8)" />
          <ellipse cx="596" cy="495" rx="58" ry="60" fill="#ffffff" />
          <circle cx="604" cy="500" r="32" fill="#1e1b4b" />
          <circle cx="615" cy="487" r="11" fill="rgba(255,255,255,0.8)" />
        </g>

        {/* Smile */}
        <path d="M 458 580 Q 512 622 566 580" stroke="#1e1b4b" strokeWidth="10" fill="none" strokeLinecap="round" />

        {/* Cheeks */}
        <ellipse cx="375" cy="565" rx="32" ry="19" fill="rgba(244,114,182,0.3)" />
        <ellipse cx="649" cy="565" rx="32" ry="19" fill="rgba(244,114,182,0.3)" />
      </svg>

      {/* Reaction bubble */}
      <span
        className="absolute -top-2.5 -right-5 text-3xl pointer-events-none transition-all duration-400"
        style={{
          transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
          opacity: reaction.visible ? 1 : 0,
          transform: reaction.visible ? 'translateY(-30px) scale(1.3)' : 'translateY(0) scale(0.5)',
        }}
      >
        {reaction.emoji}
      </span>
    </div>
  );
}
