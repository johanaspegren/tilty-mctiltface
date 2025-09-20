// src/components/TempGauge.js
export default function TempGauge({ value = 20, min = 0, max = 40, label = "°C" }) {
  // semi-circle 180° gauge
  const pct = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const angle = Math.PI * (1 - pct); // 180..0
  const r = 50, cx = 60, cy = 60;
  const x = cx + r * Math.cos(angle);
  const y = cy + r * Math.sin(angle);

  return (
    <svg width="140" height="80" viewBox="0 0 140 80">
      <defs>
        <linearGradient id="warm" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#60a5fa"/>
          <stop offset="100%" stopColor="#f59e0b"/>
        </linearGradient>
      </defs>
      <path d={`M10,60 A50,50 0 0 1 110,60`} fill="none" stroke="url(#warm)" strokeWidth="10" opacity="0.5"/>
      {/* needle */}
      <line x1={cx} y1={cy} x2={x} y2={y} stroke="#e5e7eb" strokeWidth="3" strokeLinecap="round"/>
      <circle cx={cx} cy={cy} r="4" fill="#e5e7eb"/>
      <text x="120" y="64" fontSize="10" fill="#9ca3af" textAnchor="end">{value.toFixed(1)}{label}</text>
    </svg>
  );
}
