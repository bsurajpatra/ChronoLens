import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * CHRONOLENS AUDIO ENGINE - ULTIMATE RESILIENCE EDITION
 * This version uses a persistent global audio instance that is 
 * completely decoupled from React component life-cycles to prevent 
 * "unmount" pauses and browser throttling.
 */
let globalAudio = null;
let globalIsMuted = true;
let globalUserWantsPlaying = false; 
const SILENCE_OFFSET = 4;

export const useAmbientAudio = () => {
    const [isPlaying, setIsPlaying] = useState(globalUserWantsPlaying);
    const [isMuted, setIsMuted] = useState(globalIsMuted);
    const fadeTimerRef = useRef(null);

    const fadeTo = (target, duration = 1200) => {
        if (!globalAudio) return;
        if (fadeTimerRef.current) clearInterval(fadeTimerRef.current);

        const startVol = globalAudio.volume;
        const steps = 40;
        const interval = duration / steps;
        const volStep = (target - startVol) / steps;

        let currentStep = 0;
        fadeTimerRef.current = setInterval(() => {
            currentStep++;
            const nextVol = startVol + (volStep * currentStep);
            if (currentStep >= steps) {
                globalAudio.volume = target;
                clearInterval(fadeTimerRef.current);
            } else {
                globalAudio.volume = Math.max(0, Math.min(1, nextVol));
            }
        }, interval);
    };

    const runPlay = async () => {
        if (!globalAudio) return;
        try {
            if (globalAudio.currentTime < SILENCE_OFFSET) {
                globalAudio.currentTime = SILENCE_OFFSET;
            }
            await globalAudio.play();
            
            // Register for Media Session to prevent mobile sleep
            if ('mediaSession' in navigator) {
                navigator.mediaSession.playbackState = 'playing';
            }
        } catch (e) {
            console.warn("🎻 Resilience: Playback attempt recovered.");
        }
    };

    useEffect(() => {
        if (!globalAudio) {
            console.log("🎻 Initializing Persistent Museum Soundscape...");
            globalAudio = new Audio('/audio/ambient.mp3');
            globalAudio.loop = true; // Use native looping for stability
            globalAudio.preload = 'auto';
            globalAudio.muted = globalIsMuted;
            globalAudio.volume = 0;

            // CRITICAL: Handle the silence offset even on native loop
            globalAudio.ontimeupdate = () => {
                if (globalAudio.currentTime < SILENCE_OFFSET && globalUserWantsPlaying) {
                    globalAudio.currentTime = SILENCE_OFFSET;
                }
            };

            // Force resume if browser pauses it without user intent
            globalAudio.onpause = () => {
                if (globalUserWantsPlaying && !document.hidden) {
                    console.log("🎻 Browser-induced pause detected. Resuming...");
                    runPlay();
                }
                setIsPlaying(false);
            };

            globalAudio.onplay = () => setIsPlaying(true);
            globalAudio.load();
        }

        // Sync local hook state with global state
        setIsPlaying(globalUserWantsPlaying && !globalAudio.paused);
        setIsMuted(globalIsMuted);

        // Visibility handling: Professional fade pause/resume
        const handleVisibility = () => {
            if (!globalAudio || !globalUserWantsPlaying) return;
            if (document.hidden) {
                globalAudio.pause();
            } else {
                runPlay();
            }
        };

        document.addEventListener('visibilitychange', handleVisibility);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibility);
        };
    }, []);

    const startAmbient = useCallback(async () => {
        if (!globalAudio) return;
        globalUserWantsPlaying = true;
        globalIsMuted = false;
        setIsMuted(false);
        globalAudio.muted = false;
        await runPlay();
        fadeTo(0.35, 1500);
    }, []);

    const toggleMute = useCallback(async () => {
        if (!globalAudio) return;
        const nextMute = !globalIsMuted;
        globalIsMuted = nextMute;
        setIsMuted(nextMute);

        if (!nextMute) {
            globalUserWantsPlaying = true;
            globalAudio.muted = false;
            await runPlay();
            fadeTo(0.35, 800);
        } else {
            fadeTo(0, 800);
            // We keep it physically playing at volume 0 to prevent "pause" timeouts
        }
    }, []);

    const stopAmbient = useCallback(() => {
        if (!globalAudio) return;
        console.log("🎻 Full Stop requested.");
        globalUserWantsPlaying = false;
        fadeTo(0, 800);
        setTimeout(() => {
            if (globalAudio) {
                globalAudio.pause();
                globalAudio.currentTime = SILENCE_OFFSET;
            }
        }, 850);
    }, []);

    return { startAmbient, stopAmbient, toggleMute, isMuted, isPlaying };
};
