const sampleNotifs = [
  { source: 'Claude Code', type: 'action', typeColor: '#f59e0b', msg: 'Creating 3 new files in src/', time: '2s ago' },
  { source: 'Cursor', type: 'info', typeColor: '#60a5fa', msg: 'Refactoring complete. 5 files updated.', time: '45s ago' },
  { source: 'Claude Code', type: 'error', typeColor: '#ef4444', msg: 'Build failed: missing dependency', time: '2m ago' },
];

export default function TrayMenuActivity() {
  return (
    <div className="flex flex-col gap-2 min-h-[100px]">
      {sampleNotifs.map((n, i) => (
        <div
          key={i}
          className="p-3.5 rounded-xl transition-all duration-150"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-[11px] font-bold uppercase tracking-wider py-[3px] px-2 rounded-md"
              style={{ background: 'rgba(var(--accent-rgb), 0.15)', color: 'var(--accent)' }}
            >
              {n.source}
            </span>
            <span
              className="text-[11px] font-semibold uppercase tracking-wide py-[3px] px-2 rounded-md"
              style={{ background: `${n.typeColor}1f`, color: n.typeColor }}
            >
              {n.type}
            </span>
            <span className="text-xs ml-auto" style={{ color: '#5e596e', fontFamily: "'SF Mono', monospace" }}>
              {n.time}
            </span>
          </div>
          <div className="text-sm leading-relaxed" style={{ color: '#a09cb0' }}>
            {n.msg}
          </div>
        </div>
      ))}
    </div>
  );
}
