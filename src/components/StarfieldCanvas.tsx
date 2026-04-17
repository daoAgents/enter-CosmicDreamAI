import { useEffect, useRef, useCallback } from "react";

interface Star {
  x: number;
  y: number;
  z: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  color: string;
}

const STAR_COLORS = [
  "255, 255, 255",
  "180, 150, 255",
  "130, 210, 255",
  "255, 200, 150",
  "200, 150, 255",
];

export function StarfieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef(0);

  const initStars = useCallback((width: number, height: number) => {
    const count = Math.floor((width * height) / 4000);
    starsRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random() * 3 + 0.5,
      size: Math.random() * 2 + 0.3,
      opacity: Math.random() * 0.7 + 0.1,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinkleOffset: Math.random() * Math.PI * 2,
      color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
    }));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars(canvas.width, canvas.height);
    };

    resize();
    window.addEventListener("resize", resize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener("mousemove", handleMouseMove);

    const draw = () => {
      if (!canvas || !ctx) return;
      timeRef.current += 0.016;

      // Smooth mouse tracking
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.04;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.04;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      starsRef.current.forEach((star) => {
        // Parallax offset based on mouse and star depth
        const parallaxX = mx * star.z * 18;
        const parallaxY = my * star.z * 18;

        const sx = star.x + parallaxX;
        const sy = star.y + parallaxY;

        // Wrap around edges
        const wx = ((sx % canvas.width) + canvas.width) % canvas.width;
        const wy = ((sy % canvas.height) + canvas.height) % canvas.height;

        // Twinkling
        const twinkle = Math.sin(timeRef.current * star.twinkleSpeed * 60 + star.twinkleOffset);
        const opacity = star.opacity * (0.6 + 0.4 * twinkle);
        const size = star.size * (0.8 + 0.2 * twinkle);

        // Draw star with soft glow
        const gradient = ctx.createRadialGradient(wx, wy, 0, wx, wy, size * 3);
        gradient.addColorStop(0, `rgba(${star.color}, ${opacity})`);
        gradient.addColorStop(0.4, `rgba(${star.color}, ${opacity * 0.4})`);
        gradient.addColorStop(1, `rgba(${star.color}, 0)`);

        ctx.beginPath();
        ctx.arc(wx, wy, size * 3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Bright core
        ctx.beginPath();
        ctx.arc(wx, wy, size * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${star.color}, ${Math.min(opacity * 1.5, 1)})`;
        ctx.fill();
      });

      animFrameRef.current = requestAnimationFrame(draw);
    };

    animFrameRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [initStars]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
