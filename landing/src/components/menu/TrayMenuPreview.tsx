'use client';

import { useState } from 'react';
import TrayMenuHeader from './TrayMenuHeader';
import TrayMenuTabs from './TrayMenuTabs';
import TrayMenuActivity from './TrayMenuActivity';
import TrayMenuClipboard from './TrayMenuClipboard';
import TrayMenuTimers from './TrayMenuTimers';
import TrayMenuNotes from './TrayMenuNotes';
import TrayMenuThemes from './TrayMenuThemes';
import TrayMenuConfig from './TrayMenuConfig';

type TabName = 'activity' | 'clipboard' | 'timers' | 'notes' | 'themes' | 'config';

export default function TrayMenuPreview() {
  const [activeTab, setActiveTab] = useState<TabName>('activity');

  return (
    <div className="w-full" style={{ maxWidth: '340px' }}>
      {/* Arrow */}
      <div className="relative mx-auto" style={{ width: '20px', height: '10px' }}>
        <div
          className="absolute"
          style={{
            top: '4px',
            left: '50%',
            transform: 'translateX(-50%) rotate(45deg)',
            width: '14px',
            height: '14px',
            background: '#12111a',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            borderLeft: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '3px 0 0 0',
          }}
        />
      </div>
      {/* Popover */}
      <div
        className="overflow-hidden"
        style={{
          background: '#12111a',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '16px',
          animation: 'pop-in 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <TrayMenuHeader />
        <TrayMenuTabs activeTab={activeTab} onTabChange={setActiveTab} />
        <div style={{ padding: '12px 16px', maxHeight: '320px', overflowY: 'auto' }}>
          {activeTab === 'activity' && <TrayMenuActivity />}
          {activeTab === 'clipboard' && <TrayMenuClipboard />}
          {activeTab === 'timers' && <TrayMenuTimers />}
          {activeTab === 'notes' && <TrayMenuNotes />}
          {activeTab === 'themes' && <TrayMenuThemes />}
          {activeTab === 'config' && <TrayMenuConfig />}
        </div>
        {/* Footer */}
        <div
          className="flex items-center justify-between"
          style={{
            padding: '10px 16px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(0,0,0,0.15)',
          }}
        >
          <div className="flex items-center" style={{ gap: '6px', fontSize: '10px', color: '#5e596e', fontFamily: "'SF Mono', 'Menlo', monospace" }}>
            <span>Fleeble</span>
            <span style={{ opacity: 0.4 }}>|</span>
            <span>v1.2.0</span>
          </div>
          <button
            className="flex items-center cursor-pointer font-semibold border-none bg-transparent transition-all duration-150"
            style={{
              fontSize: '11px',
              color: '#5e596e',
              padding: '4px 8px',
              borderRadius: '6px',
              gap: '5px',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
              <line x1="12" y1="2" x2="12" y2="12" />
            </svg>
            Quit
          </button>
        </div>
      </div>
    </div>
  );
}
