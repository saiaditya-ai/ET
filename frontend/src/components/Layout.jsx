import { AnimatePresence, motion } from 'framer-motion';
import { Activity, ArrowUpRight, LayoutDashboard, Upload } from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { AmbientBackground } from './AmbientBackground';
import { MediCodeLogo } from './MediCodeLogo';

const navItems = [
  { to: '/upload', label: 'Upload', icon: Upload },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
];

export function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <AmbientBackground />

      <div className="relative z-10">
        <header className="sticky top-0 z-40 border-b border-stone-200/70 bg-white/70 backdrop-blur-xl">
          <div className="flex w-full items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <NavLink to="/" className="transition-transform duration-300 hover:scale-[1.01]">
              <MediCodeLogo compact />
            </NavLink>

            <nav className="hidden items-center gap-2 md:flex">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `nav-chip ${isActive ? 'nav-chip-active' : 'nav-chip-idle'}`
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>

            <div className="hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-700 sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_14px_rgba(52,211,153,0.35)]" />
              <span>System online</span>
              <Activity className="h-3.5 w-3.5" />
            </div>

            <button
              type="button"
              onClick={() => setMobileOpen((value) => !value)}
              className="inline-flex items-center justify-center rounded-2xl border border-stone-200/80 bg-white/70 p-2 text-slate-700 md:hidden"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 stroke-current">
                {mobileOpen ? (
                  <path d="M6 6l12 12M18 6L6 18" strokeWidth="2" strokeLinecap="round" />
                ) : (
                  <path d="M4 7h16M4 12h16M4 17h16" strokeWidth="2" strokeLinecap="round" />
                )}
              </svg>
            </button>
          </div>

          <AnimatePresence initial={false}>
            {mobileOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-stone-200/70 bg-white/80 px-4 py-3 backdrop-blur-xl md:hidden"
              >
                <div className="flex flex-col gap-2">
                  {navItems.map(({ to, label, icon: Icon }) => (
                    <NavLink
                      key={to}
                      to={to}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `nav-chip justify-between ${isActive ? 'nav-chip-active' : 'nav-chip-idle'}`
                      }
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{label}</span>
                      </span>
                      <ArrowUpRight className="h-4 w-4" />
                    </NavLink>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="min-h-[calc(100vh-7.8rem)]"
          >
            <Outlet />
          </motion.main>
        </AnimatePresence>

        <footer className="border-t border-stone-200/70 bg-white/40">
          <div className="flex w-full flex-col gap-3 px-4 py-4 text-sm text-slate-600 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
            <div className="flex flex-col gap-1">
              <p className="text-slate-800">MediCode AI</p>
              <p>Peaceful workspace for audit-ready clinical coding workflows.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.22em] text-slate-500">
              <span>HIPAA-ready posture</span>
              <span className="text-slate-300">/</span>
              <span>Audit tracked</span>
              <span className="text-slate-300">/</span>
              <span>Ambiguity aware</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
