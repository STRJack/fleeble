const themeCards = [
  { name: 'Violet', bg: '#12111a', accent: '#8b5cf6', light: '#a78bfa', active: true },
  { name: 'Emerald', bg: '#0a1a14', accent: '#10b981', light: '#6ee7b7', active: false },
  { name: 'Ocean', bg: '#0a0f1a', accent: '#0ea5e9', light: '#7dd3fc', active: false },
  { name: 'Rose', bg: '#1a0a0f', accent: '#f43f5e', light: '#fda4af', active: false },
  { name: 'Amber', bg: '#1a150a', accent: '#f59e0b', light: '#fcd34d', active: false },
];

export default function TrayMenuThemes() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
      {themeCards.map((t) => (
        <div
          key={t.name}
          className="cursor-pointer overflow-hidden transition-all duration-200"
          style={{
            borderRadius: '10px',
            border: t.active ? `2px solid ${t.accent}` : '2px solid rgba(255,255,255,0.06)',
            boxShadow: t.active ? `0 0 12px ${t.accent}4d` : 'none',
          }}
        >
          <div
            className="flex items-center"
            style={{ height: '52px', padding: '8px 10px', gap: '8px', background: t.bg }}
          >
            <div
              className="shrink-0 rounded-full"
              style={{ width: '20px', height: '20px', background: t.accent }}
            />
            <div className="flex-1 flex flex-col" style={{ gap: '4px' }}>
              <div style={{ height: '3px', width: '80%', borderRadius: '2px', background: t.light, opacity: 0.6 }} />
              <div style={{ height: '3px', width: '55%', borderRadius: '2px', background: t.light, opacity: 0.6 }} />
            </div>
          </div>
          <div
            className="text-center font-semibold"
            style={{
              padding: '6px 10px',
              fontSize: '11px',
              background: 'rgba(0,0,0,0.2)',
              color: t.active ? t.accent : '#a09cb0',
            }}
          >
            {t.name}{t.active ? ' \u2713' : ''}
          </div>
        </div>
      ))}
    </div>
  );
}
