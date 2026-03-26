import { useState, useEffect } from 'react';

const features = [
    {
        icon: '⚡',
        title: 'Fast Processing',
        description: 'AI-powered analysis completes in under 3 seconds. Real-time extraction of medical codes from clinical documentation.',
        gradient: 'from-amber-400 to-orange-500',
        hoverGlow: 'hover:shadow-[0_0_40px_rgba(251,191,36,0.15)]',
    },
    {
        icon: '🎯',
        title: 'Accurate Codes',
        description: 'Trained on millions of medical records. Our NLP models achieve 99%+ accuracy in ICD-10 and CPT code assignment.',
        gradient: 'from-medical-500 to-neon-blue',
        hoverGlow: 'hover:shadow-[0_0_40px_rgba(0,212,255,0.15)]',
    },
    {
        icon: '🔒',
        title: 'Secure & Private',
        description: 'HIPAA-compliant infrastructure. All data is encrypted end-to-end and never stored after processing.',
        gradient: 'from-emerald-400 to-teal-500',
        hoverGlow: 'hover:shadow-[0_0_40px_rgba(52,211,153,0.15)]',
    },
];

export function FeatureCards() {
    const [visibleCards, setVisibleCards] = useState([]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const index = entry.target.dataset.index;
                        setVisibleCards((prev) => [...new Set([...prev, index])]);
                    }
                });
            },
            { threshold: 0.2 }
        );

        document.querySelectorAll('.feature-card-wrapper').forEach((el) => {
            observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    return (
        <section className="px-4 py-16 md:py-24">
            <div className="max-w-6xl mx-auto">
                {/* Section header */}
                <div className="text-center mb-14">
                    <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-medical-50 border border-medical-200 text-medical-700">
                        <span className="text-sm font-semibold">Why MediCode AI</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-dark-800 mb-3">
                        Built for Modern Healthcare
                    </h2>
                    <p className="text-dark-400 max-w-xl mx-auto">
                        Enterprise-grade medical coding automation, designed to accelerate revenue cycle management.
                    </p>
                </div>

                {/* Cards grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    {features.map((feature, i) => (
                        <div
                            key={feature.title}
                            data-index={i}
                            className={`feature-card-wrapper transition-all duration-700 ${visibleCards.includes(String(i)) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                                }`}
                            style={{ transitionDelay: `${i * 0.15}s` }}
                        >
                            <div className={`glass-card neon-border p-7 md:p-8 h-full group cursor-default ${feature.hoverGlow} transition-all duration-500`}>
                                {/* Icon */}
                                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} text-2xl mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                                    {feature.icon}
                                </div>

                                <h3 className="text-xl font-bold text-dark-800 mb-3 group-hover:text-medical-700 transition-colors duration-300">
                                    {feature.title}
                                </h3>

                                <p className="text-dark-400 text-sm leading-relaxed">
                                    {feature.description}
                                </p>

                                {/* Bottom accent */}
                                <div className={`mt-6 h-0.5 w-0 bg-gradient-to-r ${feature.gradient} group-hover:w-full transition-all duration-500 rounded-full`} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
