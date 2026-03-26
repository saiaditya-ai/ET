import { motion } from 'framer-motion';
import { CheckCircle2, Clock3, Radar } from 'lucide-react';

export function AuditTrail({ events = [] }) {
  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <motion.div
          key={`${event.agent}-${event.step ?? index}`}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.06 }}
          className="relative overflow-hidden rounded-[24px] border border-stone-200/80 bg-white/72 p-5"
        >
          <div className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-teal-500/0 via-teal-500/60 to-teal-500/0" />
          <div className="flex items-start gap-4">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-teal-500/20 bg-teal-500/10 text-teal-700">
              {event.duration ? <Radar className="h-5 w-5" /> : <Clock3 className="h-5 w-5" />}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm uppercase tracking-[0.28em] text-slate-500">
                  Step {event.step ?? index + 1}
                </p>
                {event.agent && (
                  <span className="rounded-full border border-emerald-500/15 bg-emerald-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.24em] text-emerald-700">
                    {event.agent}
                  </span>
                )}
              </div>
              <p className="mt-3 text-base text-slate-700">{event.action || event}</p>
            </div>

            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-slate-500">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>{event.duration || 'logged'}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
