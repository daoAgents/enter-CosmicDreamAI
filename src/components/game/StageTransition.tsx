import { useEffect, useState } from "react";
import { GameStage, STAGE_NAMES } from "@/hooks/useGameState";
import { useTranslation } from "react-i18next";

interface StageTransitionProps {
  newStage: GameStage;
  onComplete: () => void;
}

const STAGE_COLORS: Record<GameStage, string> = {
  0: "hsl(260 80% 65%)",
  1: "hsl(260 80% 72%)",
  2: "hsl(200 85% 68%)",
  3: "hsl(160 75% 60%)",
  4: "hsl(45 90% 70%)",
};

const STAGE_QUOTES: Record<GameStage, { zh: string; en: string }> = {
  0: { zh: "无名，天地之始", en: "Nameless — the origin of heaven and earth" },
  1: { zh: "道生一", en: "The Tao begets the One" },
  2: { zh: "一生二", en: "The One begets the Two" },
  3: { zh: "二生三", en: "The Two begets the Three" },
  4: { zh: "三生万物", en: "The Three begets the ten thousand things" },
};

// Burst particles in 8 directions from crack line
const PARTICLES = Array.from({ length: 12 }, (_, i) => {
  const angle = (i / 12) * Math.PI * 2;
  const dist = 60 + Math.random() * 80;
  return {
    px: `${Math.cos(angle) * dist}px`,
    py: `${Math.sin(angle) * dist}px`,
    delay: Math.random() * 0.4,
    size: 3 + Math.random() * 5,
    duration: 0.6 + Math.random() * 0.6,
  };
});

// phase 0 = slam, 1 = hold, 2 = open, 3 = done
type Phase = 0 | 1 | 2 | 3;

export function StageTransition({ newStage, onComplete }: StageTransitionProps) {
  const { i18n } = useTranslation();
  const isZh = i18n.language === "zh";
  const [phase, setPhase] = useState<Phase>(0);
  const color = STAGE_COLORS[newStage];
  const stageInfo = STAGE_NAMES[newStage];
  const quote = STAGE_QUOTES[newStage];

  useEffect(() => {
    // Phase 0→1: panels slam together (400ms)
    const t1 = setTimeout(() => setPhase(1), 400);
    // Phase 1→2: show stage name, then open (1600ms total hold)
    const t2 = setTimeout(() => setPhase(2), 2000);
    // Phase 2→3: panels open, call complete (800ms later)
    const t3 = setTimeout(() => {
      setPhase(3);
      onComplete();
    }, 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  if (phase === 3) return null;

  const isSlammed = phase >= 1;
  const isOpening = phase === 2;

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9999 }}
    >
      {/* Top panel */}
      <div
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: "50%",
          background: `linear-gradient(180deg, hsl(240 22% 5%) 60%, hsl(240 22% 8%) 100%)`,
          animation: isOpening
            ? "panel-open-top 0.9s cubic-bezier(0.65, 0, 0.35, 1) forwards"
            : "panel-slam-top 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards",
          boxShadow: isSlammed ? `0 6px 60px ${color}` : "none",
          transition: "box-shadow 0.3s ease",
        }}
      >
        {/* Inner starfield texture */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at center bottom, hsl(260 40% 12% / 0.6) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Bottom panel */}
      <div
        style={{
          position: "absolute",
          bottom: 0, left: 0, right: 0,
          height: "50%",
          background: `linear-gradient(0deg, hsl(240 22% 5%) 60%, hsl(240 22% 8%) 100%)`,
          animation: isOpening
            ? "panel-open-bottom 0.9s cubic-bezier(0.65, 0, 0.35, 1) forwards"
            : "panel-slam-bottom 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards",
          boxShadow: isSlammed ? `0 -6px 60px ${color}` : "none",
          transition: "box-shadow 0.3s ease",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at center top, hsl(260 40% 12% / 0.6) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Crack glow line — only when slammed and not yet opening */}
      {phase === 1 && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 0, right: 0,
            transform: "translateY(-50%)",
            height: 6,
            background: `linear-gradient(90deg, transparent, ${color}, hsl(255 100% 95%), ${color}, transparent)`,
            animation: "crack-glow-expand 1.6s ease-in-out forwards",
            zIndex: 1,
          }}
        />
      )}

      {/* Burst particles from crack */}
      {phase === 1 && PARTICLES.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: "50%", left: "50%",
            width: p.size, height: p.size,
            borderRadius: "50%",
            background: color,
            boxShadow: `0 0 6px ${color}`,
            "--px": p.px,
            "--py": p.py,
            animation: `particle-burst ${p.duration}s cubic-bezier(0, 0.9, 0.57, 1) ${p.delay}s forwards`,
          } as React.CSSProperties}
        />
      ))}

      {/* Stage name + quote — shown during hold phase */}
      {phase === 1 && (
        <>
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translateX(-50%) translateY(-50%)",
              zIndex: 10,
              textAlign: "center",
              animation: "transition-title-reveal 1.6s cubic-bezier(0.4, 0, 0.2, 1) forwards",
              whiteSpace: "nowrap",
            }}
          >
            <div
              style={{
                fontFamily: "'Noto Serif SC', serif",
                fontSize: "clamp(1.6rem, 5vw, 3rem)",
                fontWeight: 300,
                letterSpacing: "0.3em",
                color: "hsl(255 100% 97%)",
                textShadow: `0 0 30px ${color}, 0 0 80px ${color}`,
              }}
            >
              {isZh ? stageInfo.zh : stageInfo.en}
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              top: "calc(50% + 3rem)",
              left: "50%",
              zIndex: 10,
              whiteSpace: "nowrap",
              animation: "transition-quote-reveal 1.6s ease forwards 0.2s",
            }}
          >
            <div
              style={{
                fontFamily: "'Noto Serif SC', serif",
                fontSize: "clamp(0.75rem, 2vw, 1rem)",
                fontStyle: "italic",
                color: color,
                textShadow: `0 0 20px ${color}`,
                letterSpacing: "0.15em",
                transform: "translateX(-50%)",
              }}
            >
              {isZh ? quote.zh : quote.en}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
