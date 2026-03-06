const themeCards = [
  { name: 'Violet', bg: '#12111a', accent: '#8b5cf6', light: '#a78bfa', active: true },
  { name: 'Emerald', bg: '#0a1a14', accent: '#10b981', light: '#6ee7b7', active: false },
  { name: 'Ocean', bg: '#0a0f1a', accent: '#0ea5e9', light: '#7dd3fc', active: false },
  { name: 'Rose', bg: '#1a0a0f', accent: '#f43f5e', light: '#fda4af', active: false },
  { name: 'Amber', bg: '#1a150a', accent: '#f59e0b', light: '#fcd34d', active: false },
];

export default function TrayMenuThemes() {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {themeCards.map((t) => (
        <div
          key={t.name}
          className="rounded-xl overflow-hidden cursor-pointer transition-all duration-200"
          style={{
            border: t.active ? `2px solid ${t.accent}` : '2px solid rgba(255,255,255,0.06)',
            boxShadow: t.active ? `0 0 12px ${t.accent}4d` : 'none',
          }}
        >
          <div
            className="h-16 p-3 px-3.5 flex items-center gap-2.5"
            style={{ background: t.bg }}
          >
            <div className="w-7 h-7 rounded-full shrink-0" style={{ background: t.accent }} />
            <div className="flex-1 flex flex-col gap-1.5">
              <div className="h-1 w-[80%] rounded-sm" style={{ background: t.light, opacity: 0.6 }} />
              <div className="h-1 w-[55%] rounded-sm" style={{ background: t.light, opacity: 0.6 }} />
            </div>
          </div>
          <div
            className="py-2 px-3 text-sm font-semibold text-center"
            style={{
              background: 'rgba(0,0,0,0.2)',
              color: t.active ? t.accent : '#a09cb0',
            }}
          >
            {t.name}{t.active ? ' ✓' : ''}
          </div>
        </div>
      ))}
    </div>
  );
}
