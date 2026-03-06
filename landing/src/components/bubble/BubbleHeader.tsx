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
    <div className="flex gap-2 items-center mb-3">
      <span
        className="text-[11px] font-bold uppercase tracking-wider text-white py-1 px-2.5 rounded-full"
        style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-darker))' }}
      >
        {SOURCE_LABELS[source] || source}
      </span>
      <span
        className="text-[11px] font-semibold uppercase tracking-wide py-1 px-2.5 rounded-full"
        style={{ background: typeStyle.bg, color: typeStyle.color }}
      >
        {typeStyle.label}
      </span>
      {project && (
        <span
          className="text-[11px] font-semibold tracking-wide py-1 px-2.5 rounded-full ml-auto max-w-[140px] truncate"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(var(--card-text-rgb), 0.5)' }}
        >
          {project}
        </span>
      )}
    </div>
  );
}
