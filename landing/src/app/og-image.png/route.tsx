import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(170deg, #0f0d1a 0%, #1a1625 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(ellipse at 50% 30%, rgba(139, 92, 246, 0.15) 0%, transparent 60%)',
          }}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
          }}
        >
          <div
            style={{
              fontSize: '80px',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              background: 'linear-gradient(135deg, #e2dff0 0%, #c4b5fd 50%, #8b5cf6 100%)',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Fleeble
          </div>
          <div
            style={{
              fontSize: '32px',
              fontWeight: 500,
              color: 'rgba(226, 232, 240, 0.6)',
              textAlign: 'center',
              maxWidth: '800px',
              lineHeight: 1.4,
            }}
          >
            Smart Notifications for AI Coding Tools
          </div>
          <div
            style={{
              display: 'flex',
              gap: '16px',
              marginTop: '16px',
            }}
          >
            {['Claude Code', 'Cursor', 'Codex'].map((name) => (
              <div
                key={name}
                style={{
                  padding: '10px 24px',
                  borderRadius: '999px',
                  background: 'rgba(139, 92, 246, 0.15)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  color: '#a78bfa',
                  fontSize: '20px',
                  fontWeight: 600,
                }}
              >
                {name}
              </div>
            ))}
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: '32px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'rgba(226, 232, 240, 0.3)',
            fontSize: '18px',
          }}
        >
          macOS (Apple Silicon) — Free & Open Source
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
