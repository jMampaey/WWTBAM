export default function TimerCircle({ time, total, size = 120 }) {
  const r    = (size - 16) / 2;
  const cx   = size / 2;
  const cy   = size / 2;
  const circ = 2 * Math.PI * r;
  const pct  = Math.max(0, time / total);
  const color = pct > 0.5 ? '#3b82f6' : pct > 0.25 ? '#f59e0b' : '#ef4444';

  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e3a5f" strokeWidth="10" />
      <circle
        cx={cx} cy={cy} r={r} fill="none"
        stroke={color} strokeWidth="10"
        strokeDasharray={`${circ * pct} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: 'stroke-dasharray 0.95s linear, stroke 0.3s ease' }}
      />
      <text
        x={cx} y={cy + 9} textAnchor="middle"
        fill="white" fontSize="26" fontWeight="bold"
        fontFamily="'Segoe UI', system-ui, sans-serif"
      >{time}</text>
    </svg>
  );
}