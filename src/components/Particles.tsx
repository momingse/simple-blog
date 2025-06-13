import React, { FC, useCallback, useEffect, useRef } from "react";

type ParticlesProps = {
  className?: string;
  areaParticlesRatio: number;
  maxNumOfParticles?: number;
  minDistanceForConnection?: number;
  particlesColor?: string;
  connectionColor?: string;
  numOfGrids?: number;
  withNodesConnection?: boolean;
  withMouseConnection?: boolean;
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
  areaParticlesRatio = 9000,
  maxNumOfParticles = 1000,
  minDistanceForConnection = 200,
  particlesColor = "#9BA4B5",
  connectionColor = "#9BA4B5",
  numOfGrids = 10,
  withNodesConnection = true,
  withMouseConnection = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>(0);
  const mousePosRef = useRef<{ x: number; y: number } | null>(null);
  const gridSizeRef = useRef<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });
  const gridRef = useRef<Map<string, Particle[]>>(new Map());

  const initParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const availableParticels = Math.min(
      maxNumOfParticles,
      Math.floor((canvas.width * canvas.height) / areaParticlesRatio),
    );
    const numParticles = Math.floor(
      Math.random() * (availableParticels / 2) + availableParticels / 2,
    );

    // init particles
    particlesRef.current = Array.from({ length: numParticles }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      vx: (Math.random() * 2 - 1) * 0.3,
      vy: (Math.random() * 2 - 1) * 0.3,
    }));

    gridSizeRef.current = {
      width: canvas.width / numOfGrids,
      height: canvas.height / numOfGrids,
    };

    if (!withNodesConnection) return;
    // init grid with array in left to right, top to bottom order
    for (let i = 0; i < numOfGrids; i++) {
      for (let j = 0; j < numOfGrids; j++) {
        gridRef.current.set(`${i},${j}`, []);
      }
    }
    particlesRef.current.forEach((p) => {
      const key = `${Math.floor(p.x / gridSizeRef.current.width)},${Math.floor(
        p.y / gridSizeRef.current.height,
      )}`;

      gridRef.current.get(key)?.push(p);
    });
  }, [maxNumOfParticles, numOfGrids, withNodesConnection]);

  const render = useCallback(() => {
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

    if (!withNodesConnection) {
      animationFrameRef.current = window.requestAnimationFrame(render);
      return;
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

    // update grid
    for (const [key] of gridRef.current) {
      gridRef.current.get(key)!.length = 0;
    }

    particlesRef.current.forEach((p) => {
      const key = `${Math.floor(p.x / gridSizeRef.current.width)},${Math.floor(
        p.y / gridSizeRef.current.height,
      )}`;

      gridRef.current.set(key, gridRef.current.get(key) || []);
      gridRef.current.get(key)?.push(p);
    });

    const connection: {
      dist: number;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    }[] = [];

    // calculate connections
    // start with same grid
    for (const [_, p] of gridRef.current) {
      if (p.length <= 1) continue;
      for (let i = 0; i < p.length; i++) {
        for (let j = i + 1; j < p.length; j++) {
          const dx = p[i].x - p[j].x;
          const dy = p[i].y - p[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < minDistanceForConnection) {
            connection.push({
              dist,
              x1: p[i].x,
              y1: p[i].y,
              x2: p[j].x,
              y2: p[j].y,
            });
          }
        }
      }
    }

    // then neighbor grids
    const wdirs = Array.from(
      {
        length:
          Math.ceil(minDistanceForConnection / gridSizeRef.current.width) + 1,
      },
      (_, i) => i,
    );

    const hdirs = Array.from(
      {
        length:
          Math.ceil(minDistanceForConnection / gridSizeRef.current.height) + 1,
      },
      (_, i) => i,
    );

    for (const [key, p] of gridRef.current) {
      const [x, y] = key.split(",").map(Number);
      for (const dx of wdirs) {
        for (const dy of hdirs) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx;
          const ny = y + dy;
          const neighborKey = `${nx},${ny}`;
          const neighbor = gridRef.current.get(neighborKey);

          if (!neighbor) continue;
          for (const p1 of p) {
            for (const p2 of neighbor) {
              const dx = p1.x - p2.x;
              const dy = p1.y - p2.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < minDistanceForConnection) {
                connection.push({
                  dist,
                  x1: p1.x,
                  y1: p1.y,
                  x2: p2.x,
                  y2: p2.y,
                });
              }
            }
          }
        }
      }
    }

    // draw connections
    for (const { dist, x1, y1, x2, y2 } of connection) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = connectionColor;
      ctx.lineWidth = 0.5;
      ctx.globalAlpha = 1 - dist / minDistanceForConnection;
      ctx.stroke();
    }

    if (!withMouseConnection || !mousePosRef.current) {
      animationFrameRef.current = window.requestAnimationFrame(render);
      return;
    }
    // Connect particles to mouse
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

    ctx.globalAlpha = 1; // Reset alpha

    animationFrameRef.current = window.requestAnimationFrame(render);
  }, [
    particlesColor,
    connectionColor,
    minDistanceForConnection,
    withNodesConnection,
    withMouseConnection,
  ]);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(dpr, dpr);
    }

    gridSizeRef.current = {
      width: canvas.width / numOfGrids,
      height: canvas.height / numOfGrids,
    };
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mousePosRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  useEffect(() => {
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
  }, [resizeCanvas, handleMouseMove, initParticles, render]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed top-0 left-0 h-screen w-screen z-[-1] bg-transparent ${className || ""}`}
    />
  );
};

export default Particles;
