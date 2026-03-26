import { motion, useReducedMotion } from 'framer-motion';
import { AdvancedDNAAnimation } from './AdvancedDNAAnimation';

export function AmbientBackground({ variant = 'app' }) {
  const prefersReducedMotion = useReducedMotion();
  const isLanding = variant === 'landing';

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className={`absolute inset-0 ${isLanding ? 'landing-surface' : 'app-surface'}`} />
      <div className="grid-overlay" />
      <div className="scanline-overlay" />

      <motion.div
        className="ambient-orb ambient-orb-cyan"
        animate={prefersReducedMotion ? undefined : { x: [0, 24, -12, 0], y: [0, -24, 12, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="ambient-orb ambient-orb-emerald"
        animate={prefersReducedMotion ? undefined : { x: [0, -18, 14, 0], y: [0, 22, -16, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="ambient-orb ambient-orb-violet"
        animate={prefersReducedMotion ? undefined : { scale: [1, 1.08, 0.96, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="absolute inset-y-0 left-[12%] w-px bg-gradient-to-b from-transparent via-teal-500/20 to-transparent"
        animate={prefersReducedMotion ? undefined : { opacity: [0.18, 0.45, 0.18] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute inset-y-0 right-[18%] w-px bg-gradient-to-b from-transparent via-emerald-500/18 to-transparent"
        animate={prefersReducedMotion ? undefined : { opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      <AdvancedDNAAnimation />
    </div>
  );
}
