import { useEffect, useState } from "react";
import { subscribeMeasurements } from "../lib/firestore";
import { listBatches, assignMeasurement } from "../lib/firestore";
import { useNavigate } from "react-router-dom"; // if using react-router
import "./TiltReadings.css";

export default function TiltReadings({ color }) {
  const [readings, setReadings] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [openCluster, setOpenCluster] = useState(null); // track expanded cluster
  const [batches, setBatches] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Live updates
    const unsubscribe = subscribeMeasurements(color, (data) => {
      setReadings(data);
    });
    return () => unsubscribe();
  }, [color]);

  useEffect(() => {
    // Load batches once
    listBatches().then(setBatches);
  }, []);
 
  // Format timestamps nicely
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
    } catch {
      return r.seen_iso || "";
    }
  };

  // Group readings into clusters: a gap > 2 days starts a new cluster
  useEffect(() => {
    if (readings.length === 0) {
      setClusters([]);
      return;
    }
    const sorted = [...readings].sort(
      (a, b) =>
        new Date(a.seen_iso || a.seen_at?.toDate()) -
        new Date(b.seen_iso || b.seen_at?.toDate())
    );

    const clusters = [];
    let current = [];
    let lastTime = null;

    for (let r of sorted) {
      const t = new Date(r.seen_iso || r.seen_at?.toDate());
      if (lastTime && t - lastTime > 1000 * 60 * 60 * 48) {
        // >48h gap
        clusters.push(current);
        current = [];
      }
      current.push(r);
      lastTime = t;
    }
    if (current.length > 0) clusters.push(current);

    setClusters(clusters.reverse()); // newest cluster first
  }, [readings]);

  async function connectCluster(cluster, batchId) {
    for (let r of cluster) {
      await assignMeasurement(color, r.id, batchId);
    }
    alert(`Cluster connected to batch ${batchId}`);
  }

  return (
    <div className="tilt-readings">
      <h3>{color} Tilt Readings</h3>
      {clusters.length === 0 ? (
        <p>No readings yet.</p>
      ) : (
        clusters.map((cluster, idx) => (
          <div key={idx} className="reading-cluster">
            <h4>
              Cluster {idx + 1} ({cluster.length} readings) –{" "}
              {formatSeen(cluster[0])} → {formatSeen(cluster[cluster.length - 1])}
            </h4>

            <div className="cluster-actions">
              <select
                defaultValue=""
                onChange={(e) => {
                  const batchId = e.target.value;
                  if (batchId === "__new__") {
                    navigate("/batches", {
                      state: {
                        suggestedStart: cluster[0].seen_iso || cluster[0].seen_at?.toDate(),
                        suggestedEnd:
                          cluster[cluster.length - 1].seen_iso ||
                          cluster[cluster.length - 1].seen_at?.toDate(),
                      },
                    });
                  } else if (batchId) {
                    connectCluster(cluster, batchId);
                  }
                }}
              >
                <option value="">Assign to batch…</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name || "Unnamed batch"}
                  </option>
                ))}
                <option value="__new__">➕ Create New Batch…</option>
              </select>
            </div>

            <div className="cluster-body open">
              <div className="cluster-scroll">
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
                    {[...cluster].reverse().map((r) => (
                      <tr key={r.id}>
                        <td>{formatSeen(r)}</td>
                        <td>{r.temp_c}</td>
                        <td>{r.sg}</td>
                        <td>{r.rssi}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

