# Optimizing React Canvas Particles with Divide & Conquer

---

date: 21/05/2025
topics: react javascript

---

## Background

Recently, I was watching videos of people playing with particle effects using Canvas, and it inspired me to add a similar effect to my blog. Most of the examples I found were a bit too fancy and distracted from the content. I wanted something less distracting, making me remember a common animated background. It's hard to describe, but if you search for "JS animated background" on YouTube, you'll see many tutorials for it. Even Vanta.js, one of the top Google results, has a "Net" type animated background as one of its demos. How common is it? Never mind\! I decided to just build it for my blog because it's not too difficult and would make for a good blog post.

## How it's Formed

Briefly, this effect creates a "Net" form with **points** and **connections** between them. Based on this, you could add things like point motion, connection opacity based on distance, or even a 3D view of the net (which Vanta.js does in its demo). I'm keeping it simple: just moving points and variable connection opacity for a cool, subtle 3D look. (Definitely not because I'm lazy\!)

## Simple Implementation

Here's an example using React with Canvas (copied directly from my blog's repository):

```javascript
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
```

We use `useRef` to store data related to canvas rendering. In `useEffect`, we set up the canvas, initialize the particles, and start the animation loop. It's quite simple: just initialize particles with random positions and velocities, then draw them and their connections. For responsiveness, we add a resize listener to adjust the canvas. We also add a mouse listener to connect the mouse position to nearby particles. Since there are only about 200 points, and this is mostly a static website, it doesn't need a lot of resources. But, as any good computer scientist knows, we love optimizing things\! So, let's do it.

---

## Optimizing

The initial connection drawing is an $O(n^2)$ operation, which can be improved. We can use a **Divide and Conquer** approach(I was just bored and wanted to try an algorithm from a collision detection video). Like most Divide and Conquer algorithms, we need to divide the problem into parts and then combine the results.

### 1\. Divide into Grids

Split the screen into an $x \\times y$ grid. Use a `Map` (or hashmap) in JavaScript to store a list of points in each grid. Update this list for each frame as the points move. This gives us a rough location for each point. Then, we can calculate the distance between two points in the same grid.

### 2\. Neighboring Grids

Besides connections within the same grid, points can also connect to neighboring grids. For example, if a point is in grid $(1, 1)$, it could potentially connect to points in grids $(0, 0)$, $(0, 1)$, $(0, 2)$, $(1, 0)$, $(1, 1)$, $(1, 2)$, $(2, 0)$, $(2, 1)$, and $(2, 2)$. We calculate the distance between two points in neighboring grids the same way as we do for points within the same grid. Similar to dynamic programming, we only need to consider the right and bottom grids when starting from the top-left to avoid duplicate connections. Here's a sample code snippet:

```javascript
const dirs = [0, 1];

for (const [key, p] of gridRef.current) {
  const [x, y] = key.split(",").map(Number);
  for (const dx of dirs) {
    for (const dy of dirs) {
      if (dx === 0 && dy === 0) continue;

      const nx = x + dx;
      const ny = y + dy;
      const neighborKey = `${nx},${ny}`;
      const neighbor = gridRef.current.get(neighborKey);

      if (!neighbor) continue;

      // check dist
      // draw connection
    }
  }
}
```

### 3\. Merge the Results

Based on the results from steps 1 and 2, we can merge the connections into a single list. Then, we can draw all the connections without duplicates.

Previously, drawing connections was an $O(n^2)$ operation. Now, we use $O(x * y)$ to clear and update the grids, and for the average case, we use $O(n * (n / (x * y)) * 9)$ because we divide all particles into grids (so each has roughly $n / (x * y)$ points) and we check four grids (one is self and three are neighbors). Therefore, the final complexity is approximately $O(n^2 / (x * y))$. As you can see, when $x$ and $y$ are large, the processing becomes much faster, essentially converting space complexity to time complexity. The worst case is when all particles end up in a single grid, bringing us back to $O(n^2)$.

---

Here's the final code, with some React optimizations:

```javascript
import React, { FC, useCallback, useEffect, useRef } from "react";

type ParticlesProps = {
  className?: string;
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
  maxNumOfParticles = 200,
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

    const numParticles = Math.floor(
      Math.random() * (maxNumOfParticles / 2) + maxNumOfParticles / 2,
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
      gridRef.current.set(key, []);
    }

    particlesRef.current.forEach((p, index) => {
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
    for (const [key, p] of gridRef.current) {
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
  }, [numOfGrids]); // Added numOfGrids to dependency array

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
```

I tested the performance with 1000 particles, a `minDistanceForConnection` of 200, and `numOfGrids` set to 10 (both $x$ and $y$). As expected, it improved from roughly 3.xx ms to 2.xx ms, a gain of about 1 ms\! It's a small improvement, even with relatively small data, so I'd say it's a success. We're done here\!
