const sampleItems = [
  {
    category: 'url',
    catColor: '#60a5fa',
    catBg: 'rgba(59, 130, 246, 0.12)',
    preview: 'https://github.com/STRJack/fleeble',
    time: '12s',
  },
  {
    category: 'code',
    catColor: '#22c55e',
    catBg: 'rgba(34, 197, 94, 0.12)',
    preview: 'const app = require("electron");',
    time: '3m',
  },
  {
    category: 'text',
    catColor: 'var(--accent, #8b5cf6)',
    catBg: 'rgba(var(--accent-rgb, 139, 92, 246), 0.12)',
    preview: 'Refactor the notification handler to support async callbacks',
    time: '8m',
  },
];

export default function TrayMenuClipboard() {
  return (
    <div className="flex flex-col" style={{ gap: '8px' }}>
      <div className="flex flex-col" style={{ gap: '4px', minHeight: '80px' }}>
        {sampleItems.map((item, i) => (
          <div
            key={i}
            className="flex items-center transition-all duration-150"
            style={{
              gap: '8px',
              padding: '8px 10px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
              cursor: 'pointer',
            }}
          >
            <span
              className="font-bold uppercase"
              style={{
                fontSize: '8px',
                letterSpacing: '0.5px',
                padding: '2px 5px',
                borderRadius: '4px',
                background: item.catBg,
                color: item.catColor,
                flexShrink: 0,
              }}
            >
              {item.category}
            </span>
            <span
              style={{
                flex: 1,
                fontSize: '11px',
                color: '#a09cb0',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontFamily: "'SF Mono', 'Menlo', monospace",
                lineHeight: 1.4,
              }}
            >
              {item.preview}
            </span>
            <span
              style={{
                fontSize: '9px',
                color: '#5e596e',
                flexShrink: 0,
                fontFamily: "'SF Mono', 'Menlo', monospace",
              }}
            >
              {item.time}
            </span>
          </div>
        ))}
      </div>

      {/* Open full clipboard button */}
      <button
        className="flex items-center justify-center cursor-pointer transition-all duration-150"
        style={{
          gap: '6px',
          padding: '8px',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(255,255,255,0.04)',
          color: '#a09cb0',
          fontSize: '11px',
          fontWeight: 600,
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
        Open full clipboard
        <span
          style={{
            fontSize: '9px',
            padding: '2px 6px',
            borderRadius: '4px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
            color: '#5e596e',
            fontFamily: "'SF Mono', 'Menlo', monospace",
          }}
        >
          Cmd+Shift+V
        </span>
      </button>
    </div>
  );
}
