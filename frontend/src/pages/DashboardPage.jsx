import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Clock3, MessageSquare, Radar } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllNotes } from '../services/api';

const statusStyles = {
  uploaded: 'border-stone-200/80 bg-white/70 text-slate-600',
  processing: 'border-teal-500/20 bg-teal-500/10 text-teal-700',
  completed: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700',
  needs_clarification: 'border-amber-500/20 bg-amber-500/10 text-amber-700',
};

export function DashboardPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const nextNotes = await getAllNotes();
        if (!cancelled) {
          setNotes(nextNotes);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();
    const intervalId = window.setInterval(load, 2000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  const completedCount = notes.filter((note) => note.status === 'completed').length;
  const processingCount = notes.filter((note) => note.status === 'processing').length;
  const clarificationCount = notes.filter((note) => note.status === 'needs_clarification').length;

  const stats = [
    { label: 'Total notes', value: notes.length, icon: Radar },
    { label: 'Completed', value: completedCount, icon: CheckCircle2 },
    { label: 'Processing', value: processingCount, icon: Clock3 },
    { label: 'Clarifications', value: clarificationCount, icon: MessageSquare },
  ];

  return (
    <section className="page-shell">
      <div className="grid gap-px border-y border-stone-200/70 bg-white/35 xl:grid-cols-[0.92fr_1.08fr] xl:items-start">
        <div className="bg-white/30 px-4 py-4 sm:px-6 lg:px-8">
          <div className="space-y-4 xl:sticky xl:top-24">
            <div className="space-y-4 border-b border-stone-200/80 pb-5">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Operator dashboard</p>
                <h1 className="mt-3 font-display text-4xl text-slate-800 md:text-5xl">Track note status across the full coding workflow.</h1>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
                  Watch uploaded notes move from extraction to coding, clarification, and final audited output.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="panel"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.28em] text-slate-500">{stat.label}</p>
                        <p className="mt-3 font-display text-4xl text-teal-700">{stat.value}</p>
                      </div>
                      <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-teal-500/20 bg-teal-500/10 text-teal-700">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-white/15 px-4 py-4 sm:px-6 lg:px-8">
          <div className="panel xl:flex xl:h-[calc(100svh-11rem)] xl:flex-col">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Recent notes</p>
                <h2 className="mt-3 font-display text-2xl text-slate-800">Live queue</h2>
              </div>
              <p className="text-sm text-slate-500">Polling every 2 seconds while the dashboard is open.</p>
            </div>

            <div className="mt-6 space-y-4 xl:min-h-0 xl:flex-1 xl:overflow-y-auto xl:pr-2">
              {loading ? (
                [...Array(3)].map((_, index) => (
                  <div key={index} className="h-24 animate-pulse rounded-[24px] border border-stone-200/80 bg-white/70" />
                ))
              ) : (
                notes.map((note, index) => (
                  <motion.button
                    key={note.note_id}
                    type="button"
                    onClick={() => navigate(`/note/${note.note_id}`)}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="w-full rounded-[24px] border border-stone-200/80 bg-white/70 p-5 text-left transition-all duration-300 hover:border-teal-500/20 hover:bg-teal-50/80"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="code-badge code-badge-cyan">{note.note_id}</span>
                          <span className={`rounded-full border px-3 py-2 text-xs uppercase tracking-[0.24em] ${statusStyles[note.status] || statusStyles.uploaded}`}>
                            {note.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="max-w-3xl text-sm leading-6 text-slate-600">
                          {note.preview}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 text-sm text-slate-500">
                        <span>{new Date(note.uploaded_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        <ArrowRight className="h-4 w-4 text-teal-700" />
                      </div>
                    </div>
                  </motion.button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
