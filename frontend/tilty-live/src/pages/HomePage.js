// src/pages/HomePage.js
import { useEffect, useState } from "react";
import BrewCard from "../components/BrewCard";
import { subscribeMeasurements } from "../lib/firestore";
import "./HomePage.css";

export default function HomePage() {
  const [tilts, setTilts] = useState({}); // store readings per color

  // Define which tilt colors you want to track
  const colors = ["RED", "YELLOW", "GREEN", "BLUE"];

  useEffect(() => {
    // Subscribe to all tilt colors
    const unsubscribers = colors.map((color) =>
      subscribeMeasurements(color, (data) => {
        setTilts((prev) => ({
          ...prev,
          [color]: data, // full history for this tilt
        }));
      })
    );

    return () => unsubscribers.forEach((u) => u && u());
  }, []);

  return (
    <div className="page">
      <h3>Active Brews</h3>
      <div className="tilt-grid">
        {Object.entries(tilts).map(([color, readings]) => {
          if (!readings || readings.length === 0) return null;
          const latest = readings[0]; // newest first
          return (
            <BrewCard
              key={color}
              latest={latest}
              history={readings.slice(0, 50)} // show up to 50 readings for sparkline
              batchName={latest.batch_id ? `Batch ${latest.batch_id}` : null}
              onClick={() => console.log("Clicked tilt:", color)}
            />
          );
        })}
      </div>
    </div>
  );
}
