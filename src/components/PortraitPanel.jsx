import React, { useState, useEffect, useRef } from 'react';
import { useAmbientAudio } from '../hooks/useAmbientAudio';

const PortraitPanel = ({ portrait, isActive }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isVoiceoverPlaying, setIsVoiceoverPlaying] = useState(false);
    const voiceoverRef = useRef(null);
    const { duckAmbient } = useAmbientAudio();

    // Reset expanded state when portrait changes or disappears
    useEffect(() => {
        if (!isActive) {
            setIsExpanded(false);
        }
    }, [portrait, isActive]);

    // Handle Voiceover Cleanup & Portrait Changes
    useEffect(() => {
        // Stop current voiceover if portrait changes or panel closes
        if (voiceoverRef.current) {
            voiceoverRef.current.pause();
            voiceoverRef.current = null;
            setIsVoiceoverPlaying(false);
            duckAmbient(false);
        }

        if (isActive && portrait?.audio) {
            voiceoverRef.current = new Audio(portrait.audio);

            voiceoverRef.current.onended = () => {
                setIsVoiceoverPlaying(false);
                duckAmbient(false);
            };

            voiceoverRef.current.onpause = () => {
                setIsVoiceoverPlaying(false);
            };
        }

        return () => {
            if (voiceoverRef.current) {
                voiceoverRef.current.pause();
                duckAmbient(false);
            }
        };
    }, [portrait?.id, isActive, duckAmbient]);

    const toggleVoiceover = () => {
        if (!voiceoverRef.current) return;

        if (isVoiceoverPlaying) {
            voiceoverRef.current.pause();
            duckAmbient(false);
        } else {
            voiceoverRef.current.play();
            setIsVoiceoverPlaying(true);
            duckAmbient(true);
        }
    };

    if (!portrait) return null;

    return (
        <div
            className={`fixed bottom-0 left-0 w-full z-[1000] p-4 spring-transition ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
                }`}
        >
            <div
                className={`bg-museum-bg/95 backdrop-blur-3xl border border-museum-accent/20 rounded-[2rem] p-4 pb-16 shadow-2xl safe-bottom relative max-w-xl mx-auto overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[60vh] overflow-y-auto' : 'max-h-[300px]'
                    }`}
            >
                {/* Subtle pull indicator / Toggle area */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-[2px] bg-museum-accent/20 rounded-full hover:bg-museum-accent/40 transition-colors"
                    aria-label={isExpanded ? "Collapse info" : "Expand info"}
                ></button>

                <div className="flex items-start gap-5 mt-3 mb-6">
                    {/* Portrait Thumbnail - Scales with expansion */}
                    <div className={`relative flex-shrink-0 overflow-hidden rounded-xl border border-museum-accent/20 shadow-xl transition-all duration-300 ${isExpanded ? 'w-24 h-36' : 'w-20 h-28'
                        }`}>
                        <img
                            src={portrait.image}
                            alt={portrait.title}
                            className="w-full h-full object-cover grayscale-[10%]"
                        />
                    </div>

                    <div className="flex-1 space-y-2 text-left">
                        <div className="flex justify-between items-start">
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

                            {/* Secondary Audio Button for Accessibility */}
                            {portrait.audio && (
                                <button
                                    onClick={toggleVoiceover}
                                    className={`w-8 h-8 rounded-full border border-museum-accent/30 flex items-center justify-center transition-all ${isVoiceoverPlaying ? 'bg-museum-accent text-black shadow-[0_0_15px_rgba(198,161,91,0.5)]' : 'bg-transparent text-museum-accent'}`}
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        {isVoiceoverPlaying ? (
                                            <path d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 0 1 0 7.07" />
                                        ) : (
                                            <path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                                        )}
                                    </svg>
                                </button>
                            )}
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

                <div className="mt-4 mb-5 flex justify-between items-end opacity-60">
                    <div className="flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-museum-accent"></div>
                        <p className="text-museum-accent text-[8px] tracking-[0.2em] uppercase font-bold">
                            {isVoiceoverPlaying ? 'VOICEOVER: ACTIVE' : 'ARCHIVE: ACTIVE'}
                        </p>
                    </div>
                    <p className="text-museum-muted text-[8px] font-mono tracking-widest">
                        REF_{portrait.id.toString().padStart(3, '0')}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PortraitPanel;
