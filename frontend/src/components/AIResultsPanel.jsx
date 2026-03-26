import { useState } from 'react';
import { HospitalIcon, CodeBracketIcon, CheckCircleIcon, BrainIcon } from './Icons';

function ConfidenceBar({ value }) {
  const pct = Math.round(value * 100);
  const color = 'from-medical-400 to-neon-blue';

  return (
    <div className="flex items-center gap-2.5">
      <div className="flex-1 h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
        <div className={`h-full rounded-full bg-gradient-to-r ${color} shadow-glow-blue`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] font-mono font-semibold text-slate-400 w-9 text-right">{pct}%</span>
    </div>
  );
}

export function AIResultsPanel({ result }) {
  const [activeTab, setActiveTab] = useState('icd10');

  if (!result) return null;

  return (
    <div className="bg-slate-900/[0.4] backdrop-blur-3xl border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl animate-fade-in">
      {/* Top accent line */}
      <div className="h-1 bg-gradient-to-r from-medical-500 via-neon-blue to-cyan-400" />

      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-neon-blue/[0.15] border border-neon-blue/30 text-neon-blue shadow-glow"><CheckCircleIcon className="w-5 h-5" /></span>
            <div>
              <h3 className="text-xl font-heading font-bold text-white">Analysis Complete</h3>
              <p className="text-xs text-slate-400 mt-0.5">AI has validated this clinical note</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 p-1 bg-white/[0.03] border border-white/[0.05] rounded-xl mb-6">
          <button
            onClick={() => setActiveTab('icd10')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-300 ${activeTab === 'icd10' ? 'bg-white/[0.08] text-neon-blue border border-neon-blue/20 shadow-glow-sm' : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'}`}
          >
            <HospitalIcon className="w-4 h-4" /> ICD-10 Codes
            <span className="text-[10px] ml-1 px-1.5 py-0.5 rounded-full border bg-neon-blue/10 text-neon-blue border-neon-blue/20">{result.icd10_codes?.length || 0}</span>
          </button>
          <button
            onClick={() => setActiveTab('cpt')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-300 ${activeTab === 'cpt' ? 'bg-white/[0.08] text-neon-cyan border border-neon-cyan/20 shadow-glow-sm' : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'}`}
          >
            <CodeBracketIcon className="w-4 h-4" /> CPT Codes
            <span className="text-[10px] ml-1 px-1.5 py-0.5 rounded-full border bg-neon-cyan/10 text-neon-cyan border-neon-cyan/20">{result.cpt_codes?.length || 0}</span>
          </button>
          <button
            onClick={() => setActiveTab('reasoning')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-300 ${activeTab === 'reasoning' ? 'bg-white/[0.08] text-neon-blue border border-neon-blue/20 shadow-glow-sm' : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'}`}
          >
            <BrainIcon className="w-4 h-4" /> Reasoning
            <span className="text-[10px] ml-1 px-1.5 py-0.5 rounded-full border bg-neon-blue/10 text-neon-blue border-neon-blue/20">{result.reasoning?.length || 0}</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="relative min-h-[300px]">
          {activeTab === 'icd10' && (
            <div className="space-y-3 animate-fade-in">
              {result.icd10_codes?.map((code, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] hover:border-neon-blue/30 hover:bg-white/[0.04] transition-all duration-300 group shadow-md" style={{ animationDelay: `${i * 0.08}s` }}>
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <span className="px-3 py-1 rounded-md bg-neon-blue/10 text-neon-blue font-mono font-bold text-sm tracking-wide border border-neon-blue/20 shadow-glow-sm">{code.code}</span>
                    <span className="px-2 py-0.5 bg-neon-blue/5 text-neon-blue border border-neon-blue/10 rounded text-xs font-semibold uppercase tracking-wider">Primary</span>
                  </div>
                  <p className="text-slate-200 text-sm mb-3 font-medium">{code.description}</p>
                  <ConfidenceBar value={code.confidence} />
                </div>
              ))}
            </div>
          )}

          {activeTab === 'cpt' && (
            <div className="space-y-3 animate-fade-in">
              {result.cpt_codes?.map((code, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] hover:border-neon-cyan/30 hover:bg-white/[0.04] transition-all duration-300 group shadow-md" style={{ animationDelay: `${i * 0.08}s` }}>
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <span className="px-3 py-1 rounded-md bg-neon-cyan/10 text-neon-cyan font-mono font-bold text-sm tracking-wide border border-neon-cyan/20 shadow-glow-sm">{code.code}</span>
                  </div>
                  <p className="text-slate-200 text-sm mb-3 font-medium">{code.description}</p>
                  <ConfidenceBar value={code.confidence} />
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reasoning' && (
            <div className="space-y-3 animate-fade-in">
              {result.reasoning?.map((r, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] hover:border-neon-blue/30 transition-all duration-300 shadow-md group" style={{ animationDelay: `${i * 0.08}s` }}>
                  <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-neon-blue/10 border border-neon-blue/20 text-neon-blue font-bold text-xs shadow-glow-sm group-hover:scale-110 transition-transform">{i + 1}</span>
                  <p className="text-slate-300 text-sm leading-relaxed">{r}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
