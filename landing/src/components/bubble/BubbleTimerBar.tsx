interface Props {
  duration?: number;
}

export default function BubbleTimerBar({ duration = 30 }: Props) {
  return (
    <div
      className="absolute bottom-0 left-0 right-0"
      style={{ height: '3px', background: 'rgba(var(--accent-rgb), 0.1)' }}
    >
      <div
        className="h-full w-full"
        style={{
          background: 'linear-gradient(90deg, var(--accent), var(--accent-light))',
          borderRadius: '0 0 12px 12px',
          transformOrigin: 'left',
          animation: `timer-shrink ${duration}s linear forwards`,
        }}
      />
    </div>
  );
}
