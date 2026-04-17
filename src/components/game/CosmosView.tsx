import { useMemo } from "react";
import { GameStage } from "@/hooks/useGameState";

interface CosmosViewProps {
  stage: GameStage;
  yin: number;
  yang: number;
  zhongqi: number;
}

export function CosmosView({ stage, yin, yang, zhongqi }: CosmosViewProps) {
  const zhongqiOpacity = useMemo(() => Math.min(zhongqi / 100, 1), [zhongqi]);
  const yinSize = useMemo(() => 40 + (yin / 100) * 20, [yin]);
  const yangSize = useMemo(() => 40 + (yang / 100) * 20, [yang]);

  return (
    <div className="relative flex items-center justify-center" style={{ width: 280, height: 280 }}>
      {/* Outer glow ring */}
      <div
        className="absolute rounded-full"
        style={{
          width: 280, height: 280,
          background: "radial-gradient(ellipse, transparent 55%, hsl(260 80% 60% / 0.06) 80%, transparent 100%)",
          animation: "nebula-drift 12s ease-in-out infinite",
        }}
      />

      {/* Stage 0: Void — single pulsing dot */}
      {stage === 0 && (
        <div className="relative flex items-center justify-center">
          <div
            style={{
              width: 8, height: 8,
              borderRadius: "50%",
              background: "hsl(260 80% 72%)",
              boxShadow: "0 0 20px hsl(260 80% 72% / 0.8), 0 0 60px hsl(260 80% 72% / 0.3)",
              animation: "pulse-glow 2s ease-in-out infinite",
            }}
          />
          <p
            className="absolute font-serif italic text-center"
            style={{
              top: "calc(50% + 28px)",
              color: "hsl(220 20% 55%)",
              fontSize: "0.7rem",
              letterSpacing: "0.15em",
              whiteSpace: "nowrap",
            }}
          >
            道可道，非常道
          </p>
        </div>
      )}

      {/* Stage 1: One — unified sphere */}
      {stage === 1 && (
        <div
          style={{
            width: 90, height: 90,
            borderRadius: "50%",
            background: "radial-gradient(ellipse at 35% 35%, hsl(45 90% 80%), hsl(260 80% 50%))",
            boxShadow: "0 0 40px hsl(260 80% 60% / 0.5), 0 0 80px hsl(200 90% 65% / 0.2)",
            animation: "pulse-glow 3s ease-in-out infinite",
          }}
        />
      )}

      {/* Stage 2: Yin-Yang duality */}
      {stage === 2 && (
        <div
          className="relative"
          style={{
            width: 140, height: 140,
            animation: "crystal-spin 20s linear infinite",
          }}
        >
          {/* Yang side */}
          <div
            style={{
              position: "absolute",
              width: yangSize, height: yangSize,
              borderRadius: "50%",
              background: "radial-gradient(ellipse at 40% 40%, hsl(45 95% 85%), hsl(45 80% 55%))",
              boxShadow: "0 0 30px hsl(45 90% 68% / 0.7)",
              top: "50%", left: "50%",
              transform: `translate(calc(-50% - ${yangSize * 0.45}px), -50%)`,
              transition: "all 0.5s ease",
            }}
          />
          {/* Yin side */}
          <div
            style={{
              position: "absolute",
              width: yinSize, height: yinSize,
              borderRadius: "50%",
              background: "radial-gradient(ellipse at 60% 60%, hsl(240 60% 35%), hsl(260 80% 15%))",
              boxShadow: "0 0 30px hsl(240 80% 40% / 0.6)",
              top: "50%", left: "50%",
              transform: `translate(calc(-50% + ${yinSize * 0.45}px), -50%)`,
              transition: "all 0.5s ease",
            }}
          />
          {/* Connector */}
          <div
            style={{
              position: "absolute",
              top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              width: 2, height: 80,
              background: "linear-gradient(180deg, hsl(45 90% 68% / 0.6), hsl(260 80% 60% / 0.6))",
              borderRadius: 1,
            }}
          />
        </div>
      )}

      {/* Stage 3: Three powers with Zhong Qi */}
      {stage === 3 && (
        <div className="relative" style={{ width: 160, height: 160 }}>
          {/* Yang — top right */}
          <div style={{
            position: "absolute", top: 10, right: 10,
            width: 55, height: 55, borderRadius: "50%",
            background: "radial-gradient(ellipse, hsl(45 90% 75%), hsl(45 70% 50%))",
            boxShadow: "0 0 25px hsl(45 90% 68% / 0.6)",
            animation: "float 5s ease-in-out infinite",
          }} />
          {/* Yin — bottom left */}
          <div style={{
            position: "absolute", bottom: 10, left: 10,
            width: 55, height: 55, borderRadius: "50%",
            background: "radial-gradient(ellipse, hsl(240 60% 40%), hsl(260 70% 20%))",
            boxShadow: "0 0 25px hsl(240 70% 50% / 0.5)",
            animation: "float-delayed 6s ease-in-out infinite",
          }} />
          {/* Zhong Qi — center */}
          <div style={{
            position: "absolute",
            top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: 50, height: 50, borderRadius: "50%",
            background: `radial-gradient(ellipse, hsl(160 70% 65%), hsl(160 60% 40%))`,
            boxShadow: `0 0 ${20 + zhongqiOpacity * 30}px hsl(160 70% 55% / ${0.3 + zhongqiOpacity * 0.5})`,
            opacity: 0.3 + zhongqiOpacity * 0.7,
            transition: "all 0.5s ease",
          }} />
        </div>
      )}

      {/* Stage 4: Ten thousand things */}
      {stage === 4 && (
        <div className="relative" style={{ width: 200, height: 200 }}>
          {/* Central core */}
          <div style={{
            position: "absolute",
            top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: 40, height: 40, borderRadius: "50%",
            background: "radial-gradient(ellipse, hsl(45 100% 90%), hsl(260 80% 60%))",
            boxShadow: "0 0 50px hsl(45 90% 75% / 0.8), 0 0 100px hsl(260 80% 60% / 0.3)",
            zIndex: 10,
          }} />
          {/* Orbiting particles */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
            <div
              key={angle}
              style={{
                position: "absolute",
                top: "50%", left: "50%",
                width: 8 + (i % 3) * 4, height: 8 + (i % 3) * 4,
                borderRadius: "50%",
                background: [
                  "hsl(45 90% 70%)",
                  "hsl(200 80% 60%)",
                  "hsl(320 70% 65%)",
                  "hsl(160 70% 60%)",
                  "hsl(260 80% 70%)",
                  "hsl(45 80% 65%)",
                  "hsl(200 70% 55%)",
                  "hsl(320 60% 60%)",
                ][i],
                transform: `translate(-50%, -50%) rotate(${angle}deg) translateX(${65 + (i % 2) * 20}px)`,
                animation: `crystal-spin ${8 + i * 1.5}s linear infinite ${i % 2 === 0 ? "" : "reverse"}`,
                boxShadow: `0 0 10px currentColor`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
