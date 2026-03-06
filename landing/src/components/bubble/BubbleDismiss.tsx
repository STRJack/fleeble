interface Props {
  hasOptions: boolean;
}

export default function BubbleDismiss({ hasOptions }: Props) {
  if (hasOptions) {
    return (
      <button
        className="mt-4 w-full py-2.5 px-4 rounded-lg text-sm font-medium cursor-pointer flex items-center justify-center gap-1.5 tracking-wide transition-all duration-150"
        style={{
          background: 'transparent',
          border: '1.5px solid rgba(var(--accent-rgb), 0.2)',
          color: 'rgba(var(--card-text-rgb), 0.6)',
          fontFamily: 'inherit',
        }}
      >
        <span>Dismiss</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    );
  }

  return (
    <button
      className="mt-4 w-full py-2.5 px-4 rounded-lg text-white text-sm font-semibold cursor-pointer flex items-center justify-center gap-1.5 tracking-wide transition-all duration-200 border-none"
      style={{
        background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
        fontFamily: 'inherit',
      }}
    >
      <span>Got it</span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M5 13l4 4L19 7" />
      </svg>
    </button>
  );
}
