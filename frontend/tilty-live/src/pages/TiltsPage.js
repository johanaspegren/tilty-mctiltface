import { useEffect, useState } from "react";
import { Routes, Route, useParams } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase";
import TiltReadings from "../tilts/TiltReadings";

function TiltRoute() {
  const { color } = useParams();
  return <TiltReadings color={color.toUpperCase()} />;
}

export default function TiltsPage() {
  const [colors, setColors] = useState([]);

  useEffect(() => {
    async function fetchTilts() {
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      const tiltsCol = collection(db, "users", uid, "tilts");
      const snap = await getDocs(tiltsCol);
      const found = snap.docs.map((doc) => doc.id.toUpperCase());
      setColors(found);
    }
    fetchTilts();
  }, []);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="page">
            {colors.length === 0 ? (
              <p>No Tilt data yet.</p>
            ) : (
              colors.map((c) => <TiltReadings key={c} color={c} />)
            )}
          </div>
        }
      />
      <Route path=":color" element={<TiltRoute />} />
    </Routes>
  );
}
