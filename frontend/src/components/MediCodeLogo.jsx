export function MediCodeLogo({ compact = false, withTagline = true, className = '' }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="brand-mark">
        <svg viewBox="0 0 64 64" fill="none" className="h-7 w-7">
          <rect x="8" y="8" width="48" height="48" rx="14" className="stroke-current" strokeWidth="2.5" />
          <path
            d="M21 42V22l11 11 11-11v20"
            className="stroke-current"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M46 18h6M49 15v6M18 46h8"
            className="stroke-current"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="brand-title">MediCode</span>
          <span className="brand-subtitle">AI</span>
        </div>
        {!compact && withTagline && (
          <p className="brand-tagline">Audit-ready medical coding intelligence</p>
        )}
      </div>
    </div>
  );
}
