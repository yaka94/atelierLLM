import { useEffect, useRef } from 'react';

interface AmbientCanvasProps {
  active: boolean;
}

const PARTICLE_COUNT = 38;

/**
 * Isolated Canvas2D ambient starlight & golden dust motes layer.
 * Uses a pre-allocated typed pool (zero per-frame GC) and clamped dt <= 0.05s.
 */
export function AmbientCanvas({ active }: AmbientCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const xs = new Float32Array(PARTICLE_COUNT);
    const ys = new Float32Array(PARTICLE_COUNT);
    const vxs = new Float32Array(PARTICLE_COUNT);
    const vys = new Float32Array(PARTICLE_COUNT);
    const radii = new Float32Array(PARTICLE_COUNT);
    const phases = new Float32Array(PARTICLE_COUNT);

    let width = canvas.clientWidth || window.innerWidth;
    let height = canvas.clientHeight || window.innerHeight;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(320, rect.width || window.innerWidth);
      height = Math.max(240, rect.height || window.innerHeight);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      xs[i] = Math.random() * width;
      ys[i] = Math.random() * height;
      vxs[i] = (Math.random() - 0.5) * 14;
      vys[i] = -6 - Math.random() * 14;
      radii[i] = 1.2 + Math.random() * 2.4;
      phases[i] = Math.random() * Math.PI * 2;
    }

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    let rafId = 0;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        xs[i] += vxs[i] * dt;
        ys[i] += vys[i] * dt;
        phases[i] += dt * 1.9;

        if (ys[i] < -10) {
          ys[i] = height + 8;
          xs[i] = Math.random() * width;
        }
        if (xs[i] < -10) xs[i] = width + 8;
        if (xs[i] > width + 10) xs[i] = -8;

        const alpha = 0.25 + 0.45 * (0.5 + 0.5 * Math.sin(phases[i]));
        ctx.beginPath();
        ctx.fillStyle = i % 3 === 0 ? `rgba(186, 230, 253, ${alpha})` : `rgba(253, 224, 130, ${alpha})`;
        ctx.arc(xs[i], ys[i], radii[i], 0, Math.PI * 2);
        ctx.fill();
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
