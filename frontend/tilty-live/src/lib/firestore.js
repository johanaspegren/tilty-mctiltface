import {
  collection, doc, addDoc, setDoc, getDoc, getDocs, updateDoc,
  deleteDoc, query, orderBy, where, onSnapshot, serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../firebase";

const userPath = () => {
  const user = auth.currentUser;
  if (!user) throw new Error("No authenticated user");
  return user.uid;
};


const batchesCol = () =>
  collection(db, "users", userPath(), "batches");

const tiltsCol = (color) =>
  collection(db, "users", userPath(), "tilts", color, "readings");

// --- Batches ---
export async function listBatches() {
  const snap = await getDocs(query(batchesCol(), orderBy("start", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function setCurrentBatch(color, batchId) {
  const ref = doc(db, "users", userPath(), "tilts", color);
  await setDoc(
    ref,
    { current_batch: batchId },
    { merge: true } // merge so we don’t overwrite the tilt doc
  );
  console.log(`Set current batch for ${color} to ${batchId}`);
}

export async function getBatch(id) {
  const ref = doc(db, "users", userPath(), "batches", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function saveBatch(batch) {
  if (batch.id) {
    const ref = doc(db, "users", userPath(), "batches", batch.id);
    await updateDoc(ref, { ...batch });
    return batch.id;
  } else {
    const ref = await addDoc(batchesCol(), {
      ...batch,
      created_at: serverTimestamp(),
    });
    return ref.id;
  }
}

export async function deleteBatch(id) {
  const ref = doc(db, "users", userPath(), "batches", id);
  await deleteDoc(ref);
}

export async function getBatchForTilt(color) {
  const tiltRef = doc(db, "users", userPath(), "tilts", color);
  const tiltSnap = await getDoc(tiltRef);
  if (!tiltSnap.exists()) return null;

  const batchId = tiltSnap.data().current_batch;
  if (!batchId) return null;

  const batchRef = doc(db, "users", userPath(), "batches", batchId);
  const batchSnap = await getDoc(batchRef);
  if (!batchSnap.exists()) return null;

  return { id: batchSnap.id, ...batchSnap.data() };
}


// --- Measurements ---
export async function listMeasurements(color) {
  const snap = await getDocs(query(tiltsCol(color), orderBy("seen_at", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function subscribeMeasurements(color, callback) {
  console.log(`[Firestore] Subscribing to measurements for ${color}`);

  const unsubscribe = onSnapshot(
    query(tiltsCol(color), orderBy("seen_at", "desc")),
    (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(data);
    }
  );

  return () => {
    console.log(`[Firestore] Unsubscribing from ${color}`);
    unsubscribe();
  };
}



// --- Link measurement to batch ---
export async function assignMeasurement(color, measurementId, batchId) {
  const ref = doc(db, "users", userPath(), "tilts", color, "readings", measurementId);
  await updateDoc(ref, { batch_id: batchId });
}

// Get untagged readings for a Tilt
export async function listUntaggedReadings(color) {
  const snap = await getDocs(
    query(
      tiltsCol(color),
      where("batch_id", "==", null),
      orderBy("seen_at", "asc")
    )
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Assign all readings in a date range to a batch
export async function assignReadingsInRange(color, batchId, start, end) {
  const snap = await getDocs(
    query(
      tiltsCol(color),
      where("seen_at", ">=", start),
      where("seen_at", "<=", end)
    )
  );
  const updates = snap.docs.map((d) =>
    updateDoc(d.ref, { batch_id: batchId })
  );
  await Promise.all(updates);
}
