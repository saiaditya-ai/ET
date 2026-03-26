import { useEffect, useRef } from 'react';

// Medical codes data
const MEDICAL_CODES = [
  { code: 'E11.9', label: 'Type 2 Diabetes', color: '#5b9f99' },
  { code: 'I10', label: 'Hypertension', color: '#8fb4aa' },
  { code: '99213', label: 'Office Visit', color: '#7cab92' },
  { code: 'J44.9', label: 'COPD', color: '#d7b98a' },
  { code: 'M79.3', label: 'Myalgia', color: '#5b9f99' },
  { code: '99285', label: 'ED Visit', color: '#8fb4aa' },
  { code: 'F41.1', label: 'Anxiety', color: '#7cab92' },
  { code: '82947', label: 'Glucose Test', color: '#d7b98a' },
];

class FloatingCode {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.code = MEDICAL_CODES[Math.floor(Math.random() * MEDICAL_CODES.length)];
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * canvasHeight;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.02;
    this.scale = Math.random() * 0.5 + 0.8;
    this.opacity = Math.random() * 0.3 + 0.2;
    this.bobOffset = Math.random() * Math.PI * 2;
  }

  update(time) {
    // Drift
    this.x += this.vx;
    this.y += this.vy;

    // Wrap around
    if (this.x < -50) this.x = this.canvasWidth + 50;
    if (this.x > this.canvasWidth + 50) this.x = -50;
    if (this.y < -50) this.y = this.canvasHeight + 50;
    if (this.y > this.canvasHeight + 50) this.y = -50;

    // Bobbing motion
    this.y += Math.sin(time * 0.0005 + this.bobOffset) * 0.2;

    // Rotation
    this.rotation += this.rotationSpeed;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    // Draw glowing circle background
    const glowSize = 30 * this.scale;
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, glowSize);
    gradient.addColorStop(0, `${this.code.color}40`);
    gradient.addColorStop(0.7, `${this.code.color}20`);
    gradient.addColorStop(1, `${this.code.color}00`);
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, glowSize, 0, Math.PI * 2);
    ctx.fill();

    // Draw border circle
    ctx.strokeStyle = `${this.code.color}${Math.floor(this.opacity * 255 * 0.8).toString(16).padStart(2, '0')}`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, 20 * this.scale, 0, Math.PI * 2);
    ctx.stroke();

    // Draw code text
    ctx.fillStyle = this.code.color;
    ctx.globalAlpha = this.opacity;
    ctx.font = `bold ${12 * this.scale}px 'Courier New'`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.code.code, 0, -4);
    ctx.font = `${8 * this.scale}px 'Courier New'`;
    ctx.fillText(this.code.label.substring(0, 10), 0, 6);
    ctx.globalAlpha = 1;

    ctx.restore();
  }
}

export function FloatingMedicalCodes() {
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

    // Initialize codes with canvas dimensions
    const floatingCodes = [];
    for (let i = 0; i < 12; i++) {
      floatingCodes.push(new FloatingCode(canvas.width, canvas.height));
    }

    // Animation loop
    const animate = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      floatingCodes.forEach((code) => {
        code.update(time);
        code.draw(ctx);
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
      className="fixed inset-0 pointer-events-none opacity-40"
      style={{ background: 'transparent' }}
    />
  );
}
