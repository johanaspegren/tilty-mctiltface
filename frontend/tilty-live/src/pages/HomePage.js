// src/pages/HomePage.js
import { useEffect, useState } from "react";
import BrewCard from "../components/BrewCard";
import { subscribeMeasurements, getBatchForTilt } from "../lib/firestore";
import { useMemo } from "react";
import "./HomePage.css";

export default function HomePage() {
  const [tilts, setTilts] = useState({});
  const [batchByColor, setBatchByColor] = useState({});
  const colors = useMemo(() => ["RED", "YELLOW"], []);
  
// Load batch metadata once per color
  useEffect(() => {
    async function loadBatches() {
      const map = {};
      for (const c of colors) {
        map[c] = await getBatchForTilt(c);
      }
      setBatchByColor(map);
    }
    loadBatches();
  }, [colors]);
  
  // Subscribe to Tilt readings
  useEffect(() => {
    const unsubscribers = colors.map((color) =>
      subscribeMeasurements(color, (data) => {
        setTilts((prev) => ({ ...prev, [color]: data }));
      })
    );
    return () => unsubscribers.forEach((u) => u && u());
  }, [colors]);

  
  return (
    <div className="page">
      <h3>Active Brews</h3>
      <div className="tilt-grid">
        {Object.entries(tilts).map(([color, readings]) => {
          if (!readings || readings.length === 0) return null;
          const latest = readings[0];
          const batch = batchByColor[color] || null;

          return (
            <BrewCard
              key={color}
              latest={latest}
              history={readings.slice(0, 50)}
              units={{ gravity: "sg", temp: "c" }} // optional: hook in user prefs
              batch={batch}                        // 🔥 full batch object
              onClick={() => console.log("Clicked tilt:", color)}
            />
          );
        })}
      </div>
    </div>
  );
}
