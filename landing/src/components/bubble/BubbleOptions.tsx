interface Props {
  options: string[];
}

export default function BubbleOptions({ options }: Props) {
  return (
    <div className="flex flex-col" style={{ gap: '4px', marginTop: '10px' }}>
      {options.map((opt, i) => (
        <button
          key={i}
          className="w-full text-left cursor-pointer flex items-center transition-all duration-150"
          style={{
            padding: '7px 10px',
            borderRadius: '8px',
            border: '1.5px solid rgba(var(--accent-rgb), 0.18)',
            background: 'rgba(var(--accent-rgb), 0.05)',
            color: 'var(--card-text)',
            fontSize: '11px',
            fontWeight: 500,
            gap: '8px',
            fontFamily: 'inherit',
          }}
        >
          <span
            className="flex items-center justify-center shrink-0 text-white font-bold"
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '5px',
              background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
              fontSize: '9px',
            }}
          >
            {i + 1}
          </span>
          <span className="flex-1" style={{ lineHeight: 1.3 }}>{opt}</span>
        </button>
      ))}
    </div>
  );
}
