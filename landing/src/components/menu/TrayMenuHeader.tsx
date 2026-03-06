import MascotMini from '@/components/mascot/MascotMini';

export default function TrayMenuHeader() {
  return (
    <div
      className="flex items-center"
      style={{
        gap: '12px',
        padding: '16px 16px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'linear-gradient(180deg, rgba(var(--accent-rgb), 0.06) 0%, transparent 100%)',
      }}
    >
      <MascotMini />
      <div className="flex-1 min-w-0">
        <div
          className="font-bold"
          style={{
            fontSize: '15px',
            letterSpacing: '-0.3px',
            background: 'linear-gradient(135deg, #e2dff0, var(--accent-tip))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Fleeble
        </div>
        <div className="flex items-center" style={{ gap: '6px', marginTop: '3px' }}>
          <span
            className="rounded-full"
            style={{
              width: '6px',
              height: '6px',
              background: '#22c55e',
              boxShadow: '0 0 6px rgba(34, 197, 94, 0.5)',
              animation: 'pulse-dot 2s ease-in-out infinite',
            }}
          />
          <span style={{ fontSize: '11px', color: '#5e596e', fontFamily: "'SF Mono', 'Menlo', monospace", letterSpacing: '-0.2px' }}>
            Ready
          </span>
        </div>
      </div>
      {/* Action buttons */}
      <div className="flex" style={{ gap: '4px' }}>
        <button
          className="flex items-center justify-center cursor-pointer transition-all duration-150"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(255,255,255,0.04)',
            color: '#a09cb0',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>
        <button
          className="flex items-center justify-center cursor-pointer transition-all duration-150"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(255,255,255,0.04)',
            color: '#a09cb0',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </svg>
        </button>
      </div>
    </div>
  );
}
