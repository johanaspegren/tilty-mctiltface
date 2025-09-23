import { useEffect, useState } from "react";
import { listBatches, saveBatch, deleteBatch } from "../lib/firestore";
import "./BatchesPage.css";

export default function BatchesPage() {
  const [batches, setBatches] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false); // 👈 toggle state
  const [form, setForm] = useState({
    name: "",
    style: "",
    hops: "",
    notes: "",
    start: "",
    end: "",
    dryhop_after_days: "", // 👈 new field
  });


useEffect(() => { refresh(); }, []);
  async function refresh() {
    const list = await listBatches();
    setBatches(list);
  }

  async function refresh() {
    const list = await listBatches();
    setBatches(list);
  }
  
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const id = await saveBatch({ ...form });
    console.log("Saved batch", id);
    setForm({ name: "", style: "", hops: "", notes: "", start: "", end: "", dryhop_after_days: "",
    });
    setEditing(null);
    setShowForm(false); // 👈 collapse form after submit
    refresh();
  }

  async function handleDelete(id) {
    if (window.confirm("Delete this batch?")) {
      await deleteBatch(id);
      refresh();
    }
  }

  function editBatch(batch) {
    setEditing(batch.id);
    setForm(batch);
    setShowForm(true); // 👈 open form when editing
  }

  return (
    <div className="page">
      <h3 className="section-title">Your Batches</h3>

      <div className="form-toggle">
        <button className="btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Close Form" : "+ New Batch"}
        </button>
      </div>

      {showForm && (
        <form className="batch-form" onSubmit={handleSubmit}>
          <h4>{editing ? "Edit Batch" : "New Batch"}</h4>
          <div className="form-row">
            <label>Name</label>
            <input name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-row">
            <label>Style</label>
            <input name="style" value={form.style} onChange={handleChange} />
          </div>
          <div className="form-row">
            <label>Hops</label>
            <input name="hops" value={form.hops} onChange={handleChange} />
          </div>
          <div className="form-row">
            <label>Dry Hop After (days)</label>
            <input
              type="number"
              min="0"
              name="dryhop_after_days"
              value={form.dryhop_after_days}
              onChange={handleChange}
              placeholder="e.g. 10"
            />
          </div>
          <div className="form-row">
            <label>Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} />
          </div>
          <div className="form-row">
            <label>Start Date</label>
            <input type="date" name="start" value={form.start} onChange={handleChange} />
          </div>
          <div className="form-row">
            <label>End Date</label>
            <input type="date" name="end" value={form.end} onChange={handleChange} />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn">
              {editing ? "Update Batch" : "Add Batch"}
            </button>
            {editing && (
              <button
                type="button"
                className="btn"
                onClick={() => { setEditing(null); setShowForm(false); }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      <div className="batch-list">
        {batches.length === 0 && <p>No batches yet.</p>}
        {batches.map((b) => (
          <div key={b.id} className="batch-card">
            <h4>{b.name || "Unnamed Batch"}</h4>
            <p><b>Style:</b> {b.style || "—"}</p>
            <p><b>Hops:</b> {b.hops || "—"}</p>
            <p><b>Notes:</b> {b.notes || "—"}</p>
            <p>
              <b>Start:</b> {b.start || "—"} <b>End:</b> {b.end || "—"}
            </p>
            <p>
              <b>Dry Hop:</b>{" "}
              {b.dryhop_after_days
                ? `${b.dryhop_after_days} days after start`
                : "—"}
            </p>
            <div className="batch-actions">
              <button className="btn" onClick={() => editBatch(b)}>Edit</button>
              <button className="btn danger" onClick={() => handleDelete(b.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
} 