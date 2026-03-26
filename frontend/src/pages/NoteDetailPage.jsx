import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, ArrowLeft, BrainCircuit, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AmbiguityBox } from '../components/AmbiguityBox';
import { ProcessingViewer } from '../components/ProcessingViewer';
import { ResultCard } from '../components/ResultCard';
import { getResult, getStatus, sendClarification } from '../services/api';

export function NoteDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [phase, setPhase] = useState('loading');
  const [processingData, setProcessingData] = useState({ progress: 0 });
  const [questions, setQuestions] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isSubmittingClarification, setIsSubmittingClarification] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!id) {
      return undefined;
    }

    let cancelled = false;
    let intervalId = 0;

    const loadResult = async () => {
      try {
        const nextResult = await getResult(id);
        if (!cancelled) {
          setResult(nextResult);
          setPhase('completed');
        }
      } catch {
        if (!cancelled) {
          setError('This note result could not be loaded.');
          setPhase('error');
        }
      }
    };

    const tick = async () => {
      try {
        const status = await getStatus(id);

        if (cancelled) {
          return;
        }

        if (status.status === 'processing') {
          setPhase('processing');
          setProcessingData({
            progress: status.progress || 0,
            currentStep: status.current_step,
            currentAgent: status.current_agent,
            currentDetail: status.current_detail,
            activityFeed: status.activity_feed || [],
            extractedEntities: status.extracted_entities || {},
          });
          return;
        }

        if (status.status === 'needs_clarification') {
          window.clearInterval(intervalId);
          setPhase('needs_clarification');
          setQuestions(status.questions || []);
          setProcessingData({
            progress: status.progress || 76,
            currentStep: status.current_step,
            currentAgent: status.current_agent,
            currentDetail: status.current_detail,
            activityFeed: status.activity_feed || [],
            extractedEntities: status.extracted_entities || {},
          });
          return;
        }

        if (status.status === 'completed') {
          window.clearInterval(intervalId);
          await loadResult();
          return;
        }
      } catch {
        window.clearInterval(intervalId);
        if (!cancelled) {
          setError('We could not find that note or its processing status.');
          setPhase('error');
        }
      }
    };

    tick();
    intervalId = window.setInterval(tick, 1100);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [id, refreshKey]);

  const handleClarificationSubmit = async (answers) => {
    const hasAnswers = Array.isArray(answers)
      ? answers.length > 0
      : answers && typeof answers === 'object'
        ? Object.keys(answers).length > 0
        : false;

    if (!id || !hasAnswers) {
      return;
    }

    try {
      setIsSubmittingClarification(true);
      await sendClarification(id, answers);
      setQuestions([]);
      setPhase('processing');
      setRefreshKey((value) => value + 1);
    } catch {
      setError('The clarification could not be submitted.');
      setPhase('error');
    } finally {
      setIsSubmittingClarification(false);
    }
  };

  return (
    <section className="page-shell">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200/80 px-4 py-4 sm:px-6 lg:px-8">
        <button type="button" onClick={() => navigate(-1)} className="secondary-button">
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
        <div className="rounded-full border border-stone-200/80 bg-white/75 px-4 py-2 text-xs uppercase tracking-[0.28em] text-slate-500">
          Note {id}
        </div>
      </div>

      <div
        className={`min-h-[calc(100svh-11rem)] border-y border-stone-200/70 bg-white/20 px-4 py-4 sm:px-6 lg:px-8 ${
          phase === 'processing'
            ? 'xl:h-[calc(100svh-11rem)] xl:overflow-hidden'
            : 'xl:h-auto xl:overflow-visible'
        }`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.24 }}
            className="h-full"
          >
          {phase === 'loading' && (
            <div className="flex min-h-[22rem] flex-col items-center justify-center gap-4 border border-stone-200/80 bg-white/72 px-6 text-center">
              <Loader2 className="h-10 w-10 animate-spin text-teal-700" />
              <h1 className="font-display text-3xl text-slate-800">Initializing note workspace</h1>
              <p className="max-w-md text-sm leading-6 text-slate-500">Loading the current processing state and checking whether the note needs clarification or already has a final result.</p>
            </div>
          )}

          {phase === 'processing' && (
            <ProcessingViewer
              currentStep={processingData.currentStep}
              currentAgent={processingData.currentAgent}
              currentDetail={processingData.currentDetail}
              progress={processingData.progress}
              activityFeed={processingData.activityFeed}
              extractedEntities={processingData.extractedEntities}
            />
          )}

          {phase === 'needs_clarification' && (
            <div className="space-y-4">
              <div className="xl:h-[calc(100svh-11rem)] xl:min-h-[calc(100svh-11rem)]">
                <ProcessingViewer
                  currentStep={processingData.currentStep}
                  currentAgent={processingData.currentAgent}
                  currentDetail={processingData.currentDetail}
                  progress={processingData.progress}
                  activityFeed={processingData.activityFeed}
                  extractedEntities={processingData.extractedEntities}
                  freezeFeed
                />
              </div>
              <div className="panel">
                <AmbiguityBox
                  key={questions.map((question, index) => question.id || index).join('-')}
                  questions={questions}
                  onSubmit={handleClarificationSubmit}
                  isLoading={isSubmittingClarification}
                />
              </div>
            </div>
          )}

          {phase === 'completed' && result ? <ResultCard result={result} /> : null}

          {phase === 'error' && (
            <div className="flex min-h-[18rem] flex-col items-center justify-center gap-4 border border-stone-200/80 bg-white/72 px-6 text-center">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-50/80 text-rose-700">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h1 className="font-display text-3xl text-slate-800">Note unavailable</h1>
              <p className="max-w-md text-sm leading-6 text-slate-500">
                {error || 'This note could not be resolved. Return to the dashboard or upload a new note to continue.'}
              </p>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => navigate('/dashboard')} className="secondary-button">
                  <BrainCircuit className="h-4 w-4" />
                  <span>Open dashboard</span>
                </button>
                <button type="button" onClick={() => navigate('/upload')} className="primary-button">
                  <span>Upload a new note</span>
                </button>
              </div>
            </div>
          )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
