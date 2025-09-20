// src/components/Sparkline.js
import { ResponsiveContainer, AreaChart, Area, YAxis } from "recharts";

export default function Sparkline({ data = [], dataKey = "sg" }) {
  if (!data || data.length < 2) return <div style={{height:40}}/>;
  const yMin = Math.min(...data.map(d => d[dataKey])) * 0.999;
  const yMax = Math.max(...data.map(d => d[dataKey])) * 1.001;

  return (
    <div style={{ width: "100%", height: 40 }}>
      <ResponsiveContainer>
        <AreaChart data={data}>
          <YAxis hide domain={[yMin, yMax]} />
          <Area type="monotone" dataKey={dataKey} stroke="#e5e7eb" fill="#e5e7eb" fillOpacity={0.15} strokeWidth={2}/>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
