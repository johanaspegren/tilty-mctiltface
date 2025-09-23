// src/components/AuthForm.js
import { useState } from "react";
import { signIn, signUp, signOut } from "../firebase";
import "./AuthForm.css";

export default function AuthForm({ user, onAuthed }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [mode, setMode] = useState("signin"); // or "signup"
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const u = mode === "signin" ? await signIn(email, pw) : await signUp(email, pw);
      onAuthed?.(u);
      setEmail("");
      setPw("");
    } catch (err) {
      setError(err.message || String(err));
    }
  }

  if (user) {
    return (
      <div className="auth-card">
        <div className="auth-row between">
          <div className="muted">Signed in as <b>{user.email}</b></div>
          <button className="btn" onClick={() => signOut()}>Sign out</button>
        </div>
      </div>
    );
  }

  return (
    <form className="auth-card" onSubmit={handleSubmit}>
      <h3 className="auth-title">{mode === "signin" ? "Sign in to Tilty McTiltface" : "Create your account"}</h3>
      <div className="auth-row">
        <label className="lbl">Email</label>
        <input
          className="inp"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="auth-row">
        <label className="lbl">Password</label>
        <input
          className="inp"
          type="password"
          value={pw}
          onChange={e => setPw(e.target.value)}
          required
        />
      </div>
      {error && <div className="err">{error}</div>}
      <div className="auth-actions">
        <button className="btn" type="submit">
          {mode === "signin" ? "Sign in" : "Create account"}
        </button>
        <button
          type="button"
          className="link"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        >
          {mode === "signin" ? "Need an account?" : "Already have one?"}
        </button>
      </div>
    </form>
  );
}
