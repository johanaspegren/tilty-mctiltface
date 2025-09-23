import { useEffect, useState } from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import { authReady, onUser } from "./firebase";
import AuthForm from "./components/AuthForm";
import HomePage from "./pages/HomePage";
import TiltsPage from "./pages/TiltsPage";
import BatchesPage from "./pages/BatchesPage";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    authReady.then((u) => setUser(u));
    return onUser((u) => setUser(u));
  }, []);

  if (!user) {
    return (
      <div style={{ padding: "2rem" }}>
        <h2>Tilty McTiltface 🍺</h2>
        <AuthForm user={null} onAuthed={setUser} />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h2>Tilty McTiltface 🍺</h2>
        <div className="user-box">
          <AuthForm user={user} />
        </div>
      </header>
      <br></br>
      <nav className="app-tabs">
        <NavLink to="/" end className={({ isActive }) => `tab ${isActive ? "active" : ""}`}>
          Home
        </NavLink>
        <NavLink to="/tilts" className={({ isActive }) => `tab ${isActive ? "active" : ""}`}>
          Tilts
        </NavLink>
        <NavLink to="/batches" className={({ isActive }) => `tab ${isActive ? "active" : ""}`}>
          Batches
        </NavLink>
      </nav>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tilts/*" element={<TiltsPage />} />
          <Route path="/batches" element={<BatchesPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
