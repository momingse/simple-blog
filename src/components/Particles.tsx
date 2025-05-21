import React, { FC, useEffect, useRef } from "react";

type ParticlesProps = {
  className?: string;
  maxNumOfParticles?: number;
  minDistanceForConnection?: number;
  particlesColor?: string;
  connectionColor?: string;
};

type Particle = {
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
};

const Particles: FC<ParticlesProps> = ({
  className,
  maxNumOfParticles = 200,
  minDistanceForConnection = 200,
  particlesColor = "#9BA4B5",
  connectionColor = "#9BA4B5",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>(0);
  const mousePosRef = useRef<{ x: number; y: number } | null>(null);

  const initParticles = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const numParticles = Math.floor(
      Math.random() * (maxNumOfParticles / 2) + maxNumOfParticles / 2,
    );

    particlesRef.current = Array.from({ length: numParticles }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      vx: (Math.random() * 2 - 1) * 0.3,
      vy: (Math.random() * 2 - 1) * 0.3,
    }));
  };

  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw particles
    for (const p of particlesRef.current) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, 2 * Math.PI);
      ctx.fillStyle = particlesColor;
      ctx.fill();
    }

    // Move particles
    for (const p of particlesRef.current) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x > canvas.width) p.x -= canvas.width;
      if (p.x < 0) p.x += canvas.width;
      if (p.y > canvas.height) p.y -= canvas.height;
      if (p.y < 0) p.y += canvas.height;
    }

    // Connect nearby particles
    for (let i = 0; i < particlesRef.current.length; i++) {
      for (let j = i + 1; j < particlesRef.current.length; j++) {
        const a = particlesRef.current[i];
        const b = particlesRef.current[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDistanceForConnection) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = connectionColor;
          ctx.lineWidth = 0.5;
          ctx.globalAlpha = 1 - dist / minDistanceForConnection;
          ctx.stroke();
        }
      }
    }

    // Connect particles to mouse
    if (mousePosRef.current) {
      for (const p of particlesRef.current) {
        const dx = p.x - mousePosRef.current.x;
        const dy = p.y - mousePosRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDistanceForConnection) {
          ctx.beginPath();
          ctx.moveTo(mousePosRef.current.x, mousePosRef.current.y);
          ctx.lineTo(p.x, p.y);
          ctx.strokeStyle = connectionColor;
          ctx.lineWidth = 0.5;
          ctx.globalAlpha = 1 - dist / minDistanceForConnection;
          ctx.stroke();
        }
      }
    }

    ctx.globalAlpha = 1; // Reset alpha

    animationFrameRef.current = window.requestAnimationFrame(render);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", handleMouseMove);

    resizeCanvas();
    initParticles();
    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [maxNumOfParticles, minDistanceForConnection]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed top-0 left-0 h-screen w-screen z-[-1] bg-transparent ${className || ""}`}
    />
  );
};

export default Particles;
