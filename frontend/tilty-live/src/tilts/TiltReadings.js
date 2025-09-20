// src/tilts/TiltReadings.js
import { useEffect, useState } from "react";
import { subscribeMeasurements } from "../lib/firestore";
import "./TiltReadings.css";

export default function TiltReadings({ color }) {
  const [readings, setReadings] = useState([]);

  useEffect(() => {
    // Live updates
    const unsubscribe = subscribeMeasurements(color, (data) => {
      setReadings(data);
    });
    return () => unsubscribe();
  }, [color]);

  // helper to make timestamps pretty
  const formatSeen = (r) => {
    try {
      let d = null;
      if (r.seen_iso) {
        d = new Date(r.seen_iso);
      } else if (r.seen_at?.toDate) {
        d = r.seen_at.toDate();
      }
      return d
        ? d.toLocaleString([], {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "";
    } catch (e) {
      return r.seen_iso || "";
    }
  };

  return (
    <div className="tilt-readings">
      <h3>{color} Tilt Readings</h3>
      {readings.length === 0 ? (
        <p>No readings yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Seen</th>
              <th>Temp (°C)</th>
              <th>SG</th>
              <th>RSSI</th>
            </tr>
          </thead>
          <tbody>
            {readings.slice(0, 20).map((r) => (
              <tr key={r.id}>
                <td>{formatSeen(r)}</td>
                <td>{r.temp_c}</td>
                <td>{r.sg}</td>
                <td>{r.rssi}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
