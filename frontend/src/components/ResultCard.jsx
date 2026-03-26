import { AnimatePresence, motion } from 'framer-motion';
import { BrainCircuit, CheckCircle2, ClipboardList, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { AuditTrail } from './AuditTrail';
import { ConfidenceBadge } from './ConfidenceBadge';

const tabs = [
  { id: 'codes', label: 'Codes', icon: ClipboardList },
  { id: 'reasoning', label: 'Reasoning', icon: BrainCircuit },
  { id: 'audit', label: 'Audit', icon: ShieldCheck },
];

export function ResultCard({ result }) {
  const [activeTab, setActiveTab] = useState('codes');

  return (
    <div className="space-y-8">
      <div className="border-b border-stone-200/80 pb-6">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-4">
            <div className="status-pill bg-emerald-500/10 text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              <span>Analysis completed</span>
            </div>
            <div>
              <h2 className="font-display text-3xl text-slate-800">Validated coding result for note {result.note_id}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                ICD-10 and CPT outputs have been generated, checked for ambiguity, and logged into the audit trail.
              </p>
            </div>
          </div>

          <ConfidenceBadge confidence={result.confidence} size="lg" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`nav-chip ${activeTab === id ? 'nav-chip-active' : 'nav-chip-idle'}`}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.24 }}
        >
          {activeTab === 'codes' && (
            <div className="grid gap-6 lg:grid-cols-2">
              <CodeStack title="ICD-10 codes" items={result.icd10_codes} accent="cyan" />
              <CodeStack title="CPT codes" items={result.cpt_codes} accent="emerald" />
            </div>
          )}

          {activeTab === 'reasoning' && (
            <div className="panel space-y-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Reasoning trace</p>
              <div className="space-y-4">
                {result.reasoning?.map((item, index) => (
                    <div key={index} className="rounded-[24px] border border-stone-200/80 bg-white/72 p-5">
                      <div className="flex items-start gap-4">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-teal-500/20 bg-teal-500/10 text-sm font-semibold text-teal-700">
                        {index + 1}
                      </span>
                      <p className="flex-1 text-base leading-7 text-slate-700">{item}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="panel space-y-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Audit trail</p>
              <AuditTrail events={result.audit_trail} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function CodeStack({ title, items = [], accent }) {
  return (
    <div className="panel space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{title}</p>
          <h3 className="mt-2 font-display text-2xl text-slate-800">{items.length} matched outputs</h3>
        </div>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.code} className="rounded-[24px] border border-stone-200/80 bg-white/72 p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className={`code-badge ${accent === 'emerald' ? 'code-badge-emerald' : 'code-badge-cyan'}`}>{item.code}</p>
                <p className="mt-3 text-base text-slate-700">{item.description}</p>
              </div>
              <div className="rounded-full border border-stone-200/80 bg-white/80 px-3 py-2 text-sm text-slate-600">
                {Math.round(item.confidence * 100)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
