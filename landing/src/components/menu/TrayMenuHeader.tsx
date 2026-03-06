import MascotMini from '@/components/mascot/MascotMini';

export default function TrayMenuHeader() {
  return (
    <div
      className="flex items-center gap-3.5 px-5 pt-5 pb-4"
      style={{
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'linear-gradient(180deg, rgba(var(--accent-rgb), 0.06) 0%, transparent 100%)',
      }}
    >
      <MascotMini />
      <div className="flex-1 min-w-0">
        <div
          className="text-xl font-bold"
          style={{
            letterSpacing: '-0.3px',
            background: 'linear-gradient(135deg, #e2dff0, var(--accent-tip))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Fleeble
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span
            className="w-2 h-2 rounded-full"
            style={{
              background: '#22c55e',
              boxShadow: '0 0 6px rgba(34, 197, 94, 0.5)',
              animation: 'pulse-dot 2s ease-in-out infinite',
            }}
          />
          <span className="text-sm" style={{ color: '#5e596e', fontFamily: "'SF Mono', 'Menlo', monospace", letterSpacing: '-0.2px' }}>
            Ready
          </span>
        </div>
      </div>
    </div>
  );
}
