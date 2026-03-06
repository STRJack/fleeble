interface Props {
  hasOptions: boolean;
}

export default function BubbleDismiss({ hasOptions }: Props) {
  if (hasOptions) {
    return (
      <button
        className="w-full flex items-center justify-center cursor-pointer transition-all duration-150"
        style={{
          marginTop: '10px',
          padding: '7px 12px',
          borderRadius: '8px',
          background: 'transparent',
          border: '1.5px solid rgba(var(--accent-rgb), 0.2)',
          color: 'rgba(var(--card-text-rgb), 0.6)',
          fontSize: '11px',
          fontWeight: 500,
          gap: '5px',
          letterSpacing: '0.3px',
          fontFamily: 'inherit',
        }}
      >
        <span>Dismiss</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    );
  }

  return (
    <button
      className="w-full flex items-center justify-center cursor-pointer transition-all duration-200"
      style={{
        marginTop: '10px',
        padding: '7px 12px',
        borderRadius: '8px',
        background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
        color: 'white',
        border: 'none',
        fontSize: '11px',
        fontWeight: 600,
        gap: '5px',
        letterSpacing: '0.3px',
        fontFamily: 'inherit',
      }}
    >
      <span>Got it</span>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M5 13l4 4L19 7" />
      </svg>
    </button>
  );
}
