// readings must be sorted ascending by seen_at
export function clusterReadings(readings) {
  if (readings.length === 0) return [];

  // Sort ascending just in case
  const sorted = [...readings].sort(
    (a, b) => a.seen_at.toDate() - b.seen_at.toDate()
  );

  const clusters = [];
  let cluster = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    const gapDays =
      (curr.seen_at.toDate() - prev.seen_at.toDate()) / (1000 * 60 * 60 * 24);

    if (gapDays > 1.5) {
      clusters.push(cluster);
      cluster = [curr];
    } else {
      cluster.push(curr);
    }
  }
  clusters.push(cluster);

  return clusters.map((c) => ({
    start: c[0].seen_at.toDate(),
    end: c[c.length - 1].seen_at.toDate(),
    count: c.length,
    avgTemp: (
      c.reduce((sum, r) => sum + r.temp_c, 0) / c.length
    ).toFixed(1),
    avgSG: (
      c.reduce((sum, r) => sum + r.sg, 0) / c.length
    ).toFixed(3),
  }));
}
