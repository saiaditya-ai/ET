import { motion } from 'framer-motion';
import { ArrowRight, FileText, Paperclip, Sparkles, Upload } from 'lucide-react';
import { useRef, useState } from 'react';

export function UploadPanel({ note, onChange, onSubmit, onFileImport, isLoading, minChars = 60 }) {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState('');
  const [fileError, setFileError] = useState('');
  const count = note.trim().length;
  const progress = Math.min(100, Math.round((count / minChars) * 100));
  const isValid = count >= minChars;

  const handlePickFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const [file] = event.target.files || [];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('text/') && !/\.(txt|md|csv|json)$/i.test(file.name)) {
      setFileError('Use a text-based file such as .txt, .md, .csv, or .json.');
      event.target.value = '';
      return;
    }

    try {
      const text = await file.text();
      onFileImport(text);
      setFileName(file.name);
      setFileError('');
    } catch {
      setFileError('The selected file could not be read.');
    } finally {
      event.target.value = '';
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-200/80 pb-5">
        <div>
          <div className="status-pill">
            <Sparkles className="h-4 w-4" />
            <span>Clinical note intake</span>
          </div>
          <h1 className="mt-4 font-display text-4xl leading-none text-slate-800 md:text-5xl">
            Upload a note and launch the full coding workflow.
          </h1>
        </div>

        <div className="rounded-[26px] border border-stone-200/80 bg-white/70 px-5 py-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Readiness</p>
          <p className="mt-2 font-display text-3xl text-teal-700">{progress}%</p>
        </div>
      </div>

      <div className="mt-5 flex flex-1 flex-col rounded-[28px] border border-stone-200/80 bg-white/72 p-6 xl:p-7">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-teal-500/20 bg-teal-500/10 text-teal-700">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Clinical note</p>
              <p className="text-sm text-slate-600">Paste physician documentation or encounter text.</p>
            </div>
          </div>

          <span className={`rounded-full border px-3 py-2 text-xs uppercase tracking-[0.24em] ${isValid ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700' : 'border-stone-200/80 bg-white/75 text-slate-500'}`}>
            {count}/{minChars}
          </span>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md,.csv,.json,text/plain"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="mb-5 flex flex-wrap items-center gap-3 rounded-[22px] border border-stone-200/80 bg-white/78 p-4">
          <button type="button" onClick={handlePickFile} className="secondary-button">
            <Upload className="h-4 w-4" />
            <span>Upload file</span>
          </button>

          <div className="flex min-w-0 items-center gap-2 text-sm text-slate-500">
            <Paperclip className="h-4 w-4 text-teal-700" />
            <span className="truncate">{fileName || 'No file selected. Text files only for now.'}</span>
          </div>
        </div>

        {fileError ? (
          <div className="mb-4 rounded-[20px] border border-amber-500/20 bg-amber-50/80 px-4 py-3 text-sm text-amber-700">
            {fileError}
          </div>
        ) : null}

        <textarea
          value={note}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Paste the clinical note here. Include diagnoses, procedures, medications, labs, or any ambiguity you want the validation agent to catch."
          className="input-shell min-h-[18rem] flex-1 w-full resize-none"
        />

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-stone-200/80">
          <motion.div
            className="h-full rounded-full bg-[linear-gradient(90deg,rgba(91,159,153,0.88),rgba(124,171,146,0.9))]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.35 }}
          />
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            {isValid
              ? 'Enough context detected to start extraction and coding.'
              : `Add ${minChars - count} more characters to improve extraction quality.`}
          </p>

          <button type="button" onClick={onSubmit} disabled={!isValid || isLoading} className="primary-button">
            <span>{isLoading ? 'Submitting note...' : 'Start processing'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
