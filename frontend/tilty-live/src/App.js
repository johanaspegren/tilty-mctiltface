import { useEffect, useState } from "react";
import { authReady, onUser } from "./firebase";
import AuthForm from "./components/AuthForm";
import TiltReadings from "./tilts/TiltReadings";
import BatchesPage from "./batches/BatchesPage";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("tilts"); // "tilts" | "batches"

  // Initial auth state
  useEffect(() => {
    authReady.then((u) => setUser(u));
    return onUser((u) => setUser(u));
  }, []);

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
        <h2>Tilty McTiltface</h2>
        <AuthForm user={user} />
      </header>

      <nav className="app-tabs">
        <button
          className={tab === "tilts" ? "tab active" : "tab"}
          onClick={() => setTab("tilts")}
        >
          Tilts
        </button>
        <button
          className={tab === "batches" ? "tab active" : "tab"}
          onClick={() => setTab("batches")}
        >
          Batches
        </button>
      </nav>

      <main className="app-main">
        {tab === "tilts" && (
          <div className="page">
            <TiltReadings color="RED" />
            <TiltReadings color="YELLOW" />
            {/* Add other Tilt colors here if you like */}
          </div>
        )}

        {tab === "batches" && (
          <div className="page">
            <BatchesPage />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
  