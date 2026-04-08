import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { startAR, stopAR } from '../ar/mindarScene';
import Loader from '../components/Loader';
import PortraitPanel from '../components/PortraitPanel';
import MuteToggle from '../components/MuteToggle';
import portraits from '../data/portraits.json';
import { useSpatialAmbient } from '../hooks/useSpatialAmbient';

const ARViewer = () => {
    const navigate = useNavigate();
    const arContainerRef = useRef(null);
    const { isMuted, toggleMute, stopAmbient, setDetected } = useSpatialAmbient();
    const [arStatus, setArStatus] = useState('initializing'); // initializing, ready, error
    const [activePortraitIndex, setActivePortraitIndex] = useState(null);
    const [transitioningPortraitIndex, setTransitioningPortraitIndex] = useState(null);
    const [transitionStatus, setTransitionStatus] = useState('idle'); // idle, transitioningOut, transitioningIn
    const [showGuidance, setShowGuidance] = useState(false);
    const [showScanLock, setShowScanLock] = useState(false);
    
    // Tracking Stability UX System States
    const [isLocked, setIsLocked] = useState(false);
    const [targetVisible, setTargetVisible] = useState(false);

    const debounceTimerRef = useRef(null);
    const activeIndexRef = useRef(null); 
    const lossTimeoutRef = useRef(null);
    const isLockedRef = useRef(false);
    const targetVisibleRef = useRef(false);

    const handleTargetFound = (index) => {
        // Cancel any pending loss sequence
        if (lossTimeoutRef.current) {
            console.log("Target regained - cancel timeout");
            clearTimeout(lossTimeoutRef.current);
            lossTimeoutRef.current = null;
        }

        setTargetVisible(true);
        targetVisibleRef.current = true;

        // Prevent duplicate triggers if already searching or active
        if (activeIndexRef.current === index) return;
        
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        
        debounceTimerRef.current = setTimeout(() => {
            // Check once more after debounce
            if (activeIndexRef.current === index) return;

            console.log("Transition started");
            setTransitioningPortraitIndex(index);
            setTransitionStatus('transitioningOut');
            
            // Trigger Recognition Flash (PART 1 - Scan Lock Zoom)
            setShowScanLock(true);
            setTimeout(() => setShowScanLock(false), 2000); // Sync with CSS 2s duration

            setTimeout(() => {
                activeIndexRef.current = index;
                setActivePortraitIndex(index);
                setTransitionStatus('transitioningIn');
                setDetected(true); // PART 2: Detection Spatial Boost
                console.log("Portrait detected");

                setTimeout(() => {
                    setTransitionStatus('idle');
                    setTransitioningPortraitIndex(null);
                    setShowGuidance(false);
                    console.log("Transition completed");
                }, 240);
            }, 180);
        }, 250);
    };

    const handleTargetLost = (index) => {
        setTargetVisible(false);
        targetVisibleRef.current = false;

        // Skip loss logic entirely if view is locked
        if (isLockedRef.current) return;

        // If the target we just lost is the one we are actively showing
        if (activeIndexRef.current === index) {
            console.log("Target lost - grace period started");

            if (lossTimeoutRef.current) clearTimeout(lossTimeoutRef.current);
            
            // Start 1500ms Grace Period
            lossTimeoutRef.current = setTimeout(() => {
                // Double check lock state just in case it was toggled during timeout
                if (isLockedRef.current) return;

                console.log("Grace period expired - hiding UI");
                if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
                activeIndexRef.current = null;
                setActivePortraitIndex(null);
                setDetected(false); // PART 2: Ambient restored
                lossTimeoutRef.current = null;
            }, 1500);
        }
    };

    const toggleLock = () => {
        if (activePortraitIndex === null && !isLocked) return;
        
        const newLockState = !isLocked;
        setIsLocked(newLockState);
        isLockedRef.current = newLockState;
        
        if (newLockState) {
            console.log("View locked");
        } else {
            console.log("View unlocked");
            // If unlocked but target is no longer visible, execute loss logic
            if (!targetVisibleRef.current) {
                console.log("Grace period expired - hiding UI (from unlock)");
                if (lossTimeoutRef.current) clearTimeout(lossTimeoutRef.current);
                if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
                activeIndexRef.current = null;
                setActivePortraitIndex(null);
                setDetected(false);
            }
        }
    };

    const handleInitialARSetup = async () => {
        setArStatus('initializing');
        try {
            const container = arContainerRef.current;
            if (!container) return;

            await startAR(
                container,
                handleTargetFound,
                handleTargetLost
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
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
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
                    className="w-10 h-10 bg-museum-secondary/95 backdrop-blur-3xl border border-museum-accent/20 rounded-full flex items-center justify-center active:scale-90 transition-all shadow-2xl"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                    aria-label="Back to Gallery"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-museum-accent">
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
                    <div className={`relative transition-all duration-500 ${(activePortraitIndex !== null || showScanLock || isLocked) ? 'scale-110 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}>
                        <div className="scanning-frame scanning-pulse">
                            <div className="scanning-laser"></div>
                            {/* Corner Viewfinder Brackets */}
                            <div className="scanning-corner tl"></div>
                            <div className="scanning-corner tr"></div>
                            <div className="scanning-corner bl"></div>
                            <div className="scanning-corner br"></div>
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

            {/* Recognition Lock Zoom Effect */}
            {showScanLock && <div className="scan-lock animate-scan-lock"></div>}

            {/* Information Surface */}
            <PortraitPanel 
                portrait={activePortrait} 
                isActive={activePortraitIndex !== null} 
                transitionStatus={transitionStatus}
                isLocked={isLocked}
                onToggleLock={toggleLock}
            />

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
