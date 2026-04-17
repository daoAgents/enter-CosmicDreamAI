export function NebulaBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Base deep space */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse at 50% 50%, hsl(240 25% 6%), hsl(240 30% 3%) 70%)"
      }} />

      {/* Nebula clouds */}
      <div
        className="absolute animate-nebula"
        style={{
          top: "-20%", left: "-15%",
          width: "70%", height: "70%",
          background: "radial-gradient(ellipse at center, hsl(260 80% 25% / 0.18), hsl(260 60% 15% / 0.08), transparent 65%)",
          filter: "blur(60px)",
        }}
      />
      <div
        className="absolute animate-nebula"
        style={{
          animationDelay: "-8s",
          top: "30%", right: "-20%",
          width: "65%", height: "60%",
          background: "radial-gradient(ellipse at center, hsl(200 80% 20% / 0.15), hsl(200 60% 12% / 0.06), transparent 65%)",
          filter: "blur(70px)",
        }}
      />
      <div
        className="absolute animate-nebula"
        style={{
          animationDelay: "-14s",
          bottom: "-10%", left: "20%",
          width: "60%", height: "55%",
          background: "radial-gradient(ellipse at center, hsl(320 60% 18% / 0.12), hsl(320 50% 10% / 0.05), transparent 65%)",
          filter: "blur(80px)",
        }}
      />
      <div
        className="absolute"
        style={{
          top: "15%", left: "35%",
          width: "40%", height: "40%",
          background: "radial-gradient(ellipse at center, hsl(260 80% 15% / 0.1), transparent 70%)",
          filter: "blur(50px)",
        }}
      />

      {/* Subtle vignette */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse at 50% 50%, transparent 40%, hsl(240 30% 2% / 0.7) 100%)"
      }} />
    </div>
  );
}
