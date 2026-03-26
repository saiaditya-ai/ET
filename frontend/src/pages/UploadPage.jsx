import { ClipboardCheck, Database, FlaskConical, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadPanel } from '../components/UploadPanel';
import { startProcessing, uploadNote } from '../services/api';

const sideRail = [
  { title: 'Intake extraction', detail: 'Diseases, procedures, and context become structured evidence.', icon: FlaskConical },
  { title: 'Coding pass', detail: 'ICD-10 and CPT candidates are attached to each note.', icon: Database },
  { title: 'Validation gate', detail: 'Ambiguity pauses the flow before bad codes are returned.', icon: ShieldCheck },
  { title: 'Audit output', detail: 'Confidence, reasoning, and audit trail finish the run.', icon: ClipboardCheck },
];

const inputChecklist = [
  {
    title: 'Diagnoses',
    detail: 'List confirmed conditions, suspected conditions, and whether anything was ruled out.',
  },
  {
    title: 'Procedures',
    detail: 'Include imaging, office services, admissions, consults, and any documented interventions.',
  },
  {
    title: 'Specificity',
    detail: 'Laterality, episode, type, acuity, and complication details reduce ambiguity before validation.',
  },
  {
    title: 'Support',
    detail: 'Labs, medications, vitals, and treatment plans help the coding output feel grounded and auditable.',
  },
];

export function UploadPage() {
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (note.trim().length < 60 || isLoading) {
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const uploadResponse = await uploadNote(note.trim());

      if (!uploadResponse.noteId) {
        throw new Error('The note could not be uploaded.');
      }

      await startProcessing(uploadResponse.noteId);
      navigate(`/note/${uploadResponse.noteId}`);
    } catch (submissionError) {
      setError(submissionError.message || 'Something went wrong while starting the workflow.');
      setIsLoading(false);
    }
  };

  return (
    <section className="page-shell">
      <div className="grid gap-px border-y border-stone-200/70 bg-white/35 xl:min-h-[calc(100svh-8.2rem)] xl:grid-cols-[minmax(0,1.14fr)_minmax(24rem,0.86fr)] xl:items-stretch">
        <div className="flex flex-col gap-4 bg-white/30 px-4 py-4 sm:px-6 lg:px-8">
          {error ? (
            <div className="rounded-[24px] border border-rose-500/20 bg-rose-50/80 px-5 py-4 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <UploadPanel
            note={note}
            onChange={setNote}
            onFileImport={setNote}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>

        <div className="flex flex-col gap-4 bg-white/15 px-4 py-4 sm:px-6 lg:px-8">
          <div className="panel flex flex-1 flex-col">
            <div className="border-b border-stone-200/80 pb-5">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Workflow expectations</p>
              <h2 className="mt-3 font-display text-3xl text-slate-800">What happens after upload</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
                The note moves through extraction, coding, validation, and audit in one continuous workspace.
              </p>
            </div>

            <div className="mt-5 grid flex-1 gap-3 xl:grid-cols-2 xl:auto-rows-fr">
              {sideRail.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex h-full min-h-[8.25rem] items-start gap-4 rounded-[22px] border border-stone-200/80 bg-white/65 p-5">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-teal-500/20 bg-teal-500/10 text-teal-700">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm uppercase tracking-[0.26em] text-slate-500">{item.title}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="panel">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Best input structure</p>
            <h3 className="mt-3 font-display text-2xl text-slate-800">What makes the note stronger</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {inputChecklist.map((item) => (
                <div key={item.title} className="rounded-[22px] border border-stone-200/80 bg-white/65 p-4">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
