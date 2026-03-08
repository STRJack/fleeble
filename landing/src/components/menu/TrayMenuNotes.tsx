const sampleNotes = [
  {
    title: 'API Refactor Plan',
    preview: 'Move all endpoint handlers to a dedicated routes/ directory and add validation middleware...',
    date: 'Mar 7, 2026',
  },
  {
    title: 'Meeting Notes',
    preview: 'Discussed Q2 roadmap — priorities: clipboard sync, mobile companion, plugin system...',
    date: 'Mar 5, 2026',
  },
];

export default function TrayMenuNotes() {
  return (
    <div>
      {/* Header row */}
      <div className="flex" style={{ gap: '6px', marginBottom: '10px' }}>
        <div
          className="flex-1"
          style={{
            padding: '7px 10px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(255,255,255,0.04)',
            color: '#5e596e',
            fontSize: '12px',
          }}
        >
          Search notes...
        </div>
        <button
          className="flex items-center cursor-pointer"
          style={{
            gap: '4px',
            padding: '7px 12px',
            borderRadius: '8px',
            border: '1px solid rgba(var(--accent-rgb, 139, 92, 246), 0.4)',
            background: 'rgba(var(--accent-rgb, 139, 92, 246), 0.15)',
            color: 'var(--accent, #8b5cf6)',
            fontSize: '11px',
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New note
        </button>
      </div>

      {/* Notes list */}
      <div className="flex flex-col" style={{ gap: '4px' }}>
        {sampleNotes.map((note, i) => (
          <div
            key={i}
            className="transition-all duration-150"
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#f1f0f5',
                marginBottom: '3px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {note.title}
            </div>
            <div
              style={{
                fontSize: '11px',
                color: '#5e596e',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {note.preview}
            </div>
            <div
              style={{
                fontSize: '9px',
                color: '#5e596e',
                marginTop: '4px',
                fontFamily: "'SF Mono', 'Menlo', monospace",
              }}
            >
              {note.date}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
