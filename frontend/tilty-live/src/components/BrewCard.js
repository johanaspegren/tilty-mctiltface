// src/components/BrewCard.js
import Sparkline from "./Sparkline";
import TempGauge from "./TempGauge";
import { colourHex, cToF, sgToPlato, timeAgo, rssiBars, trendOf } from "../utils/format";
import "./BrewCard.css";

export default function BrewCard({ latest, history = [], units = { gravity:"sg", temp:"c" }, batchName, onClick }) {
  if (!latest) return null;
  const { color, sg, temp_c, temp_f, ts, rssi } = latest;

  const gValue = units.gravity === "plato" ? sgToPlato(sg) : sg;
  const gStr = units.gravity === "plato" ? `${gValue.toFixed(1)} °P` : `${sg.toFixed(3)} SG`;

  const tValue = units.temp === "f" ? temp_f : temp_c;
  const tStr   = units.temp === "f" ? `${Math.round(temp_f)} °F` : `${temp_c.toFixed(1)} °C`;

  const trend = trendOf(history.map(h => h.sg));
  const trendIcon = trend > 0 ? "↗" : trend < 0 ? "↘" : "→";
  const bars = rssiBars(rssi);

  return (
    <div className="brew-card" style={{ borderColor: colourHex[latest.color], cursor: 'pointer' }} onClick={onClick}>
      <div className="head">
        <span className="badge" style={{ color: colourHex[color], borderColor: colourHex[color] }}>
          {color}
        </span>
        <div className="muted">{batchName || "Active batch"} • {timeAgo(ts)}</div>
      </div>

      <div className="grid">
        <div className="main">
          <div className="metric">
            <div className="label">Gravity</div>
            <div className="value">{gStr} <span className="trend">{trendIcon}</span></div>
          </div>
          <div className="metric">
            <div className="label">Temperature</div>
            <div className="value">{tStr}</div>
          </div>
          <div className="signal">
            <div className="label">Signal</div>
            <div className="bars">
              {[1,2,3,4].map(i => (<span key={i} className={i<=bars ? "bar on":"bar"} />))}
            </div>
            <div className="rssi">{rssi ?? "?"} dBm</div>
          </div>
        </div>
        <div className="viz">
          <TempGauge value={units.temp==="f" ? temp_f : temp_c} min={units.temp==="f" ? 32 : 0} max={units.temp==="f" ? 86 : 30} label={units.temp==="f" ? "°F" : "°C"} />
          <Sparkline data={history} dataKey="sg" />
        </div>
      </div>
    </div>
  );
}
