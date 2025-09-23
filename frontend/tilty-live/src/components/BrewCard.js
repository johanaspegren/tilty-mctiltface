import Sparkline from "./Sparkline";
import TempGauge from "./TempGauge";
import { colourHex, sgToPlato, timeAgo, rssiBars, trendOf } from "../utils/format";
import "./BrewCard.css";

export default function BrewCard({
  latest,
  history = [],
  units = { gravity: "sg", temp: "c" },
  batch,          // 🔥 new: full batch object
  onClick,
}) {
  if (!latest) return null;
  const { color, sg, temp_c, temp_f, rssi, seen_iso, seen_at } = latest;

  // derive timestamp from iso string or Firestore Timestamp
  const ts =
    seen_iso
      ? new Date(seen_iso)
      : seen_at?.toDate
      ? seen_at.toDate()
      : null;

  const gValue = units.gravity === "plato" ? sgToPlato(sg) : sg;
  const gStr =
    units.gravity === "plato"
      ? `${gValue.toFixed(1)} °P`
      : `${sg.toFixed(3)} SG`;

  const tStr =
    units.temp === "f"
      ? `${Math.round(temp_f)} °F`
      : `${temp_c.toFixed(1)} °C`;

  const trend = trendOf(history.map((h) => h.sg));
  const trendIcon = trend > 0 ? "↗" : trend < 0 ? "↘" : "→";
  const bars = rssiBars(rssi);

  const tsString = ts
    ? ts.toLocaleString([], {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Unknown";

  return (
    <div
      className="brew-card"
      style={{ borderColor: colourHex[color], cursor: "pointer" }}
      onClick={onClick}
    >
      <div className="head">
        <span
          className="badge"
          style={{ color: colourHex[color], borderColor: colourHex[color] }}
        >
          {color}
        </span>
        <div className="muted">
          {batch ? batch.name : "Unlinked batch"} • {ts ? timeAgo(ts) : "—"}
        </div>
      </div>

      {batch && (
        <div className="batch-info">
          <div className="batch-line">
            <b>{batch.style || "—"}</b>
            {batch.start && <span> • Started {batch.start}</span>}
            {batch.end && <span> • Ends {batch.end}</span>}
          </div>
          {batch.hops && <div className="muted">Hops: {batch.hops}</div>}
        </div>
      )}

      <div className="grid">
        <div className="main">
          <div className="metric">
            <div className="label">Gravity</div>
            <div className="value">
              {gStr} <span className="trend">{trendIcon}</span>
            </div>
          </div>
          <div className="metric">
            <div className="label">Temperature</div>
            <div className="value">{tStr}</div>
          </div>
          <div className="signal">
            <div className="label">Signal</div>
            <div className="bars">
              {[1, 2, 3, 4].map((i) => (
                <span key={i} className={i <= bars ? "bar on" : "bar"} />
              ))}
            </div>
            <div className="rssi">{rssi ?? "?"} dBm</div>
          </div>
          <div className="timestamp">
            <div className="label">Last Reading</div>
            <div className="value">{tsString}</div>
          </div>
        </div>
        <div className="viz">
          <TempGauge
            value={units.temp === "f" ? temp_f : temp_c}
            min={units.temp === "f" ? 32 : 0}
            max={units.temp === "f" ? 86 : 30}
            label={units.temp === "f" ? "°F" : "°C"}
          />
          <Sparkline data={history} dataKey="sg" />
        </div>
      </div>
    </div>
  );
}
