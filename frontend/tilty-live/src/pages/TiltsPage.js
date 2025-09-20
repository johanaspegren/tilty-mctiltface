import { Routes, Route, useParams } from "react-router-dom";
import TiltReadings from "../tilts/TiltReadings";

function TiltRoute() {
  const { color } = useParams();
  return <TiltReadings color={color.toUpperCase()} />;
}

export default function TiltsPage() {
  const colors = ["RED", "YELLOW"]; // expand to all tilt colors you have

  return (
    <Routes>
      <Route path="/" element={
        <div className="page">
          {colors.map((c) => (
            <TiltReadings key={c} color={c} />
          ))}
        </div>
      }/>
      <Route path=":color" element={<TiltRoute />} />
    </Routes>
  );
}
