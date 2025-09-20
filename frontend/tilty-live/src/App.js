import { useEffect, useState } from "react";
import { Routes, Route, NavLink, useParams } from "react-router-dom"; // 👈 add useParams
import { authReady, onUser } from "./firebase";
import AuthForm from "./components/AuthForm";
import BatchesPage from "./batches/BatchesPage";
import TiltReadings from "./tilts/TiltReadings";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);

  // Initial auth state
  useEffect(() => {
    authReady.then((u) => setUser(u));
    return onUser((u) => setUser(u));
  }, []);

  function TiltRoute() {
    const { color } = useParams();
    return <TiltReadings color={color.toUpperCase()} />;
  }

  function TiltsOverview() {
    const colors = ["RED", "YELLOW"]; // add the ones you actually have
    return (
      <div className="page">
        {colors.map((c) => (
          <TiltReadings key={c} color={c} />
        ))}
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: "2rem" }}>
        <h2>Tilty McTiltface Dashboard</h2>
        <AuthForm user={null} onAuthed={setUser} />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h2>Welcome, {user.email}</h2>
        <AuthForm user={user} />
      </header>

      <nav className="app-tabs">
        <NavLink to="/tilts" className={({ isActive }) => `tab ${isActive ? "active" : ""}`}>
          Tilts
        </NavLink>
        <NavLink to="/batches" className={({ isActive }) => `tab ${isActive ? "active" : ""}`}>
          Batches
        </NavLink>
      </nav>

      <main className="app-main">
        <Routes>
          <Route path="/tilts/:color" element={<TiltRoute />} />
          <Route path="/tilts" element={<TiltsOverview />} />
          <Route path="/batches" element={<BatchesPage />} />
          {/* fallback: redirect to tilts overview */}
          <Route path="*" element={<TiltsOverview />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
