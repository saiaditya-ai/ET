import { motion } from 'framer-motion';
import {
  Activity,
  Binary,
  Radar,
  Sparkles,
  Waves,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export function ProcessingViewer({
  currentStep,
  currentAgent,
  currentDetail,
  progress = 0,
  activityFeed = [],
  extractedEntities = {},
  freezeFeed = false,
}) {
  const transition = { type: 'spring', stiffness: 105, damping: 18, mass: 0.86 };
  const feedListRef = useRef(null);
  const latestFeedRef = useRef(null);
  const revealTimerRef = useRef(null);
  const [visibleFeed, setVisibleFeed] = useState(() =>
    freezeFeed ? activityFeed : activityFeed.slice(0, activityFeed.length ? 1 : 0)
  );
  const stageGroups = [
    { label: 'Conditions', value: extractedEntities.conditions || [], icon: Radar },
    { label: 'Procedures', value: extractedEntities.procedures || [], icon: Binary },
    { label: 'Evidence', value: extractedEntities.evidence || [], icon: Waves },
  ];

  useEffect(() => {
    if (!latestFeedRef.current || !feedListRef.current) {
      return;
    }

    const feedBounds = feedListRef.current.getBoundingClientRect();
    const latestBounds = latestFeedRef.current.getBoundingClientRect();
    const overTop = latestBounds.top < feedBounds.top;
    const overBottom = latestBounds.bottom > feedBounds.bottom;

    if (overTop || overBottom) {
      latestFeedRef.current.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [visibleFeed]);

  useEffect(() => {
    window.clearTimeout(revealTimerRef.current);

    if (!activityFeed.length) {
      setVisibleFeed([]);
      return undefined;
    }

    if (freezeFeed) {
      setVisibleFeed(activityFeed);
      return undefined;
    }

    setVisibleFeed((current) => {
      const baseLength = Math.min(Math.max(current.length, 1), activityFeed.length);
      return activityFeed.slice(0, baseLength);
    });

    const revealNext = (index) => {
      if (index >= activityFeed.length) {
        return;
      }

      revealTimerRef.current = window.setTimeout(() => {
        setVisibleFeed(activityFeed.slice(0, index + 1));
        revealNext(index + 1);
      }, 320);
    };

    const startingIndex = Math.min(Math.max(visibleFeed.length, 1), activityFeed.length);
    revealNext(startingIndex);

    return () => {
      window.clearTimeout(revealTimerRef.current);
    };
  }, [activityFeed, freezeFeed]);

  return (
    <motion.div layout transition={transition} className="h-full min-h-0 space-y-4">
      <div className="processing-command-shell">
        <motion.div layout transition={transition} className="processing-core-shell">
          <motion.div
            className="processing-sheen"
            animate={{ x: ['-120%', '160%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />

          <div className="processing-core-scroll">
            <div className="processing-core-header">
              <div className="space-y-4">
                <div className="status-pill">
                  <Activity className="h-4 w-4" />
                  <span>Live processing</span>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.32em] text-slate-500">Current stage</p>
                  <h2 className="mt-3 font-display text-3xl text-slate-800">{currentStep || 'Initializing workflow'}</h2>
                  <p className="mt-3 text-xs uppercase tracking-[0.28em] text-teal-700">{currentAgent || 'Preparing agent handoff'}</p>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                    {currentDetail || 'Waiting for the next processing signal.'}
                  </p>
                </div>
              </div>

              <div className="processing-metrics-grid">
                <div className="processing-stat">
                  <p className="processing-stat-label">Progress</p>
                  <p className="processing-stat-value">{progress}%</p>
                </div>
                <div className="processing-stat">
                  <p className="processing-stat-label">Visible feed items</p>
                  <p className="processing-stat-value">{visibleFeed.length}</p>
                </div>
              </div>
            </div>

            <div className="mt-5 h-3 overflow-hidden rounded-full bg-stone-200/80">
              <motion.div
                layout
                className="h-full rounded-full bg-[linear-gradient(90deg,rgba(91,159,153,0.94),rgba(124,171,146,0.9),rgba(141,186,178,0.82))]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: 'spring', stiffness: 88, damping: 18 }}
              />
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-3">
              {stageGroups.map((group) => {
                const Icon = group.icon;
                return (
                  <motion.div layout transition={transition} key={group.label} className="processing-cell">
                    <div className="flex items-center gap-3">
                      <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-teal-500/15 bg-teal-500/10 text-teal-700">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">{group.label}</p>
                        <p className="text-xs text-slate-500">{group.value.length} live signals</p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      {group.value.length ? (
                        group.value.map((item) => (
                          <motion.div
                            layout
                            transition={transition}
                            key={item}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="signal-chip"
                          >
                            <span className="live-dot live-dot-small" />
                            <span>{item}</span>
                          </motion.div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500">No extracted signals yet.</p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        <div className="processing-side-stack">
          <motion.div layout transition={transition} className="processing-feed-shell">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Runtime telemetry</p>
                <h3 className="mt-2 font-display text-2xl text-slate-800">Live feed</h3>
              </div>
              <div className="status-pill">
                <Sparkles className="h-4 w-4" />
                <span>Streaming</span>
              </div>
            </div>

            <div ref={feedListRef} className="processing-feed-list">
              {visibleFeed.map((item, index) => (
                <motion.div
                  layout
                  key={`${item.agent}-${item.title}-${index}`}
                  ref={index === visibleFeed.length - 1 ? latestFeedRef : null}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...transition, delay: index * 0.025 }}
                  className={`processing-feed-card ${item.status === 'active' ? 'processing-feed-card-active' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">
                          {item.status === 'active' ? 'Live update' : 'Completed update'}
                        </p>
                        <span className="live-dot live-dot-small" />
                      </div>
                      <p className="mt-2 text-sm text-slate-800">{item.title}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">{item.detail}</p>
                    </div>
                    <span className="font-mono-ui text-[10px] uppercase tracking-[0.22em] text-slate-500">{item.timestamp}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
