interface Props {
  duration?: number;
}

export default function BubbleTimerBar({ duration = 30 }: Props) {
  return (
    <div
      className="absolute bottom-0 left-0 right-0 h-1"
      style={{ background: 'rgba(var(--accent-rgb), 0.1)' }}
    >
      <div
        className="h-full w-full rounded-b-2xl"
        style={{
          background: 'linear-gradient(90deg, var(--accent), var(--accent-light))',
          transformOrigin: 'left',
          animation: `timer-shrink ${duration}s linear forwards`,
        }}
      />
    </div>
  );
}
