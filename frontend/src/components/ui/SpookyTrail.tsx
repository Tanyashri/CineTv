import React, { useRef, useEffect } from 'react';

export interface SpookyTrailProps {
  active: boolean;
}

export const SpookyTrail: React.FC<SpookyTrailProps> = ({ active }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  const particlesRef = useRef<
    Array<{
      x: number;
      y: number;
      size: number;
      alpha: number;
      vx: number;
      vy: number;
    }>
  >([]);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    resizeCanvas();

    // Listen for resize to adjust canvas dimensions
    const resizeObserver = new ResizeObserver(() => resizeCanvas());
    const parent = canvas.parentElement;
    if (parent) resizeObserver.observe(parent);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.active = true;

      // Spawn particles on mouse move
      for (let i = 0; i < 2; i++) {
        particlesRef.current.push({
          x: mouseRef.current.x,
          y: mouseRef.current.y,
          size: Math.random() * 8 + 6, // Random particle sizes (6px to 14px)
          alpha: 1.0,
          vx: (Math.random() - 0.5) * 1.2,
          vy: (Math.random() - 0.5) * 1.2 - 0.5, // Slightly floating upwards
        });
      }
    };

    const handleMouseEnter = () => {
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    if (parent) {
      parent.addEventListener('mousemove', handleMouseMove);
      parent.addEventListener('mouseenter', handleMouseEnter);
      parent.addEventListener('mouseleave', handleMouseLeave);
    }

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        if (!p) continue;
        p.x += p.vx;
        p.y += p.vy;
        p.size *= 0.95; // Shrink particle size
        p.alpha -= 0.03; // Fade out opacity

        if (p.alpha <= 0 || p.size < 0.5) {
          particles.splice(i, 1);
          continue;
        }

        // Draw glowing red particle trail
        ctx.beginPath();
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        grad.addColorStop(0, `rgba(229, 9, 20, ${p.alpha})`); // CineTV primary red (#E50914)
        grad.addColorStop(1, 'rgba(229, 9, 20, 0)');
        ctx.fillStyle = grad;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      requestRef.current = requestAnimationFrame(tick);
    };

    requestRef.current = requestAnimationFrame(tick);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      resizeObserver.disconnect();
      if (parent) {
        parent.removeEventListener('mousemove', handleMouseMove);
        parent.removeEventListener('mouseenter', handleMouseEnter);
        parent.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />
  );
};
