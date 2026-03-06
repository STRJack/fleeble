'use client';

type TabName = 'activity' | 'themes' | 'config';

interface Props {
  activeTab: TabName;
  onTabChange: (tab: TabName) => void;
}

const tabs: { name: TabName; label: string; icon: React.ReactNode }[] = [
  {
    name: 'activity',
    label: 'Activity',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    name: 'themes',
    label: 'Themes',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <circle cx="12" cy="12" r="5" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    ),
  },
  {
    name: 'config',
    label: 'Config',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

export default function TrayMenuTabs({ activeTab, onTabChange }: Props) {
  const activeIdx = tabs.findIndex((t) => t.name === activeTab);

  return (
    <div className="px-5 pt-3">
      <div
        className="flex relative p-1 rounded-xl"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.name}
            className="flex-1 py-2 border-none bg-transparent text-sm font-semibold cursor-pointer flex items-center justify-center gap-1.5 z-[1] rounded-lg transition-colors duration-200"
            style={{ color: activeTab === tab.name ? '#f1f0f5' : '#5e596e' }}
            onClick={() => onTabChange(tab.name)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
        {/* Sliding indicator */}
        <div
          className="absolute top-1 left-1 h-[calc(100%-8px)] rounded-lg transition-transform duration-250"
          style={{
            width: 'calc(33.333% - 2.67px)',
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            transform: `translateX(${activeIdx * 100}%)`,
            transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </div>
    </div>
  );
}
