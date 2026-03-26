import { motion } from 'framer-motion';

export function ConfidenceBadge({ confidence = 0, size = 'md' }) {
  const percentage = Math.round(confidence * 100);
  const ringSize = size === 'lg' ? 'h-28 w-28' : size === 'sm' ? 'h-16 w-16' : 'h-20 w-20';
  const valueSize = size === 'lg' ? 'text-3xl' : size === 'sm' ? 'text-sm' : 'text-xl';

  const toneClass =
    percentage >= 90
      ? 'text-emerald-700'
      : percentage >= 75
        ? 'text-teal-700'
        : 'text-amber-700';

  return (
    <div className="flex items-center gap-4">
      <div className={`confidence-ring ${ringSize}`}>
        <motion.div
          className="absolute inset-0 rounded-full border border-teal-500/20"
          initial={{ scale: 0.9, opacity: 0.4 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.45 }}
        />
        <motion.div
          className="confidence-ring-fill"
          initial={{ background: 'conic-gradient(rgba(91,159,153,0.12) 0deg, rgba(91,159,153,0.12) 360deg)' }}
          animate={{
            background: `conic-gradient(rgba(91,159,153,0.92) 0deg, rgba(124,171,146,0.88) ${percentage * 3.6}deg, rgba(223,232,227,0.92) ${percentage * 3.6}deg, rgba(223,232,227,0.92) 360deg)`,
          }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
        <div className="confidence-ring-core" />
        <div className={`absolute inset-[18%] z-10 flex items-center justify-center text-center font-display font-bold leading-none ${toneClass}`}>
          <div className={valueSize}>{percentage}%</div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Audit confidence</p>
        <div className="h-2 w-36 overflow-hidden rounded-full bg-stone-200/80">
          <motion.div
            className="h-full rounded-full bg-[linear-gradient(90deg,rgba(91,159,153,0.88),rgba(124,171,146,0.9))]"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        <p className="max-w-[16rem] text-sm text-slate-500">
          Confidence blends extraction quality, code evidence, ambiguity checks, and audit consistency.
        </p>
      </div>
    </div>
  );
}
