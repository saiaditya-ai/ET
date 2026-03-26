import { motion } from 'framer-motion';
import {
  ArrowRight,
  BrainCircuit,
  ClipboardCheck,
  LayoutDashboard,
  ShieldCheck,
  Stethoscope,
  Waves,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AmbientBackground } from '../components/AmbientBackground';
import { MediCodeLogo } from '../components/MediCodeLogo';

const workflowCards = [
  {
    title: 'Intake + Clinical Agent',
    detail: 'Extracts diagnoses, procedures, and note context into structured evidence.',
    icon: Stethoscope,
  },
  {
    title: 'Coding Agent',
    detail: 'Assigns ICD-10 and CPT candidates with reasoning attached.',
    icon: BrainCircuit,
  },
  {
    title: 'Validation + Ambiguity Agent',
    detail: 'Stops the flow when specificity is missing and asks the right question.',
    icon: ShieldCheck,
  },
  {
    title: 'Audit Agent',
    detail: 'Publishes confidence, reasoning, and a complete audit trail.',
    icon: ClipboardCheck,
  },
];

const proofStats = [
  { label: 'Output states', value: '3', meta: 'processing, clarification, completed' },
  { label: 'Agent stages', value: '4', meta: 'intake, coding, validation, audit' },
  { label: 'Decision trail', value: '100%', meta: 'reasoning + audit surfaced in UI' },
];

export function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <AmbientBackground variant="landing" />

      <div className="relative z-10">
        <header className="flex w-full items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <MediCodeLogo />
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="secondary-button hidden sm:inline-flex">
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            <Link to="/upload" className="primary-button">
              <span>Launch workspace</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </header>

        <main className="w-full pb-0">
          <section className="landing-composition overflow-hidden border-y border-stone-200/70">
            <div className="grid gap-0 xl:grid-cols-[1.08fr_0.92fr]">
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="landing-copy-shell"
              >
                <div className="status-pill w-fit">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Audit + ambiguity aware medical coding</span>
                </div>

                <div className="space-y-5">
                  <h1 className="max-w-4xl font-display text-5xl leading-[0.92] text-slate-800 sm:text-6xl lg:text-7xl">
                    Medical coding command center for notes, clarifications, and final review.
                  </h1>
                  <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                    Upload a clinical note, watch each agent operate live, resolve ambiguity with explicit questions, and finish with ICD-10, CPT, confidence, reasoning, and audit trace in one continuous interface.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link to="/upload" className="primary-button">
                    <span>Start with a note</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link to="/dashboard" className="secondary-button">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>View dashboard</span>
                  </Link>
                </div>

                <div className="landing-inline-band">
                  {proofStats.map((stat) => (
                    <div key={stat.label} className="landing-inline-stat">
                      <p className="landing-inline-value">{stat.value}</p>
                      <p className="landing-inline-label">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 36 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.08 }}
                className="landing-preview-shell"
              >
                <div className="landing-preview-header">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Workflow preview</p>
                    <h2 className="mt-2 font-display text-2xl text-slate-800">From note intake to coded output</h2>
                  </div>
                  <div className="status-pill">Live demo</div>
                </div>

                <div className="landing-preview-grid">
                  {workflowCards.map((card, index) => {
                    const Icon = card.icon;
                    return (
                      <motion.div
                        key={card.title}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.12 + index * 0.06 }}
                        className="landing-workflow-card"
                      >
                        <div className="flex items-start gap-4">
                          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-teal-500/20 bg-teal-500/10 text-teal-700">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm uppercase tracking-[0.26em] text-slate-500">Stage {index + 1}</p>
                            <h3 className="mt-2 text-lg text-slate-800">{card.title}</h3>
                            <p className="mt-2 text-sm leading-6 text-slate-600">{card.detail}</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </div>

            <div className="landing-lower-band">
              <div className="landing-lower-copy">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Why this flow feels different</p>
                <h3 className="mt-2 font-display text-3xl text-slate-800">No dead ends, no mystery states, no buried audit context.</h3>
              </div>

              <div className="landing-lower-cards">
                <div className="landing-mini-card">
                  <Waves className="h-4 w-4 text-teal-700" />
                  <span>Processing remains live until either completion or clarification.</span>
                </div>
                <div className="landing-mini-card">
                  <ShieldCheck className="h-4 w-4 text-teal-700" />
                  <span>Ambiguity is surfaced as explicit user questions instead of silent failure.</span>
                </div>
                <div className="landing-mini-card">
                  <ClipboardCheck className="h-4 w-4 text-teal-700" />
                  <span>Reasoning, confidence, and audit trail are part of the primary result.</span>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
