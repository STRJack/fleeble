'use client';

import { useGitHubRelease } from '@/hooks/useGitHubRelease';

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return n.toString();
}

export default function DownloadButton() {
  const { version, downloadUrl, downloadCount } = useGitHubRelease();

  return (
    <div className="flex flex-col items-center gap-3 mt-2">
      <a
        href={downloadUrl}
        className="inline-flex items-center gap-2.5 text-white text-lg font-bold py-4 px-10 rounded-xl cursor-pointer no-underline relative overflow-hidden transition-all duration-150"
        style={{
          background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
          boxShadow: '0 4px 0 var(--accent-darker), 0 8px 24px rgba(var(--accent-rgb), 0.4)',
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget;
          el.style.background = 'linear-gradient(135deg, var(--accent-dark), var(--accent-darker))';
          el.style.transform = 'translateY(-2px)';
          el.style.boxShadow = '0 6px 0 var(--accent-darker), 0 12px 32px rgba(var(--accent-rgb), 0.5)';
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget;
          el.style.background = 'linear-gradient(135deg, var(--accent), var(--accent-dark))';
          el.style.transform = '';
          el.style.boxShadow = '0 4px 0 var(--accent-darker), 0 8px 24px rgba(var(--accent-rgb), 0.4)';
        }}
      >
        <span className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 50%)' }} />
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Download for macOS
      </a>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold" style={{ color: 'rgba(var(--card-text-rgb), 0.35)', letterSpacing: '0.04em' }}>
          macOS &bull; {version} &bull; Free
        </span>
        {downloadCount > 0 && (
          <>
            <span style={{ color: 'rgba(var(--card-text-rgb), 0.2)' }}>&bull;</span>
            <span className="inline-flex items-center gap-1 text-sm font-semibold" style={{ color: 'rgba(var(--card-text-rgb), 0.35)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {formatCount(downloadCount)}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
