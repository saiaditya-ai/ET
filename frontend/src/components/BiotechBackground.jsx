import { useEffect, useRef } from 'react';

// Molecule class defined outside useEffect
class Molecule {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.baseX = x;
    this.baseY = y;
    this.radius = Math.random() * 40 + 30;
    this.rotationSpeed = (Math.random() - 0.5) * 0.003;
    this.rotation = Math.random() * Math.PI * 2;
    this.atoms = this.generateAtoms();
    this.opacity = Math.random() * 0.3 + 0.1;
    this.bobSpeed = (Math.random() - 0.5) * 0.0005;
    this.bobOffset = Math.random() * Math.PI * 2;
  }

  generateAtoms() {
    const atoms = [];
    const atomCount = Math.random() < 0.5 ? 3 : 4;
    
    for (let i = 0; i < atomCount; i++) {
      const angle = (i / atomCount) * Math.PI * 2;
      atoms.push({
        angle: angle,
        distance: this.radius * 0.6,
        size: Math.random() * 4 + 2,
        color: ['#00f0ff', '#a855f7', '#10b981'][i % 3],
      });
    }
    
    return atoms;
  }

  update(time) {
    this.rotation += this.rotationSpeed;
    // Gentle bobbing motion
    this.y = this.baseY + Math.sin(time * 0.0002 + this.bobOffset) * 20;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.globalAlpha = this.opacity;

    // Draw central nucleus
    const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 8);
    coreGradient.addColorStop(0, 'rgba(0, 240, 255, 0.8)');
    coreGradient.addColorStop(1, 'rgba(0, 240, 255, 0.2)');
    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();

    // Draw connecting lines to atoms
    this.atoms.forEach((atom) => {
      const x = Math.cos(atom.angle) * atom.distance;
      const y = Math.sin(atom.angle) * atom.distance;

      // Connecting line with glow
      ctx.strokeStyle = `${atom.color}60`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(x, y);
      ctx.stroke();

      // Atom nucleus
      const atomGradient = ctx.createRadialGradient(x, y, 0, x, y, atom.size);
      atomGradient.addColorStop(0, `${atom.color}ff`);
      atomGradient.addColorStop(1, `${atom.color}40`);
      ctx.fillStyle = atomGradient;
      ctx.beginPath();
      ctx.arc(x, y, atom.size, 0, Math.PI * 2);
      ctx.fill();

      // Atom glow
      const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, atom.size * 2.5);
      glowGradient.addColorStop(0, `${atom.color}30`);
      glowGradient.addColorStop(1, `${atom.color}00`);
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(x, y, atom.size * 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalAlpha = 1;
    ctx.restore();
  }
}

export function BiotechBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Resize canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create molecules grid
    const molecules = [];
    const cols = Math.ceil(canvas.width / 300);
    const rows = Math.ceil(canvas.height / 300);

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        molecules.push(
          new Molecule(
            i * 300 + Math.random() * 100,
            j * 300 + Math.random() * 100
          )
        );
      }
    }

    // Animation loop
    const animate = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      molecules.forEach((molecule) => {
        molecule.update(time);
        molecule.draw(ctx, time);
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame((time) => animate(time));

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none opacity-30"
      style={{ background: 'transparent', zIndex: 1 }}
    />
  );
}
