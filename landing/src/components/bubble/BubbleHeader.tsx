import { BubbleType } from '@/types';

const SOURCE_LABELS: Record<string, string> = {
  'claude-code': 'Claude Code',
  cursor: 'Cursor',
  codex: 'Codex',
};

const TYPE_STYLES: Record<BubbleType, { bg: string; color: string; label: string }> = {
  action: { bg: 'rgba(251, 191, 36, 0.12)', color: '#fbbf24', label: 'Action' },
  error: { bg: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', label: 'Error' },
  info: { bg: 'rgba(96, 165, 250, 0.12)', color: '#60a5fa', label: 'Info' },
  question: { bg: 'rgba(168, 85, 247, 0.12)', color: '#a855f7', label: 'Question' },
  approval: { bg: 'rgba(251, 191, 36, 0.12)', color: '#fbbf24', label: 'Approval' },
};

interface Props {
  source: string;
  type: BubbleType;
  project?: string;
}

export default function BubbleHeader({ source, type, project }: Props) {
  const typeStyle = TYPE_STYLES[type];

  return (
    <div className="flex items-center" style={{ gap: '5px', marginBottom: '8px' }}>
      <span
        className="text-white font-bold uppercase"
        style={{
          fontSize: '8px',
          letterSpacing: '0.6px',
          background: 'linear-gradient(135deg, var(--accent), var(--accent-darker))',
          padding: '3px 7px',
          borderRadius: '12px',
        }}
      >
        {SOURCE_LABELS[source] || source}
      </span>
      <span
        className="font-semibold uppercase"
        style={{
          fontSize: '8px',
          letterSpacing: '0.4px',
          background: typeStyle.bg,
          color: typeStyle.color,
          padding: '3px 7px',
          borderRadius: '12px',
        }}
      >
        {typeStyle.label}
      </span>
      {project && (
        <span
          className="font-semibold truncate"
          style={{
            fontSize: '8px',
            letterSpacing: '0.3px',
            background: 'rgba(255,255,255,0.06)',
            color: 'rgba(var(--card-text-rgb), 0.5)',
            padding: '3px 7px',
            borderRadius: '12px',
            marginLeft: 'auto',
            maxWidth: '100px',
          }}
        >
          {project}
        </span>
      )}
    </div>
  );
}
