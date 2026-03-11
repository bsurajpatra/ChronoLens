import { useState, useEffect, useRef, useCallback } from 'react';

// Single global instance to persist through route changes
let globalAudio = null;
let globalIsPlaying = false;
let globalIsMuted = false;
const SILENCE_OFFSET = 4; // Start 4 seconds in to skip silence

export const useAmbientAudio = () => {
    const [isPlaying, setIsPlaying] = useState(globalIsPlaying);
    const [isMuted, setIsMuted] = useState(globalIsMuted);
    const fadeTimerRef = useRef(null);

    useEffect(() => {
        if (!globalAudio) {
            console.log("🎻 Initializing Museum Soundscape Singleton...");
            globalAudio = new Audio('/audio/ambient.mp3');
            globalAudio.loop = false;
            globalAudio.preload = 'auto';
            
            // Sync logic
            globalAudio.onplay = () => { globalIsPlaying = true; setIsPlaying(true); };
            globalAudio.onpause = () => { globalIsPlaying = false; setIsPlaying(false); };
            globalAudio.onended = () => {
                if (globalIsPlaying) {
                    globalAudio.currentTime = SILENCE_OFFSET;
                    globalAudio.play().catch(() => {});
                }
            };

            // Attempt muted start on mount (Legal according to Autoplay policies)
            globalAudio.muted = true;
            globalAudio.volume = 0;
            globalAudio.currentTime = SILENCE_OFFSET;
            globalAudio.play().catch(() => {
                console.warn("🎻 Browser blocked muted autoplay. Interaction required.");
            });
            
            globalAudio.load();
        } else {
            setIsPlaying(globalIsPlaying);
            setIsMuted(globalIsMuted);
        }

        const handleVisibility = () => {
            if (!globalAudio) return;
            if (document.hidden) {
                if (globalIsPlaying && !globalAudio.paused) globalAudio.pause();
            } else {
                if (globalIsPlaying && !globalIsMuted) {
                    globalAudio.play().catch(() => {});
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibility);
        return () => document.removeEventListener('visibilitychange', handleVisibility);
    }, []);

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

    const startAmbient = useCallback(async () => {
        if (!globalAudio) return false;
        
        console.log("🎻 User gesture detected: Fading in soundscape...");
        
        // Unmute and play (now allowed because of user interaction)
        globalAudio.muted = false;

        try {
            await globalAudio.play();
            globalIsPlaying = true;
            setIsPlaying(true);
            fadeTo(0.35, 2000); // 2-second smooth fade-in to 35%
            return true;
        } catch (err) {
            // Keep trying if blocked
            return false;
        }
    }, []);

    const stopAmbient = useCallback(() => {
        if (!globalAudio) return;
        console.log("🎻 Stopping Soundscape...");
        fadeTo(0, 800);
        setTimeout(() => {
            if (globalAudio) {
                globalAudio.pause();
                globalAudio.currentTime = SILENCE_OFFSET;
                globalIsPlaying = false;
                setIsPlaying(false);
            }
        }, 850);
    }, []);

    const toggleMute = useCallback(() => {
        if (!globalAudio) return;
        const nextMute = !globalIsMuted;
        globalIsMuted = nextMute;
        setIsMuted(nextMute);
        fadeTo(nextMute ? 0 : 0.35, 600);
    }, []);

    return { startAmbient, stopAmbient, toggleMute, isMuted, isPlaying };
};
