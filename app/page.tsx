import Map from "../components/Map";

export default function Home() {
  return (
    <main style={{
      background: "#0B0B0B",
      color: "#E5E5E5",
      minHeight: "100vh",
      padding: "20px",
      fontFamily: "sans-serif"
    }}>
      
      <h1 style={{ textAlign: "center", fontSize: "2.5rem" }}>
        Privacy Log
      </h1>

      <p style={{ textAlign: "center" }}>
        O guia mais discreto do Brasil
      </p>

      <p style={{ textAlign: "center", opacity: 0.7 }}>
        Avaliações reais. Experiências reais.
      </p>

      <div style={{ marginTop: "30px" }}>
        <Map />
      </div>

    </main>
  );
}