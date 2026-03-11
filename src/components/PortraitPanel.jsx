import React, { useState, useEffect } from 'react';

const PortraitPanel = ({ portrait, isActive }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Reset expanded state when portrait changes or disappears
    useEffect(() => {
        if (!isActive) {
            setIsExpanded(false);
        }
    }, [portrait, isActive]);

    if (!portrait) return null;

    return (
        <div
            className={`fixed bottom-0 left-0 w-full z-[1000] p-4 spring-transition ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
                }`}
        >
            <div
                className={`bg-museum-bg/95 backdrop-blur-3xl border border-museum-accent/20 rounded-[2rem] p-4 pb-5 shadow-2xl safe-bottom relative max-w-xl mx-auto overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[60vh] overflow-y-auto' : 'max-h-[300px]'
                    }`}
            >
                {/* Subtle pull indicator / Toggle area */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-[2px] bg-museum-accent/20 rounded-full hover:bg-museum-accent/40 transition-colors"
                    aria-label={isExpanded ? "Collapse info" : "Expand info"}
                ></button>

                <div className="flex items-center gap-5 mt-3">
                    {/* Portrait Thumbnail - Scales with expansion */}
                    <div className={`flex-shrink-0 overflow-hidden rounded-xl border border-museum-accent/20 shadow-xl transition-all duration-300 ${isExpanded ? 'w-24 h-36' : 'w-20 h-28'
                        }`}>
                        <img
                            src={portrait.image}
                            alt={portrait.title}
                            className="w-full h-full object-cover grayscale-[10%]"
                        />
                    </div>

                    <div className="flex-1 space-y-2 text-left">
                        <div>
                            <h3 className="text-xl font-serif font-bold text-museum-text leading-tight tracking-tight">
                                {portrait.title}
                            </h3>
                            <div className="flex items-center gap-2 opacity-80 mt-0.5">
                                <p className="text-museum-accent font-serif tracking-widest text-[9px] uppercase">
                                    {portrait.artist}
                                </p>
                                <span className="w-1 h-1 rounded-full bg-museum-accent/20"></span>
                                <p className="text-museum-muted font-serif tracking-widest text-[9px] uppercase">
                                    {portrait.year}
                                </p>
                            </div>
                        </div>

                        <div className="h-[1px] w-8 bg-gradient-to-r from-museum-accent/30 to-transparent"></div>

                        <div className="relative">
                            <p className={`text-museum-muted text-[11px] leading-relaxed font-medium transition-all duration-300 ${isExpanded ? '' : 'line-clamp-2'
                                }`}>
                                {portrait.description}
                            </p>

                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="text-museum-accent text-[9px] font-bold uppercase tracking-[0.2em] mt-2 hover:opacity-80 transition-all flex items-center gap-1 group"
                            >
                                {isExpanded ? (
                                    <>Show Less <span className="group-hover:-translate-y-0.5 transition-transform">↑</span></>
                                ) : (
                                    <>Read More <span className="group-hover:translate-y-0.5 transition-transform">↓</span></>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-4 pt-3 border-t border-museum-accent/5 flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-museum-accent"></div>
                        <p className="text-museum-accent/30 text-[8px] tracking-[0.2em] uppercase font-bold">
                            Historic Entry Active
                        </p>
                    </div>
                    <p className="text-museum-muted/10 text-[8px] font-mono">
                        #{portrait.id.toString().padStart(3, '0')}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PortraitPanel;
