import { useState, useRef, useCallback } from 'react';
import { sampleClinicalNote, highlightTerms } from '../data/mockData';
import { ClipboardDocIcon, RocketLaunchIcon } from './Icons';

export function ClinicalNoteInput({ onProcess, isProcessing }) {
    const [noteText, setNoteText] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const textareaRef = useRef(null);
    const buttonRef = useRef(null);
    const maxChars = 5000;

    const handleLoadSample = () => {
        setNoteText(sampleClinicalNote);
    };

    const handleClear = () => {
        setNoteText('');
        textareaRef.current?.focus();
    };

    const createRipple = useCallback((e) => {
        const button = buttonRef.current;
        if (!button) return;

        const rect = button.getBoundingClientRect();
        const ripple = document.createElement('span');
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        ripple.className = 'ripple';

        button.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    }, []);

    const handleProcess = (e) => {
        createRipple(e);
        if (noteText.trim().length > 0) {
            onProcess(noteText);
        }
    };

    const getHighlightedPreview = () => {
        if (!noteText) return null;

        let result = noteText;
        const sortedTerms = [...highlightTerms].sort((a, b) => b.length - a.length);

        sortedTerms.forEach(term => {
            const regex = new RegExp(`(${term})`, 'gi');
            result = result.replace(regex, `<mark class="highlight-term">$1</mark>`);
        });

        return result;
    };

    const charPercentage = (noteText.length / maxChars) * 100;

    return (
        <section id="input-section" className="relative px-4 pb-16">
            <div className="max-w-4xl mx-auto">
                <div className={`glass-card neon-border p-6 md:p-8 transition-all duration-500 ${isFocused ? 'shadow-glow-md ring-1 ring-neon-blue/20' : ''}`}>
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
                        <div>
                            <h2 className="text-xl md:text-2xl font-bold text-dark-800 flex items-center gap-3">
                                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-medical-500 to-neon-blue text-white">
                                    <ClipboardDocIcon className="w-5 h-5" />
                                </span>
                                Clinical Note Input
                            </h2>
                            <p className="text-dark-400 text-sm mt-1 ml-[52px]">Paste or type your clinical documentation</p>
                        </div>
                        <div className="flex gap-2 ml-[52px] sm:ml-0">
                            <button
                                onClick={handleLoadSample}
                                className="px-4 py-2 text-sm font-medium rounded-lg bg-medical-50 text-medical-600 hover:bg-medical-100 border border-medical-200 transition-all duration-300 hover:shadow-md"
                            >
                                Load Sample
                            </button>
                            {noteText && (
                                <button
                                    onClick={handleClear}
                                    className="px-4 py-2 text-sm font-medium rounded-lg bg-red-50 text-red-500 hover:bg-red-100 border border-red-200 transition-all duration-300"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Textarea */}
                    <div className="relative group">
                        <div className={`relative rounded-xl overflow-hidden border-2 transition-all duration-500 ${isFocused ? 'border-neon-blue/30 shadow-inner-glow' : 'border-dark-200/50'}`}>
                            {/* Floating label */}
                            <label
                                className={`absolute left-4 transition-all duration-300 pointer-events-none z-10 ${isFocused || noteText
                                        ? 'top-2 text-xs font-semibold text-medical-500'
                                        : 'top-5 text-base text-dark-400'
                                    }`}
                            >
                                {isFocused || noteText ? 'Clinical Note' : 'Paste your clinical note for AI-driven medical coding analysis'}
                            </label>

                            <textarea
                                ref={textareaRef}
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value.slice(0, maxChars))}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                className={`w-full min-h-[220px] md:min-h-[260px] p-4 pt-8 bg-white/50 text-dark-800 text-sm md:text-base leading-relaxed resize-y rounded-xl focus:outline-none placeholder-transparent font-normal`}
                                placeholder="Paste your clinical note for AI-driven medical coding analysis"
                                maxLength={maxChars}
                            />
                        </div>

                        {/* Character count bar */}
                        <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-3">
                                <div className="w-32 h-1.5 rounded-full bg-dark-100 overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500 ease-out"
                                        style={{
                                            width: `${Math.min(charPercentage, 100)}%`,
                                            background: charPercentage > 90
                                                ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                                                : charPercentage > 70
                                                    ? 'linear-gradient(90deg, #06b6d4, #0891b2)'
                                                    : 'linear-gradient(90deg, #0ea5e9, #00d4ff)',
                                        }}
                                    />
                                </div>
                                <span className={`char-count text-xs transition-colors duration-300 ${charPercentage > 90 ? 'text-red-500' : charPercentage > 70 ? 'text-cyan-500' : 'text-dark-400'
                                    }`}>
                                    {noteText.length.toLocaleString()} / {maxChars.toLocaleString()}
                                </span>
                            </div>
                            {noteText.length > 0 && (
                                <span className="text-xs text-dark-400 font-mono">
                                    {noteText.split(/\s+/).filter(Boolean).length} words
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Highlighted preview */}
                    {noteText && (
                        <div className="mt-4 p-4 rounded-xl bg-dark-50/50 border border-dark-100">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-2 h-2 rounded-full bg-neon-blue animate-pulse" />
                                <span className="text-xs font-semibold text-dark-500 uppercase tracking-wider">AI-Detected Entities Preview</span>
                            </div>
                            <div
                                className="text-sm text-dark-600 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: getHighlightedPreview() }}
                            />
                        </div>
                    )}

                    {/* Process button */}
                    <div className="mt-6 flex justify-center">
                        <button
                            ref={buttonRef}
                            onClick={handleProcess}
                            disabled={!noteText.trim() || isProcessing}
                            className={`btn-primary text-base md:text-lg px-10 py-4 rounded-xl flex items-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none`}
                        >
                            {isProcessing ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    <span>Processing with AI...</span>
                                </>
                            ) : (
                                <>
                                    <RocketLaunchIcon className="w-5 h-5" />
                                    <span>Analyze & Extract Codes</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
