const sampleNotifs = [
  { source: 'Claude Code', type: 'action', typeColor: '#f59e0b', typeBg: 'rgba(245, 158, 11, 0.12)', msg: 'Creating 3 new files in src/', time: '2s' },
  { source: 'Cursor', type: 'info', typeColor: '#60a5fa', typeBg: 'rgba(59, 130, 246, 0.12)', msg: 'Refactoring complete. 5 files updated.', time: '45s' },
  { source: 'Claude Code', type: 'error', typeColor: '#ef4444', typeBg: 'rgba(239, 68, 68, 0.12)', msg: 'Build failed: missing dependency', time: '2m' },
];

export default function TrayMenuActivity() {
  return (
    <div className="flex flex-col" style={{ gap: '6px', minHeight: '80px' }}>
      {sampleNotifs.map((n, i) => (
        <div
          key={i}
          className="transition-all duration-150"
          style={{
            padding: '10px 12px',
            borderRadius: '10px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="flex items-center" style={{ gap: '6px', marginBottom: '6px' }}>
            <span
              className="font-bold uppercase"
              style={{
                fontSize: '10px',
                letterSpacing: '0.6px',
                padding: '2px 7px',
                borderRadius: '5px',
                background: 'rgba(var(--accent-rgb), 0.15)',
                color: 'var(--accent)',
              }}
            >
              {n.source}
            </span>
            <span
              className="font-semibold uppercase"
              style={{
                fontSize: '9px',
                letterSpacing: '0.5px',
                padding: '2px 6px',
                borderRadius: '5px',
                background: n.typeBg,
                color: n.typeColor,
              }}
            >
              {n.type}
            </span>
            <span className="ml-auto" style={{ fontSize: '10px', color: '#5e596e', fontFamily: "'SF Mono', 'Menlo', monospace" }}>
              {n.time}
            </span>
          </div>
          <div style={{ fontSize: '12px', lineHeight: 1.5, color: '#a09cb0' }}>
            {n.msg}
          </div>
        </div>
      ))}
      {/* Clear all button */}
      <button
        className="w-full flex items-center justify-center cursor-pointer transition-all duration-150"
        style={{
          padding: '8px',
          marginTop: '8px',
          border: '1px solid rgba(239, 68, 68, 0.12)',
          background: 'rgba(239, 68, 68, 0.06)',
          color: '#ef4444',
          fontSize: '11px',
          fontWeight: 600,
          borderRadius: '8px',
          gap: '6px',
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
        Clear all
      </button>
    </div>
  );
}
