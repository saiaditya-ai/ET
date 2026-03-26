export function Footer() {
    return (
        <footer className="relative mt-10 border-t border-dark-100">
            {/* Gradient top line */}
            <div className="h-px bg-gradient-to-r from-transparent via-neon-blue/30 to-transparent" />

            <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-10">
                    {/* Brand */}
                    <div>
                        <h3 className="text-xl font-bold text-dark-800 mb-3">
                            <span className="text-gradient">MediCode</span> AI
                        </h3>
                        <p className="text-sm text-dark-400 leading-relaxed max-w-xs">
                            Next-generation AI-powered medical coding system. Transforming clinical documentation into accurate, compliant medical codes.
                        </p>
                    </div>

                    {/* Compliance */}
                    <div>
                        <h4 className="text-sm font-bold text-dark-600 uppercase tracking-wider mb-4">Compliance & Security</h4>
                        <div className="space-y-3">
                            {[
                                { icon: '🔒', text: 'HIPAA-Style Compliant' },
                                { icon: '🛡️', text: 'End-to-End Encrypted' },
                                { icon: '📋', text: 'Full Audit Trail' },
                                { icon: '✅', text: 'SOC 2 Type II Ready' },
                            ].map((item) => (
                                <div key={item.text} className="flex items-center gap-2.5 text-sm text-dark-500 group cursor-default">
                                    <span className="text-base group-hover:scale-110 transition-transform duration-300">{item.icon}</span>
                                    <span className="group-hover:text-medical-600 transition-colors duration-300">{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="text-sm font-bold text-dark-600 uppercase tracking-wider mb-4">Resources</h4>
                        <div className="space-y-3">
                            {[
                                { text: 'Documentation', href: '#' },
                                { text: 'API Reference', href: '#' },
                                { text: 'Privacy Policy', href: '#' },
                                { text: 'Terms of Service', href: '#' },
                            ].map((link) => (
                                <a
                                    key={link.text}
                                    href={link.href}
                                    className="block text-sm text-dark-500 hover:text-medical-600 transition-all duration-300 hover:translate-x-1"
                                >
                                    {link.text}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Safety banner */}
                <div className="p-4 rounded-xl bg-dark-50/60 border border-dark-100 mb-8">
                    <div className="flex items-start gap-3">
                        <span className="text-lg mt-0.5">⚠️</span>
                        <div>
                            <p className="text-xs font-semibold text-dark-600 mb-1">Medical Coding Disclaimer</p>
                            <p className="text-xs text-dark-400 leading-relaxed">
                                This system is designed to assist medical coding professionals. All generated codes should be verified by
                                a certified medical coder before submission. Audit-tracked and HIPAA-style secure processing.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-dark-100">
                    <p className="text-xs text-dark-400">
                        © 2026 MediCode AI. All rights reserved.
                    </p>
                    <div className="flex items-center gap-1 text-xs text-dark-400">
                        <span>Built with</span>
                        <span className="text-red-400 animate-pulse">♥</span>
                        <span>for healthcare innovation</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
