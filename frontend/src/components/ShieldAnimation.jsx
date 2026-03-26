import { HospitalIcon, CodeBracketIcon, BrainIcon, ShieldCheckIcon, DocumentTextIcon, ChartBarIcon, SparklesIcon, BoltIcon } from './Icons';

export function ShieldAnimation() {
  const icons = [
    { icon: <HospitalIcon className="w-5 h-5 text-neon-blue" />, color: 'shadow-neon-blue/20' },
    { icon: <CodeBracketIcon className="w-5 h-5 text-neon-cyan" />, color: 'shadow-neon-cyan/20' },
    { icon: <BrainIcon className="w-5 h-5 text-neon-blue" />, color: 'shadow-neon-blue/20' },
    { icon: <ShieldCheckIcon className="w-5 h-5 text-neon-cyan" />, color: 'shadow-neon-cyan/20' },
    { icon: <DocumentTextIcon className="w-5 h-5 text-neon-blue" />, color: 'shadow-neon-blue/20' },
    { icon: <ChartBarIcon className="w-5 h-5 text-neon-cyan" />, color: 'shadow-neon-cyan/20' },
    { icon: <SparklesIcon className="w-5 h-5 text-neon-blue" />, color: 'shadow-neon-blue/20' },
    { icon: <BoltIcon className="w-5 h-5 text-neon-cyan" />, color: 'shadow-neon-cyan/20' },
  ];

  return (
    <div className="relative w-72 h-72 md:w-96 md:h-96 mx-auto">
      {/* ── Central Hub ──────────────────────────────── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-[#0a1628] to-[#020617] border border-neon-blue/30 shadow-[0_0_40px_rgba(0,212,255,0.2)] flex items-center justify-center">
          <ShieldCheckIcon className="w-10 h-10 md:w-12 md:h-12 text-neon-blue drop-shadow-[0_0_8px_rgba(0,212,255,0.8)]" />
          {/* Inner pulse ring */}
          <div className="absolute inset-0 rounded-full border border-neon-blue/50 shield-pulse-aura" />
        </div>
      </div>

      {/* ── Orbit Rings ──────────────────────────────── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full rounded-full border border-white/5 border-dashed shield-ring-spin" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] rounded-full border border-white/5 border-dashed shield-ring-spin-reverse" />

      {/* ── Orbiting Nodes ───────────────────────────── */}
      {icons.map((item, i) => {
        // We have 8 items now, each gets an offset of 45 degrees
        // Using negative delay makes them start perfectly distributed at load time without waiting to pop in.
        // Animation is 20s total.
        const delay = - (i * 2.5);

        return (
          <div
            key={i}
            className="absolute top-1/2 left-1/2 w-10 h-10 -ml-5 -mt-5"
            style={{ transform: `rotate(${i * 45}deg)` }}
          >
            <div
              className={`w-full h-full rounded-xl bg-white/[0.03] backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-glow-sm ${item.color} shield-orbit-item`}
              style={{ animationDelay: `${delay}s` }}
            >
              {item.icon}
            </div>
          </div>
        );
      })}
    </div>
  );
}
