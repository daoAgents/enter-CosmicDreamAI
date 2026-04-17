export function NebulaBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Base deep space — slightly lighter */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse at 50% 50%, hsl(240 22% 11%), hsl(240 26% 6%) 70%)"
      }} />

      {/* Nebula clouds — increased opacity for visibility */}
      <div
        className="absolute animate-nebula"
        style={{
          top: "-20%", left: "-15%",
          width: "70%", height: "70%",
          background: "radial-gradient(ellipse at center, hsl(260 80% 40% / 0.30), hsl(260 60% 28% / 0.14), transparent 65%)",
          filter: "blur(60px)",
        }}
      />
      <div
        className="absolute animate-nebula"
        style={{
          animationDelay: "-8s",
          top: "30%", right: "-20%",
          width: "65%", height: "60%",
          background: "radial-gradient(ellipse at center, hsl(200 80% 35% / 0.26), hsl(200 60% 22% / 0.12), transparent 65%)",
          filter: "blur(70px)",
        }}
      />
      <div
        className="absolute animate-nebula"
        style={{
          animationDelay: "-14s",
          bottom: "-10%", left: "20%",
          width: "60%", height: "55%",
          background: "radial-gradient(ellipse at center, hsl(320 60% 32% / 0.22), hsl(320 50% 20% / 0.10), transparent 65%)",
          filter: "blur(80px)",
        }}
      />
      <div
        className="absolute"
        style={{
          top: "15%", left: "35%",
          width: "40%", height: "40%",
          background: "radial-gradient(ellipse at center, hsl(260 80% 30% / 0.18), transparent 70%)",
          filter: "blur(50px)",
        }}
      />

      {/* Lighter vignette — reduced opacity */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse at 50% 50%, transparent 45%, hsl(240 28% 4% / 0.5) 100%)"
      }} />
    </div>
  );
}
