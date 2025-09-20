// src/utils/format.js
export const colourHex = {
  RED:   "#ef4444",
  GREEN: "#22c55e",
  BLACK: "#9ca3af",
  PURPLE:"#a855f7",
  ORANGE:"#f59e0b",
  BLUE:  "#3b82f6",
  YELLOW:"#eab308",
  PINK:  "#ec4899",
};

export function sgToPlato(sg) {
  // Empirical: °P ≈ (-616.868) + 1111.14*SG - 630.272*SG^2 + 135.997*SG^3
  const p = -616.868 + 1111.14*sg - 630.272*sg*sg + 135.997*sg*sg*sg;
  return Math.max(0, p);
}

export function cToF(c){ return c * 9/5 + 32; }
export function fToC(f){ return (f - 32) * 5/9; }

export function timeAgo(tsSec) {
  const s = Math.max(0, Math.floor(Date.now()/1000) - tsSec);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s/60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m/60);
  if (h < 48) return `${h}h ago`;
  const d = Math.floor(h/24);
  return `${d}d ago`;
}

export function rssiBars(rssi) {
  // crude: > -60 = 4 bars, > -70 = 3, > -80 = 2, else 1
  if (rssi == null) return 0;
  if (rssi > -60) return 4;
  if (rssi > -70) return 3;
  if (rssi > -80) return 2;
  return 1;
}

export function trendOf(values) {
  // return -1, 0, +1 comparing median of first vs last quintile
  if (!values || values.length < 6) return 0;
  const n = values.length;
  const q = Math.max(3, Math.floor(n/5));
  const head = values.slice(0, q).sort((a,b)=>a-b);
  const tail = values.slice(-q).sort((a,b)=>a-b);
  const med = arr => arr[Math.floor(arr.length/2)];
  const diff = med(tail) - med(head);
  if (diff > 0.0005) return +1;
  if (diff < -0.0005) return -1;
  return 0;
}
