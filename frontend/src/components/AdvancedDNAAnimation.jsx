import { useEffect, useRef } from 'react';

class GenomeRail {
  constructor(x, y, height, scale, accent) {
    this.x = x;
    this.y = y;
    this.height = height;
    this.scale = scale;
    this.accent = accent;
    this.phase = Math.random() * Math.PI * 2;
    this.speed = 0.00045 + Math.random() * 0.00035;
    this.offset = Math.random() * 80;
  }

  draw(context, time) {
    const pulse = (time * this.speed + this.phase) % 1;
    const top = this.y - this.height / 2;
    const bottom = this.y + this.height / 2;
    const left = this.x - 28 * this.scale;
    const right = this.x + 28 * this.scale;
    const activeY = top + pulse * this.height;

    context.save();
    context.globalAlpha = 0.24;

    const railGradient = context.createLinearGradient(this.x, top, this.x, bottom);
    railGradient.addColorStop(0, 'rgba(34, 211, 238, 0)');
    railGradient.addColorStop(0.18, `${this.accent}55`);
    railGradient.addColorStop(0.5, `${this.accent}88`);
    railGradient.addColorStop(0.82, `${this.accent}55`);
    railGradient.addColorStop(1, 'rgba(34, 211, 238, 0)');

    context.lineWidth = 1.4;
    context.strokeStyle = railGradient;

    context.beginPath();
    context.moveTo(left, top);
    context.lineTo(left, bottom);
    context.moveTo(right, top);
    context.lineTo(right, bottom);
    context.stroke();

    for (let rung = 0; rung <= 10; rung += 1) {
      const progress = rung / 10;
      const currentY = top + progress * this.height;
      const rungWidth = (12 + Math.sin(progress * Math.PI * 3 + this.phase) * 7) * this.scale;

      const rungGradient = context.createLinearGradient(left, currentY, right, currentY);
      rungGradient.addColorStop(0, `${this.accent}00`);
      rungGradient.addColorStop(0.5, `${this.accent}44`);
      rungGradient.addColorStop(1, `${this.accent}00`);

      context.strokeStyle = rungGradient;
      context.beginPath();
      context.moveTo(this.x - rungWidth, currentY);
      context.lineTo(this.x + rungWidth, currentY);
      context.stroke();

      context.fillStyle = `${this.accent}66`;
      context.beginPath();
      context.arc(left, currentY, 2.4 * this.scale, 0, Math.PI * 2);
      context.arc(right, currentY, 2.4 * this.scale, 0, Math.PI * 2);
      context.fill();
    }

    const glow = context.createRadialGradient(this.x, activeY, 0, this.x, activeY, 48 * this.scale);
    glow.addColorStop(0, `${this.accent}88`);
    glow.addColorStop(0.45, `${this.accent}22`);
    glow.addColorStop(1, `${this.accent}00`);
    context.fillStyle = glow;
    context.beginPath();
    context.arc(this.x, activeY, 48 * this.scale, 0, Math.PI * 2);
    context.fill();

    context.strokeStyle = `${this.accent}bb`;
    context.lineWidth = 2.4;
    context.beginPath();
    context.moveTo(left - 6 * this.scale, activeY);
    context.lineTo(right + 6 * this.scale, activeY);
    context.stroke();

    context.fillStyle = `${this.accent}dd`;
    context.beginPath();
    context.arc(left, activeY, 4.2 * this.scale, 0, Math.PI * 2);
    context.arc(right, activeY, 4.2 * this.scale, 0, Math.PI * 2);
    context.fill();

    for (let i = 0; i < 4; i += 1) {
      const tickY = top + ((i + 0.5) / 4) * this.height + Math.sin(time * this.speed * 700 + i + this.phase) * 6;
      const boxX = i % 2 === 0 ? right + 22 * this.scale : left - 52 * this.scale;
      const boxWidth = 24 * this.scale;
      const boxHeight = 10 * this.scale;
      context.strokeStyle = `${this.accent}33`;
      context.strokeRect(boxX, tickY - boxHeight / 2, boxWidth, boxHeight);
      context.beginPath();
      context.moveTo(i % 2 === 0 ? right : left, tickY);
      context.lineTo(i % 2 === 0 ? boxX : boxX + boxWidth, tickY);
      context.stroke();
    }

    context.restore();
  }
}

export function AdvancedDNAAnimation() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    const context = canvas.getContext('2d');
    let animationFrameId = 0;
    let rails = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      rails = [
        new GenomeRail(canvas.width * 0.16, canvas.height * 0.28, canvas.height * 0.34, 0.95, '#5b9f99'),
        new GenomeRail(canvas.width * 0.82, canvas.height * 0.4, canvas.height * 0.28, 0.8, '#7cab92'),
        new GenomeRail(canvas.width * 0.58, canvas.height * 0.78, canvas.height * 0.22, 0.64, '#8dbab2'),
      ];
    };

    const animate = (time) => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      rails.forEach((rail) => rail.draw(context, time));
      animationFrameId = window.requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener('resize', resize);
    animationFrameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-[1] opacity-90" aria-hidden="true" />;
}
