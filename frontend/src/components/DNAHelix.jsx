export function DNAHelix() {
    const nodes = 12;

    return (
        <div className="dna-helix-container relative w-20 h-80 mx-auto" aria-hidden="true">
            {Array.from({ length: nodes }).map((_, i) => {
                const progress = i / (nodes - 1);
                const delay = i * 0.15;

                return (
                    <div
                        key={i}
                        className="dna-rung absolute w-full"
                        style={{
                            top: `${progress * 100}%`,
                            animationDelay: `${delay}s`,
                        }}
                    >
                        {/* Left strand node */}
                        <div
                            className="dna-node-left absolute rounded-full"
                            style={{
                                animationDelay: `${delay}s`,
                                width: '8px',
                                height: '8px',
                                background: `linear-gradient(135deg, #00d4ff, #1373f7)`,
                                boxShadow: '0 0 12px rgba(0, 212, 255, 0.5)',
                            }}
                        />

                        {/* Connecting rung */}
                        <div
                            className="dna-connector absolute top-1/2 -translate-y-1/2"
                            style={{
                                animationDelay: `${delay}s`,
                                height: '1.5px',
                                background: `linear-gradient(90deg, rgba(0,212,255,0.6), rgba(123,97,255,0.3), rgba(0,245,212,0.6))`,
                            }}
                        />

                        {/* Right strand node */}
                        <div
                            className="dna-node-right absolute rounded-full"
                            style={{
                                animationDelay: `${delay}s`,
                                width: '8px',
                                height: '8px',
                                background: `linear-gradient(135deg, #7b61ff, #00f5d4)`,
                                boxShadow: '0 0 12px rgba(123, 97, 255, 0.5)',
                            }}
                        />
                    </div>
                );
            })}
        </div>
    );
}
