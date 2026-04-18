import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { GameStage } from "@/hooks/useGameState";

interface CosmosViewProps {
  stage: GameStage;
  yin: number;
  yang: number;
  zhongqi: number;
  onTouch?: (resource: "yin" | "yang" | "zhongqi", amount: number) => void;
  onTriggerWuwei?: () => void;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
  color: string;
}

interface FloatText {
  id: number;
  x: number;
  y: number;
  label: string;
  color: string;
}

let _id = 0;
function nextId() { return ++_id; }

export function CosmosView({ stage, yin, yang, zhongqi, onTouch, onTriggerWuwei }: CosmosViewProps) {
  const zhongqiOpacity = useMemo(() => Math.min(zhongqi / 100, 1), [zhongqi]);
  const yinSize = useMemo(() => 40 + (yin / 100) * 20, [yin]);
  const yangSize = useMemo(() => 40 + (yang / 100) * 20, [yang]);

  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [floats, setFloats] = useState<FloatText[]>([]);
  const cooldownRef = useRef<Record<string, number>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Stage 2 drag state
  const [dragOrb, setDragOrb] = useState<"yin" | "yang" | null>(null);
  const dragStartRef = useRef<{ x: number; y: number; orbX: number; orbY: number } | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  function spawnRipple(x: number, y: number, color: string) {
    const id = nextId();
    setRipples(prev => [...prev, { id, x, y, color }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 650);
  }

  function spawnFloat(x: number, y: number, label: string, color: string) {
    const id = nextId();
    setFloats(prev => [...prev, { id, x, y, label, color }]);
    setTimeout(() => setFloats(prev => prev.filter(f => f.id !== id)), 850);
  }

  const touch = useCallback((
    key: string,
    resource: "yin" | "yang" | "zhongqi",
    amount: number,
    cx: number, cy: number,
    color: string,
    label: string,
    cooldownMs = 800,
  ) => {
    const now = Date.now();
    if ((cooldownRef.current[key] ?? 0) > now) return;
    cooldownRef.current[key] = now + cooldownMs;
    onTouch?.(resource, amount);
    spawnRipple(cx, cy, color);
    spawnFloat(cx, cy, label, color);
  }, [onTouch]);

  function getRelativePos(e: React.MouseEvent | React.TouchEvent): { x: number; y: number } {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  // Drag handlers (stage 2)
  function handleOrbMouseDown(orb: "yin" | "yang", e: React.MouseEvent) {
    if (stage !== 2) return;
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setDragOrb(orb);
    dragStartRef.current = { x: e.clientX, y: e.clientY, orbX: 0, orbY: 0 };
    setDragOffset({ x: 0, y: 0 });
  }

  useEffect(() => {
    if (!dragOrb) return;
    const MAX_DRAG = 60;

    function onMouseMove(e: MouseEvent) {
      if (!dragStartRef.current) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const clamped = Math.min(dist, MAX_DRAG);
      const angle = Math.atan2(dy, dx);
      setDragOffset({ x: Math.cos(angle) * clamped, y: Math.sin(angle) * clamped });
    }

    function onMouseUp(e: MouseEvent) {
      if (!dragStartRef.current || !dragOrb) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      const dist = Math.min(Math.sqrt(dx * dx + dy * dy), MAX_DRAG);
      const amount = Math.round((dist / MAX_DRAG) * 10);
      const rect = containerRef.current?.getBoundingClientRect();
      const cx = rect ? e.clientX - rect.left : 140;
      const cy = rect ? e.clientY - rect.top : 140;
      if (amount > 0) {
        const color = dragOrb === "yang" ? "hsl(45 90% 68%)" : "hsl(240 70% 65%)";
        const label = dragOrb === "yang" ? `+${amount} 阳` : `+${amount} 阴`;
        touch(`drag-${dragOrb}`, dragOrb, amount, cx, cy, color, label, 400);
      }
      setDragOrb(null);
      setDragOffset({ x: 0, y: 0 });
      dragStartRef.current = null;
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [dragOrb, touch]);

  const W = 280, H = 280, CX = W / 2, CY = H / 2;

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center select-none"
      style={{ width: W, height: H }}
    >
      {/* Ripple layer */}
      {ripples.map(r => (
        <div
          key={r.id}
          style={{
            position: "absolute",
            left: r.x, top: r.y,
            width: 40, height: 40,
            borderRadius: "50%",
            border: `2px solid ${r.color}`,
            pointerEvents: "none",
            animation: "ripple-expand 0.65s ease-out forwards",
            zIndex: 50,
          }}
        />
      ))}

      {/* Float text layer */}
      {floats.map(f => (
        <div
          key={f.id}
          style={{
            position: "absolute",
            left: f.x, top: f.y - 10,
            pointerEvents: "none",
            animation: "float-up-fade 0.85s ease-out forwards",
            zIndex: 50,
            fontSize: "0.78rem",
            fontWeight: 600,
            color: f.color,
            fontFamily: "Inter, sans-serif",
            whiteSpace: "nowrap",
            textShadow: `0 0 8px ${f.color}`,
          }}
        />
      ))}

      {/* Outer glow ring */}
      <div
        className="absolute rounded-full"
        style={{
          width: 280, height: 280,
          background: "radial-gradient(ellipse, transparent 55%, hsl(260 80% 60% / 0.06) 80%, transparent 100%)",
          animation: "nebula-drift 12s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />

      {/* ── Stage 0: Void — single pulsing dot ── */}
      {stage === 0 && (
        <div className="relative flex items-center justify-center">
          <div
            onClick={(e) => {
              const pos = getRelativePos(e);
              spawnRipple(pos.x, pos.y, "hsl(260 80% 72%)");
              onTriggerWuwei?.();
            }}
            style={{
              width: 24, height: 24,
              borderRadius: "50%",
              background: "hsl(260 80% 72%)",
              boxShadow: "0 0 20px hsl(260 80% 72% / 0.8), 0 0 60px hsl(260 80% 72% / 0.3)",
              animation: "pulse-glow 2s ease-in-out infinite",
              cursor: "pointer",
              zIndex: 10,
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
              pointerEvents: "none",
            }}
          >
            道可道，非常道
          </p>
        </div>
      )}

      {/* ── Stage 1: One — unified sphere ── */}
      {stage === 1 && (
        <div
          onClick={(e) => {
            const pos = getRelativePos(e);
            touch("unity", "yin", 4, pos.x, pos.y, "hsl(260 80% 72%)", "+4 阴", 1000);
            setTimeout(() => touch("unity-y", "yang", 4, pos.x, pos.y - 20, "hsl(45 90% 68%)", "+4 阳", 1000), 150);
          }}
          style={{
            width: 90, height: 90,
            borderRadius: "50%",
            background: "radial-gradient(ellipse at 35% 35%, hsl(45 90% 80%), hsl(260 80% 50%))",
            boxShadow: "0 0 40px hsl(260 80% 60% / 0.5), 0 0 80px hsl(200 90% 65% / 0.2)",
            animation: "pulse-glow 3s ease-in-out infinite",
            cursor: "pointer",
            transition: "transform 0.15s ease",
            zIndex: 10,
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1.08)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
        />
      )}

      {/* ── Stage 2: Yin-Yang duality (draggable) ── */}
      {stage === 2 && (
        <div
          className="relative"
          style={{
            width: 140, height: 140,
            animation: dragOrb ? "none" : "crystal-spin 20s linear infinite",
          }}
        >
          {/* Tension line when dragging */}
          {dragOrb && (
            <div style={{
              position: "absolute",
              top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              width: Math.sqrt(dragOffset.x ** 2 + dragOffset.y ** 2) * 2,
              height: 1,
              background: dragOrb === "yang"
                ? "linear-gradient(90deg, hsl(45 90% 68% / 0.3), hsl(45 90% 68% / 0.8))"
                : "linear-gradient(90deg, hsl(240 70% 65% / 0.3), hsl(240 70% 65% / 0.8))",
              transformOrigin: "left center",
              pointerEvents: "none",
            }} />
          )}

          {/* Yang orb */}
          <div
            onClick={(e) => {
              if (Math.abs(dragOffset.x) < 5 && Math.abs(dragOffset.y) < 5) {
                const pos = getRelativePos(e);
                touch("yang-click", "yang", 5, pos.x, pos.y, "hsl(45 90% 68%)", "+5 阳");
              }
            }}
            onMouseDown={(e) => handleOrbMouseDown("yang", e)}
            style={{
              position: "absolute",
              width: yangSize, height: yangSize,
              borderRadius: "50%",
              background: "radial-gradient(ellipse at 40% 40%, hsl(45 95% 85%), hsl(45 80% 55%))",
              boxShadow: `0 0 ${dragOrb === "yang" ? 50 : 30}px hsl(45 90% 68% / ${dragOrb === "yang" ? 0.9 : 0.7})`,
              top: "50%", left: "50%",
              transform: dragOrb === "yang"
                ? `translate(calc(-50% - ${yangSize * 0.45}px + ${dragOffset.x}px), calc(-50% + ${dragOffset.y}px))`
                : `translate(calc(-50% - ${yangSize * 0.45}px), -50%)`,
              transition: dragOrb === "yang" ? "none" : "all 0.5s ease",
              cursor: "grab",
              zIndex: dragOrb === "yang" ? 20 : 10,
            }}
          />

          {/* Yin orb */}
          <div
            onClick={(e) => {
              if (Math.abs(dragOffset.x) < 5 && Math.abs(dragOffset.y) < 5) {
                const pos = getRelativePos(e);
                touch("yin-click", "yin", 5, pos.x, pos.y, "hsl(240 70% 65%)", "+5 阴");
              }
            }}
            onMouseDown={(e) => handleOrbMouseDown("yin", e)}
            style={{
              position: "absolute",
              width: yinSize, height: yinSize,
              borderRadius: "50%",
              background: "radial-gradient(ellipse at 60% 60%, hsl(240 60% 35%), hsl(260 80% 15%))",
              boxShadow: `0 0 ${dragOrb === "yin" ? 50 : 30}px hsl(240 80% 40% / ${dragOrb === "yin" ? 0.8 : 0.6})`,
              top: "50%", left: "50%",
              transform: dragOrb === "yin"
                ? `translate(calc(-50% + ${yinSize * 0.45}px + ${dragOffset.x}px), calc(-50% + ${dragOffset.y}px))`
                : `translate(calc(-50% + ${yinSize * 0.45}px), -50%)`,
              transition: dragOrb === "yin" ? "none" : "all 0.5s ease",
              cursor: "grab",
              zIndex: dragOrb === "yin" ? 20 : 10,
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
              pointerEvents: "none",
            }}
          />

          {/* Drag hint on first mount */}
          <p style={{
            position: "absolute",
            bottom: -28, left: "50%",
            transform: "translateX(-50%)",
            fontSize: "0.6rem",
            color: "hsl(220 15% 38%)",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            letterSpacing: "0.05em",
          }}>
            点击 / 拖拽
          </p>
        </div>
      )}

      {/* ── Stage 3: Three powers with Zhong Qi ── */}
      {stage === 3 && (
        <div className="relative" style={{ width: 160, height: 160 }}>
          {/* Yang — top right */}
          <div
            onClick={(e) => {
              const pos = getRelativePos(e);
              touch("yang3", "yang", 3, pos.x, pos.y, "hsl(45 90% 68%)", "+3 阳");
            }}
            style={{
              position: "absolute", top: 10, right: 10,
              width: 55, height: 55, borderRadius: "50%",
              background: "radial-gradient(ellipse, hsl(45 90% 75%), hsl(45 70% 50%))",
              boxShadow: "0 0 25px hsl(45 90% 68% / 0.6)",
              animation: "float 5s ease-in-out infinite",
              cursor: "pointer",
              transition: "filter 0.15s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.filter = "brightness(1.3)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.filter = ""; }}
          />
          {/* Yin — bottom left */}
          <div
            onClick={(e) => {
              const pos = getRelativePos(e);
              touch("yin3", "yin", 3, pos.x, pos.y, "hsl(240 70% 65%)", "+3 阴");
            }}
            style={{
              position: "absolute", bottom: 10, left: 10,
              width: 55, height: 55, borderRadius: "50%",
              background: "radial-gradient(ellipse, hsl(240 60% 40%), hsl(260 70% 20%))",
              boxShadow: "0 0 25px hsl(240 70% 50% / 0.5)",
              animation: "float-delayed 6s ease-in-out infinite",
              cursor: "pointer",
              transition: "filter 0.15s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.filter = "brightness(1.3)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.filter = ""; }}
          />
          {/* Zhong Qi — center */}
          <div
            onClick={(e) => {
              const pos = getRelativePos(e);
              touch("zhong3", "zhongqi", 2, pos.x, pos.y, "hsl(160 70% 58%)", "+2 中气");
            }}
            style={{
              position: "absolute",
              top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              width: 50, height: 50, borderRadius: "50%",
              background: "radial-gradient(ellipse, hsl(160 70% 65%), hsl(160 60% 40%))",
              boxShadow: `0 0 ${20 + zhongqiOpacity * 30}px hsl(160 70% 55% / ${0.3 + zhongqiOpacity * 0.5})`,
              opacity: 0.3 + zhongqiOpacity * 0.7,
              transition: "all 0.5s ease",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.filter = "brightness(1.4)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.filter = ""; }}
          />
        </div>
      )}

      {/* ── Stage 4: Ten thousand things ── */}
      {stage === 4 && (
        <div className="relative" style={{ width: 200, height: 200 }}>
          {/* Central core */}
          <div
            onClick={(e) => {
              const pos = getRelativePos(e);
              const r = Math.random() > 0.5 ? "yin" : "yang";
              touch("core4", r, 2, pos.x, pos.y, "hsl(45 100% 80%)", r === "yin" ? "+2 阴" : "+2 阳", 600);
            }}
            style={{
              position: "absolute",
              top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              width: 40, height: 40, borderRadius: "50%",
              background: "radial-gradient(ellipse, hsl(45 100% 90%), hsl(260 80% 60%))",
              boxShadow: "0 0 50px hsl(45 90% 75% / 0.8), 0 0 100px hsl(260 80% 60% / 0.3)",
              zIndex: 10,
              cursor: "pointer",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translate(-50%, -50%) scale(1.2)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "translate(-50%, -50%) scale(1)"; }}
          />
          {/* Orbiting particles */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
            const colors = [
              "hsl(45 90% 70%)", "hsl(200 80% 60%)", "hsl(320 70% 65%)", "hsl(160 70% 60%)",
              "hsl(260 80% 70%)", "hsl(45 80% 65%)", "hsl(200 70% 55%)", "hsl(320 60% 60%)",
            ];
            const resources: Array<"yin" | "yang"> = ["yang", "yin", "yang", "yin", "yang", "yin", "yang", "yin"];
            return (
              <div
                key={angle}
                onClick={(e) => {
                  const pos = getRelativePos(e);
                  touch(`particle-${i}`, resources[i], 1, pos.x, pos.y, colors[i], resources[i] === "yang" ? "+1 阳" : "+1 阴", 500);
                }}
                style={{
                  position: "absolute",
                  top: "50%", left: "50%",
                  width: 8 + (i % 3) * 4, height: 8 + (i % 3) * 4,
                  borderRadius: "50%",
                  background: colors[i],
                  transform: `translate(-50%, -50%) rotate(${angle}deg) translateX(${65 + (i % 2) * 20}px)`,
                  animation: `crystal-spin ${8 + i * 1.5}s linear infinite ${i % 2 === 0 ? "" : "reverse"}`,
                  boxShadow: `0 0 10px ${colors[i]}`,
                  cursor: "pointer",
                  zIndex: 5,
                }}
              />
            );
          })}
        </div>
      )}

      {/* Float text (rendered on top of everything) */}
      {floats.map(f => (
        <div
          key={f.id}
          style={{
            position: "absolute",
            left: f.x,
            top: f.y - 10,
            pointerEvents: "none",
            animation: "float-up-fade 0.85s ease-out forwards",
            zIndex: 100,
            fontSize: "0.78rem",
            fontWeight: 700,
            color: f.color,
            fontFamily: "Inter, sans-serif",
            whiteSpace: "nowrap",
            textShadow: `0 0 10px ${f.color}`,
            transform: "translateX(-50%)",
          }}
        >
          {f.label}
        </div>
      ))}
    </div>
  );
}
