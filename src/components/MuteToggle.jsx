import React from 'react';

const MuteToggle = ({ isMuted, onToggle }) => {
    return (
        <div className="fixed top-8 right-6 z-[9999] pointer-events-auto">
            <button
                onClick={onToggle}
                className="w-14 h-14 bg-museum-secondary/90 backdrop-blur-3xl border border-museum-accent/40 rounded-full flex items-center justify-center active:scale-90 transition-all shadow-2xl group"
                aria-label={isMuted ? "Unmute Ambient Music" : "Mute Ambient Music"}
            >
                {isMuted ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-museum-muted opacity-50">
                        <path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6" />
                    </svg>
                ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-museum-accent animate-pulse-slow">
                        <path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                    </svg>
                )}
            </button>
        </div>
    );
};

export default MuteToggle;
