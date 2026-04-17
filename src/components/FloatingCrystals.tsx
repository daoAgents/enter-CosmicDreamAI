import { useEffect, useRef } from "react";

interface Crystal {
  x: number;
  y: number;
  size: number;
  color: string;
  glowColor: string;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  rotSpeedX: number;
  rotSpeedY: number;
  rotSpeedZ: number;
  floatOffset: number;
  floatSpeed: number;
  opacity: number;
}

const CRYSTALS: Crystal[] = [
  {
    x: 8, y: 20, size: 60,
    color: "rgba(140, 100, 255, 0.15)", glowColor: "rgba(140, 100, 255, 0.3)",
    rotationX: 15, rotationY: 0, rotationZ: 25,
    rotSpeedX: 0.003, rotSpeedY: 0.008, rotSpeedZ: 0.002,
    floatOffset: 0, floatSpeed: 0.0008, opacity: 0.6,
  },
  {
    x: 88, y: 35, size: 45,
    color: "rgba(80, 180, 255, 0.12)", glowColor: "rgba(80, 180, 255, 0.25)",
    rotationX: -10, rotationY: 0, rotationZ: -15,
    rotSpeedX: 0.004, rotSpeedY: 0.006, rotSpeedZ: 0.003,
    floatOffset: Math.PI * 0.7, floatSpeed: 0.001, opacity: 0.5,
  },
  {
    x: 5, y: 65, size: 35,
    color: "rgba(255, 100, 180, 0.1)", glowColor: "rgba(255, 100, 180, 0.2)",
    rotationX: 20, rotationY: 0, rotationZ: 40,
    rotSpeedX: 0.005, rotSpeedY: 0.007, rotSpeedZ: 0.004,
    floatOffset: Math.PI * 1.3, floatSpeed: 0.0012, opacity: 0.45,
  },
  {
    x: 93, y: 72, size: 50,
    color: "rgba(200, 160, 255, 0.13)", glowColor: "rgba(200, 160, 255, 0.28)",
    rotationX: -5, rotationY: 0, rotationZ: -30,
    rotSpeedX: 0.003, rotSpeedY: 0.009, rotSpeedZ: 0.002,
    floatOffset: Math.PI * 0.4, floatSpeed: 0.0009, opacity: 0.55,
  },
  {
    x: 50, y: 5, size: 30,
    color: "rgba(100, 220, 220, 0.1)", glowColor: "rgba(100, 220, 220, 0.2)",
    rotationX: 10, rotationY: 0, rotationZ: 60,
    rotSpeedX: 0.006, rotSpeedY: 0.005, rotSpeedZ: 0.003,
    floatOffset: Math.PI * 1.8, floatSpeed: 0.0011, opacity: 0.4,
  },
];

export function FloatingCrystals() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef(0);
  const crystalsRef = useRef<Crystal[]>(CRYSTALS.map(c => ({ ...c })));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    function drawCrystal(
      ctx: CanvasRenderingContext2D,
      cx: number, cy: number,
      size: number,
      rotZ: number,
      color: string,
      glowColor: string,
      opacity: number
    ) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((rotZ * Math.PI) / 180);
      ctx.globalAlpha = opacity;

      // Glow
      const glow = ctx.createRadialGradient(0, 0, size * 0.1, 0, 0, size * 1.8);
      glow.addColorStop(0, glowColor);
      glow.addColorStop(1, "transparent");
      ctx.beginPath();
      ctx.arc(0, 0, size * 1.8, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      // Crystal shape (hexagonal prism illusion)
      const pts = 6;
      ctx.beginPath();
      for (let i = 0; i < pts; i++) {
        const angle = (i / pts) * Math.PI * 2 - Math.PI / 6;
        const r = i % 2 === 0 ? size : size * 0.65;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      // Inner shine lines
      ctx.strokeStyle = glowColor;
      ctx.lineWidth = 0.5;
      ctx.globalAlpha = opacity * 0.8;
      for (let i = 0; i < pts; i++) {
        const angle = (i / pts) * Math.PI * 2 - Math.PI / 6;
        const r = i % 2 === 0 ? size : size * 0.65;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
        ctx.stroke();
      }

      // Highlight facet
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.8);
      ctx.lineTo(size * 0.3, -size * 0.2);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fillStyle = `rgba(255, 255, 255, 0.08)`;
      ctx.fill();

      ctx.restore();
    }

    const animate = () => {
      if (!canvas || !ctx) return;
      timeRef.current += 0.016;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      crystalsRef.current.forEach((crystal) => {
        crystal.rotationX += crystal.rotSpeedX * 60;
        crystal.rotationY += crystal.rotSpeedY * 60;
        crystal.rotationZ += crystal.rotSpeedZ * 60;

        const floatY = Math.sin(timeRef.current * crystal.floatSpeed * 60 + crystal.floatOffset) * 20;
        const cx = (crystal.x / 100) * canvas.width;
        const cy = (crystal.y / 100) * canvas.height + floatY;

        const scaleZ = 0.85 + 0.15 * Math.cos((crystal.rotationX * Math.PI) / 180);
        const displaySize = crystal.size * scaleZ;

        drawCrystal(ctx, cx, cy, displaySize, crystal.rotationZ, crystal.color, crystal.glowColor, crystal.opacity);
      });

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}
