export default function MascotMini() {
  return (
    <div
      className="relative w-10 h-12 shrink-0"
      style={{ animation: 'mini-float 3s ease-in-out infinite' }}
    >
      {/* Antenna */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-2.5 rounded"
        style={{ background: 'var(--accent)' }}
      >
        <div
          className="absolute -top-1 left-1/2 -translate-x-1/2 w-[7px] h-[7px] rounded-full"
          style={{ background: 'var(--accent-tip)' }}
        />
      </div>
      {/* Body */}
      <div
        className="absolute top-2.5 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full"
        style={{ background: 'linear-gradient(165deg, var(--accent-light) 0%, var(--accent) 40%, var(--accent-dark) 100%)' }}
      >
        {/* Eyes */}
        <div className="absolute top-[9px] left-[6px] w-2 h-2 rounded-full bg-white overflow-hidden">
          <div
            className="absolute top-1/2 left-1/2 w-[4.5px] h-[4.5px] rounded-full"
            style={{ background: '#1e1b4b', animation: 'look 5s ease-in-out infinite' }}
          />
        </div>
        <div className="absolute top-[9px] right-[6px] w-2 h-2 rounded-full bg-white overflow-hidden">
          <div
            className="absolute top-1/2 left-1/2 w-[4.5px] h-[4.5px] rounded-full"
            style={{ background: '#1e1b4b', animation: 'look 5s ease-in-out infinite' }}
          />
        </div>
      </div>
      {/* Arms */}
      <div
        className="absolute top-7 left-[1px] w-[7px] h-2 rounded-full rotate-[15deg]"
        style={{ background: 'var(--accent-dark)' }}
      />
      <div
        className="absolute top-7 right-[1px] w-[7px] h-2 rounded-full -rotate-[15deg]"
        style={{ background: 'var(--accent-dark)' }}
      />
    </div>
  );
}
