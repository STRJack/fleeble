export default function MascotMini() {
  return (
    <div
      className="relative shrink-0"
      style={{ width: '40px', height: '48px', animation: 'mini-float 3s ease-in-out infinite' }}
    >
      {/* Antenna */}
      <div
        className="absolute rounded"
        style={{
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '2px',
          height: '10px',
          background: 'var(--accent)',
        }}
      >
        <div
          className="absolute rounded-full"
          style={{
            top: '-4px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '7px',
            height: '7px',
            background: 'var(--accent-tip)',
          }}
        />
      </div>
      {/* Body */}
      <div
        className="absolute rounded-full"
        style={{
          top: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '32px',
          height: '32px',
          background: 'linear-gradient(165deg, var(--accent-light) 0%, var(--accent) 40%, var(--accent-dark) 100%)',
        }}
      >
        {/* Left eye */}
        <div
          className="absolute bg-white rounded-full overflow-hidden"
          style={{ top: '9px', left: '6px', width: '8px', height: '8px' }}
        >
          <div
            className="absolute rounded-full"
            style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -45%)',
              width: '4.5px',
              height: '4.5px',
              background: '#1e1b4b',
              animation: 'look 5s ease-in-out infinite',
            }}
          />
        </div>
        {/* Right eye */}
        <div
          className="absolute bg-white rounded-full overflow-hidden"
          style={{ top: '9px', right: '6px', width: '8px', height: '8px' }}
        >
          <div
            className="absolute rounded-full"
            style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -45%)',
              width: '4.5px',
              height: '4.5px',
              background: '#1e1b4b',
              animation: 'look 5s ease-in-out infinite',
            }}
          />
        </div>
      </div>
      {/* Left arm */}
      <div
        className="absolute rounded-full"
        style={{
          top: '28px',
          left: '1px',
          width: '7px',
          height: '8px',
          background: 'var(--accent-dark)',
          transform: 'rotate(15deg)',
        }}
      />
      {/* Right arm */}
      <div
        className="absolute rounded-full"
        style={{
          top: '28px',
          right: '1px',
          width: '7px',
          height: '8px',
          background: 'var(--accent-dark)',
          transform: 'rotate(-15deg)',
        }}
      />
    </div>
  );
}
