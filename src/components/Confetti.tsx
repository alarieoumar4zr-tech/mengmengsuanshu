import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  dx: number;
  dy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  shape: 'circle' | 'square' | 'heart' | 'triangle';
  opacity: number;
}

const PARTICLES_COLORS = [
  '#FFB7B2', // Soft pastel pink
  '#FFDAC1', // Cute melon orange
  '#E2F0CB', // Pastel tea green
  '#B5EAD7', // Mint green
  '#C7CEEA', // lavender blue
  '#FFC6FF', // Bubblegum purple
  '#BFFFBC', // Mild kiwi
  '#FF9AA2', // Gentle rose
];

interface ConfettiProps {
  trigger: number; // Increment this to trigger a fresh burst
}

export default function Confetti({ trigger }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  const spawnParticles = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.width;
    const height = canvas.height;

    // Burst particles from multiple source points:
    // Left side bottom, right side bottom, and some in the center of the viewport
    const sources = [
      { x: width * 0.1, y: height },
      { x: width * 0.9, y: height },
      { x: width * 0.5, y: height * 0.8 },
    ];

    const newParticles: Particle[] = [];

    sources.forEach((source) => {
      const count = 25 + Math.floor(Math.random() * 15);
      for (let i = 0; i < count; i++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * (Math.PI / 3); // upward arc
        const speed = 7 + Math.random() * 8;
        
        newParticles.push({
          x: source.x,
          y: source.y,
          dx: Math.cos(angle) * speed,
          dy: Math.sin(angle) * speed,
          size: 6 + Math.random() * 10,
          color: PARTICLES_COLORS[Math.floor(Math.random() * PARTICLES_COLORS.length)],
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.2,
          shape: ['circle', 'square', 'heart', 'triangle'][Math.floor(Math.random() * 4)] as any,
          opacity: 1,
        });
      }
    });

    particlesRef.current = [...particlesRef.current, ...newParticles].slice(0, 150); // limit to max 150 live particles
  };

  useEffect(() => {
    if (trigger > 0) {
      spawnParticles();
    }
  }, [trigger]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    const ctx = canvas.getContext('2d')!;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;

      const updatedParticles: Particle[] = [];

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        // Physics update
        p.x += p.dx;
        p.y += p.dy;
        p.dy += 0.25; // gravity
        p.dx *= 0.98; // horizontal friction
        p.rotation += p.rotationSpeed;
        p.opacity -= 0.015; // fade out

        if (p.opacity > 0 && p.y <= canvas.height + 20) {
          ctx.save();
          ctx.globalAlpha = p.opacity;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;

          ctx.beginPath();
          if (p.shape === 'circle') {
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          } else if (p.shape === 'triangle') {
            ctx.moveTo(0, -p.size / 2);
            ctx.lineTo(p.size / 2, p.size / 2);
            ctx.lineTo(-p.size / 2, p.size / 2);
            ctx.closePath();
            ctx.fill();
          } else if (p.shape === 'heart') {
            // Cute heart shape
            const d = p.size;
            ctx.moveTo(0, d / 4);
            ctx.bezierCurveTo(-d / 2, -d / 2, -d, 0, 0, d);
            ctx.bezierCurveTo(d, 0, d / 2, -d / 2, 0, d / 4);
            ctx.fill();
          } else {
            // Square/Rectangle
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          }

          ctx.restore();
          updatedParticles.push(p);
        }
      }

      particlesRef.current = updatedParticles;
      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      id="confetti-canvas"
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 transition-opacity duration-300"
    />
  );
}
