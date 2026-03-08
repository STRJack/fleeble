'use client';

import { useState } from 'react';

type SubTab = 'reminders' | 'pomodoro';

export default function TrayMenuTimers() {
  const [subTab, setSubTab] = useState<SubTab>('reminders');

  return (
    <div>
      {/* Sub-tabs */}
      <div className="flex" style={{ gap: '4px', marginBottom: '12px' }}>
        {(['reminders', 'pomodoro'] as const).map((tab) => (
          <button
            key={tab}
            className="flex-1 cursor-pointer transition-all duration-150"
            style={{
              padding: '6px 0',
              border: `1px solid ${subTab === tab ? 'rgba(var(--accent-rgb, 139, 92, 246), 0.4)' : 'rgba(255,255,255,0.06)'}`,
              background: subTab === tab ? 'rgba(var(--accent-rgb, 139, 92, 246), 0.15)' : 'rgba(255,255,255,0.04)',
              color: subTab === tab ? 'var(--accent, #8b5cf6)' : '#5e596e',
              fontSize: '11px',
              fontWeight: 600,
              borderRadius: '7px',
            }}
            onClick={() => setSubTab(tab)}
          >
            {tab === 'reminders' ? 'Reminders' : 'Pomodoro'}
          </button>
        ))}
      </div>

      {subTab === 'reminders' && <RemindersPanel />}
      {subTab === 'pomodoro' && <PomodoroPanel />}
    </div>
  );
}

function RemindersPanel() {
  return (
    <div>
      {/* Input row */}
      <div style={{ marginBottom: '10px' }}>
        <div
          style={{
            width: '100%',
            padding: '8px 10px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(255,255,255,0.04)',
            color: '#5e596e',
            fontSize: '12px',
            marginBottom: '6px',
          }}
        >
          Remind me to...
        </div>
        <div className="flex" style={{ gap: '4px' }}>
          {['5m', '15m', '30m', '1h'].map((label, i) => (
            <div
              key={label}
              className="flex-1"
              style={{
                padding: '5px 0',
                textAlign: 'center',
                border: `1px solid ${i === 2 ? 'rgba(var(--accent-rgb, 139, 92, 246), 0.4)' : 'rgba(255,255,255,0.06)'}`,
                background: i === 2 ? 'rgba(var(--accent-rgb, 139, 92, 246), 0.15)' : 'rgba(255,255,255,0.04)',
                color: i === 2 ? 'var(--accent, #8b5cf6)' : '#5e596e',
                fontSize: '11px',
                fontWeight: 600,
                borderRadius: '6px',
                fontFamily: "'SF Mono', 'Menlo', monospace",
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Sample active reminder */}
      <div
        className="flex items-center"
        style={{
          gap: '8px',
          padding: '8px 10px',
          borderRadius: '8px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <span
          style={{
            flex: 1,
            fontSize: '12px',
            color: '#a09cb0',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          Review PR #42
        </span>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--accent, #8b5cf6)',
            fontFamily: "'SF Mono', 'Menlo', monospace",
            flexShrink: 0,
          }}
        >
          12:34
        </span>
        <div
          style={{
            width: '22px',
            height: '22px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#5e596e',
            flexShrink: 0,
          }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function PomodoroPanel() {
  const circumference = 2 * Math.PI * 52;

  return (
    <div>
      {/* Ring */}
      <div
        className="flex justify-center items-center relative"
        style={{ width: '140px', height: '140px', margin: '8px auto 12px' }}
      >
        <svg width="140" height="140" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" fill="none" strokeWidth="6" stroke="rgba(255,255,255,0.07)" />
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            strokeWidth="6"
            strokeLinecap="round"
            stroke="var(--accent, #8b5cf6)"
            strokeDasharray={circumference}
            strokeDashoffset="0"
            transform="rotate(-90 60 60)"
          />
        </svg>
        <div
          className="absolute"
          style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}
        >
          <div
            style={{
              fontSize: '28px',
              fontWeight: 700,
              fontFamily: "'SF Mono', 'Menlo', monospace",
              color: '#f1f0f5',
              letterSpacing: '-1px',
            }}
          >
            25:00
          </div>
          <div
            style={{
              fontSize: '10px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              color: 'var(--accent, #8b5cf6)',
              marginTop: '2px',
            }}
          >
            Ready
          </div>
        </div>
      </div>

      {/* Cycle dots */}
      <div className="flex justify-center" style={{ gap: '8px', marginBottom: '12px' }}>
        {[false, false, false, false].map((_, i) => (
          <div
            key={i}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="flex justify-center" style={{ gap: '6px' }}>
        <button
          style={{
            padding: '7px 16px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(255,255,255,0.04)',
            color: '#a09cb0',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Reset
        </button>
        <button
          style={{
            padding: '7px 16px',
            borderRadius: '8px',
            border: '1px solid var(--accent, #8b5cf6)',
            background: 'var(--accent, #8b5cf6)',
            color: 'white',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Start
        </button>
        <button
          style={{
            padding: '7px 16px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(255,255,255,0.04)',
            color: '#a09cb0',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Skip
        </button>
      </div>
    </div>
  );
}
