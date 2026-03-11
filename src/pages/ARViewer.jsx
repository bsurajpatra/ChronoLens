import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { startAR, stopAR } from '../ar/mindarScene';
import Loader from '../components/Loader';
import PortraitPanel from '../components/PortraitPanel';
import MuteToggle from '../components/MuteToggle';
import portraits from '../data/portraits.json';
import { useAmbientAudio } from '../hooks/useAmbientAudio';

const ARViewer = () => {
    const navigate = useNavigate();
    const arContainerRef = useRef(null);
    const { isMuted, toggleMute, stopAmbient } = useAmbientAudio();
    const [arStatus, setArStatus] = useState('initializing'); // initializing, ready, error
    const [activePortraitIndex, setActivePortraitIndex] = useState(null);
    const [showGuidance, setShowGuidance] = useState(false);

    // Tracking guidance timer
    useEffect(() => {
        let timer;
        if (arStatus === 'ready' && activePortraitIndex === null) {
            timer = setTimeout(() => {
                setShowGuidance(true);
            }, 5000); // 5 seconds of no detection
        } else {
            setShowGuidance(false);
        }
        return () => clearTimeout(timer);
    }, [arStatus, activePortraitIndex]);

    const handleInitialARSetup = async () => {
        setArStatus('initializing');
        try {
            const container = arContainerRef.current;
            if (!container) return;

            await startAR(
                container,
                (index) => {
                    setActivePortraitIndex(index);
                    setShowGuidance(false);
                },
                (index) => {
                    setActivePortraitIndex((current) => current === index ? null : current);
                }
            );

            setArStatus('ready');
        } catch (error) {
            console.error("AR Start Failure:", error);
            setArStatus('error');
        }
    };

    useEffect(() => {
        handleInitialARSetup();
        
        return () => {
            // Clean up AR engine but keep audio unless explicitly navigating back
            stopAR();
        };
    }, []);

    const handleBack = () => {
        stopAmbient();
        navigate('/');
    };

    const activePortrait = activePortraitIndex !== null ? portraits[activePortraitIndex] : null;

    return (
        <div className="fixed inset-0 bg-black overflow-hidden no-select select-none flex flex-col items-center justify-center font-sans">

            {/* Phase-7 UI: Museum Aesthetic Layer */}
            <div className="museum-vignette opacity-60"></div>

            {/* AR Scene Hook */}
            <div
                ref={arContainerRef}
                id="ar-container"
                className="absolute inset-0 z-0 bg-black transition-opacity duration-1000"
                style={{ opacity: arStatus === 'ready' ? 1 : 0 }}
            />

            {/* Navigation & Audio Controls */}
            <div className="fixed top-8 left-6 z-[9999] pointer-events-auto">
                <button
                    onClick={handleBack}
                    onTouchEnd={(e) => {
                        e.preventDefault();
                        handleBack();
                    }}
                    className="w-14 h-14 bg-museum-secondary/95 backdrop-blur-3xl border border-museum-accent/40 rounded-full flex items-center justify-center active:scale-90 transition-all shadow-2xl"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                    aria-label="Back to Gallery"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-museum-accent">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                </button>
            </div>

            {/* Phase-X: Ambient Mute Toggle */}
            <MuteToggle isMuted={isMuted} onToggle={toggleMute} />

            {/* Phase-7: Production Scanner UI */}
            {arStatus === 'ready' && (
                <div className="absolute inset-0 z-50 pointer-events-none flex flex-col items-center justify-center p-6">

                    {/* Centered Scanning Reticle */}
                    <div className={`relative transition-all duration-700 ${activePortraitIndex !== null ? 'scale-110 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}>
                        <div className="scanning-frame scanning-pulse">
                            {/* Corner Indicators - Offsets now handled in index.css */}
                            <div className="scanning-corner top-0 left-0 rounded-tl-2xl shadow-[-5px_-5px_20px_rgba(198,161,91,0.2)]"></div>
                            <div className="scanning-corner top-0 right-0 rounded-tr-2xl shadow-[5px_-5px_20px_rgba(198,161,91,0.2)]"></div>
                            <div className="scanning-corner bottom-0 left-0 rounded-bl-2xl shadow-[-5px_5px_20px_rgba(198,161,91,0.2)]"></div>
                            <div className="scanning-corner bottom-0 right-0 rounded-br-2xl shadow-[5px_5px_20px_rgba(198,161,91,0.2)]"></div>
                        </div>

                        <p className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-max text-museum-accent/80 text-[10px] tracking-[0.4em] uppercase font-bold animate-pulse">
                            Align portrait within frame
                        </p>
                    </div>

                    {/* Tracking Guidance Hint */}
                    <div className={`absolute bottom-32 bg-museum-accent/10 backdrop-blur-3xl px-8 py-4 rounded-2xl border border-museum-accent/20 transition-all duration-700 ${showGuidance ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        <p className="text-museum-accent text-[9px] tracking-[0.2em] uppercase font-bold text-center">
                            Move closer or improve lighting
                        </p>
                    </div>
                </div>
            )}

            {/* Information Surface */}
            <PortraitPanel portrait={activePortrait} isActive={activePortraitIndex !== null} />

            {/* Loading Overlay */}
            {arStatus === 'initializing' && (
                <div className="absolute inset-0 z-[1000] flex flex-col items-center justify-center bg-black bg-opacity-95 text-center">
                    <Loader message="Preparing ChronoLens Experience…" />
                </div>
            )}

            {/* Error / Fallback Surface */}
            {arStatus === 'error' && (
                <div className="absolute inset-0 z-[10001] flex flex-col items-center justify-center bg-museum-bg p-10 text-center space-y-10 safe-top safe-bottom">
                    <div className="w-20 h-20 rounded-full bg-museum-accent/5 border border-museum-accent/20 flex items-center justify-center text-museum-accent">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                            <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-museum-text font-serif text-2xl font-bold">Camera Unavailable</h3>
                        <p className="text-museum-muted text-sm leading-relaxed max-w-xs mx-auto">
                            Ensure camera permissions are granted to unlock the immersive museum archive.
                        </p>
                    </div>
                    <div className="w-full flex flex-col gap-4 max-w-xs">
                        <button onClick={handleInitialARSetup} className="w-full py-5 bg-museum-accent rounded-2xl text-museum-bg font-bold tracking-[0.2em] uppercase text-[11px] shadow-xl active:scale-95 transition-all">Retry Experience</button>
                        <button onClick={handleBack} className="w-full py-5 border border-museum-accent/20 rounded-2xl text-museum-accent font-bold tracking-[0.2em] uppercase text-[11px] active:scale-95 transition-all">Back to Lobby</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ARViewer;
