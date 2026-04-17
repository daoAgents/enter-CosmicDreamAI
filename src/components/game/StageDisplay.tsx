import { GameStage, STAGE_NAMES, STAGE_THRESHOLDS } from "@/hooks/useGameState";

interface StageDisplayProps {
  stage: GameStage;
  totalEvents: number;
  zhongqi: number;
  stageEvents: number;
}

const STAGE_COLORS: Record<GameStage, string> = {
  0: "hsl(260 60% 60%)",
  1: "hsl(45 80% 65%)",
  2: "hsl(200 70% 65%)",
  3: "hsl(160 65% 58%)",
  4: "hsl(320 65% 65%)",
};

export function StageDisplay({ stage, zhongqi, stageEvents }: StageDisplayProps) {
  const info = STAGE_NAMES[stage];
  const color = STAGE_COLORS[stage];
  const threshold = STAGE_THRESHOLDS[stage];
  const isMaxStage = stage === 4;

  const zhongqiProgress = threshold ? Math.min((zhongqi / threshold.zhongqi) * 100, 100) : 100;
  const eventsProgress = threshold ? Math.min((stageEvents / Math.max(threshold.events, 1)) * 100, 100) : 100;

  return (
    <div className="text-center">
      {/* Stage number */}
      <div className="flex items-center justify-center gap-3 mb-2">
        {[0, 1, 2, 3, 4].map((s) => (
          <div
            key={s}
            style={{
              width: s === stage ? 32 : 8,
              height: 4,
              borderRadius: 2,
              background: s <= stage ? color : "hsl(240 20% 20%)",
              transition: "all 0.6s ease",
              opacity: s < stage ? 0.5 : 1,
            }}
          />
        ))}
      </div>

      {/* Stage name */}
      <h2
        className="font-serif mb-1"
        style={{
          fontSize: "clamp(1.4rem, 4vw, 2rem)",
          fontWeight: 300,
          color,
          textShadow: `0 0 30px ${color}55`,
          transition: "all 0.8s ease",
          letterSpacing: "0.05em",
        }}
      >
        {info.zh}
      </h2>
      <p
        className="font-serif italic text-sm"
        style={{ color: "hsl(220 15% 55%)", letterSpacing: "0.05em" }}
      >
        {info.en}
      </p>
      <p
        className="text-xs mt-1"
        style={{ color: "hsl(220 15% 40%)", fontFamily: "Inter, sans-serif", letterSpacing: "0.1em" }}
      >
        {info.desc}
      </p>

      {/* Progress to next stage */}
      {!isMaxStage && threshold && (
        <div className="mt-3 flex gap-3 justify-center">
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs" style={{ color: "hsl(160 60% 45%)", fontFamily: "Inter, sans-serif" }}>
              中气 {Math.floor(zhongqi)}/{threshold.zhongqi}
            </span>
            <div
              style={{
                width: 80, height: 3, borderRadius: 2,
                background: "hsl(160 30% 15%)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${zhongqiProgress}%`,
                  background: "linear-gradient(90deg, hsl(160 60% 40%), hsl(160 70% 58%))",
                  borderRadius: 2,
                  transition: "width 0.5s ease",
                }}
              />
            </div>
          </div>
          {threshold.events > 0 && (
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs" style={{ color: "hsl(260 60% 55%)", fontFamily: "Inter, sans-serif" }}>
                化生 {stageEvents}/{threshold.events}
              </span>
              <div
                style={{
                  width: 80, height: 3, borderRadius: 2,
                  background: "hsl(260 30% 15%)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${eventsProgress}%`,
                    background: "linear-gradient(90deg, hsl(260 60% 40%), hsl(260 80% 65%))",
                    borderRadius: 2,
                    transition: "width 0.5s ease",
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {isMaxStage && (
        <p className="mt-2 text-xs font-serif italic" style={{ color }}>
          万物化育，道德永恒
        </p>
      )}
    </div>
  );
}
