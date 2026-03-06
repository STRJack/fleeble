interface Props {
  options: string[];
}

export default function BubbleOptions({ options }: Props) {
  return (
    <div className="flex flex-col gap-2 mt-4">
      {options.map((opt, i) => (
        <button
          key={i}
          className="w-full py-2.5 px-3.5 rounded-lg text-left text-sm font-medium cursor-pointer flex items-center gap-2.5 transition-all duration-150"
          style={{
            border: '1.5px solid rgba(var(--accent-rgb), 0.18)',
            background: 'rgba(var(--accent-rgb), 0.05)',
            color: 'var(--card-text)',
            fontFamily: 'inherit',
          }}
        >
          <span
            className="w-6 h-6 rounded-md text-white text-xs font-bold flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))' }}
          >
            {i + 1}
          </span>
          <span className="flex-1 leading-tight">{opt}</span>
        </button>
      ))}
    </div>
  );
}
