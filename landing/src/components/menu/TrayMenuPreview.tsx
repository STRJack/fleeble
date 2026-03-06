'use client';

import { useState } from 'react';
import TrayMenuHeader from './TrayMenuHeader';
import TrayMenuTabs from './TrayMenuTabs';
import TrayMenuActivity from './TrayMenuActivity';
import TrayMenuThemes from './TrayMenuThemes';
import TrayMenuConfig from './TrayMenuConfig';

type TabName = 'activity' | 'themes' | 'config';

export default function TrayMenuPreview() {
  const [activeTab, setActiveTab] = useState<TabName>('activity');

  return (
    <div className="w-full max-w-[480px]">
      {/* Arrow */}
      <div className="w-6 h-3 mx-auto relative">
        <div
          className="absolute top-1 left-1/2 -translate-x-1/2 rotate-45 w-4 h-4 rounded-tl-[3px]"
          style={{
            background: '#12111a',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            borderLeft: '1px solid rgba(255,255,255,0.06)',
          }}
        />
      </div>
      {/* Popover */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: '#12111a',
          border: '1px solid rgba(255,255,255,0.06)',
          animation: 'pop-in 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <TrayMenuHeader />
        <TrayMenuTabs activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="p-4 px-5 max-h-[440px] overflow-y-auto">
          {activeTab === 'activity' && <TrayMenuActivity />}
          {activeTab === 'themes' && <TrayMenuThemes />}
          {activeTab === 'config' && <TrayMenuConfig />}
        </div>
        {/* Footer */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{
            borderTop: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(0,0,0,0.15)',
          }}
        >
          <span className="text-xs" style={{ color: '#5e596e', fontFamily: "'SF Mono', 'Menlo', monospace" }}>
            Fleeble v1.0.0
          </span>
        </div>
      </div>
    </div>
  );
}
