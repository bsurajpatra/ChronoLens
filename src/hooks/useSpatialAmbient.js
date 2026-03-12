import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useSpatialAmbient
 * Pseudo-spatial audio system for museum ambience.
 * Handles volume interpolation and perceptual modulation.
 */

let globalAudio = null;
let globalIsMuted = true;
let globalUserWantsPlaying = false;
const SILENCE_OFFSET = 4;

export const useSpatialAmbient = () => {
    const [isMuted, setIsMuted] = useState(globalIsMuted);
    const [isPlaying, setIsPlaying] = useState(globalUserWantsPlaying);
    
    const stateRef = useRef({
        isDetected: false,
        isPanelFocused: false,
        actualVolume: 0,
        lastTime: 0
    });

    const rafRef = useRef(null);
    const debounceTimerRef = useRef(null);

    useEffect(() => {
        if (!globalAudio) {
            globalAudio = new Audio('/audio/ambient.mp3');
            globalAudio.loop = true;
            globalAudio.preload = 'auto';
            globalAudio.volume = 0;
            globalAudio.muted = globalIsMuted;
            globalAudio.currentTime = SILENCE_OFFSET;
        }

        const interpolate = (time) => {
            if (!globalAudio) return;

            const state = stateRef.current;
            const deltaSeconds = state.lastTime ? (time - state.lastTime) / 1000 : 0.016;
            state.lastTime = time;

            // 1. Determine Target Volume (PART 2 & 3)
            let targetVol = 0.18; // Base
            let duration = 0.7; // Default return duration (PART 2: 700ms)

            if (state.isPanelFocused) {
                targetVol = 0.12; // PART 3: 0.12
                duration = 0.5;   // PART 3: 500ms
            } else if (state.isDetected) {
                targetVol = 0.24; // PART 2: 0.24
                duration = 0.6;   // PART 2: 600ms
            }

            // 2. Smooth Interpolation (PART 4)
            const diff = targetVol - state.actualVolume;
            if (Math.abs(diff) > 0.0001) {
                const step = (Math.abs(diff) / duration) * deltaSeconds;
                if (Math.abs(diff) < step) {
                    state.actualVolume = targetVol;
                } else {
                    state.actualVolume += Math.sign(diff) * step;
                }
            } else {
                state.actualVolume = targetVol;
            }

            // 3. Perception Enhancement (PART 6)
            const modulation = Math.sin(time / 1000 * 0.2) * 0.01;
            
            // 4. Update Audio Node
            if (!globalIsMuted && globalUserWantsPlaying) {
                globalAudio.muted = false;
                globalAudio.volume = Math.max(0, Math.min(1, state.actualVolume + modulation));
                
                // Safety play if state says it should be playing
                if (globalAudio.paused && !document.hidden) {
                    globalAudio.play().catch(() => {});
                }
            } else {
                globalAudio.volume = 0;
                globalAudio.muted = true;
            }

            rafRef.current = requestAnimationFrame(interpolate);
        };

        rafRef.current = requestAnimationFrame(interpolate);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    const startAmbient = useCallback(async () => {
        globalUserWantsPlaying = true;
        setIsPlaying(true);
        if (globalAudio) {
            globalAudio.muted = globalIsMuted;
            try {
                if (globalAudio.currentTime < SILENCE_OFFSET) {
                    globalAudio.currentTime = SILENCE_OFFSET;
                }
                await globalAudio.play();
            } catch (e) {
                console.warn("Spatial Audio: Playback interaction required");
            }
        }
    }, []);

    const stopAmbient = useCallback(() => {
        globalUserWantsPlaying = false;
        setIsPlaying(false);
        if (globalAudio) {
            globalAudio.pause();
        }
    }, []);

    const toggleMute = useCallback(() => {
        globalIsMuted = !globalIsMuted;
        setIsMuted(globalIsMuted);
        if (globalAudio) {
            globalAudio.muted = globalIsMuted;
            if (!globalIsMuted) {
                globalUserWantsPlaying = true;
                globalAudio.play().catch(() => {});
            }
        }
    }, []);

    const setDetected = useCallback((detected) => {
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        
        if (detected) {
            // Immediate boost for detection
            if (!stateRef.current.isDetected) {
                console.log("Spatial boost applied");
            }
            stateRef.current.isDetected = true;
        } else {
            // Debounced restoration for jitter (PART 5)
            debounceTimerRef.current = setTimeout(() => {
                if (stateRef.current.isDetected) {
                    console.log("Ambient restored");
                }
                stateRef.current.isDetected = false;
            }, 300);
        }
    }, []);

    const setPanelFocused = useCallback((focused) => {
        if (focused !== stateRef.current.isPanelFocused) {
            console.log(focused ? "Panel focus attenuation" : "Ambient restored");
        }
        stateRef.current.isPanelFocused = focused;
    }, []);

    const duckAmbient = useCallback((isDucked) => {
        setPanelFocused(isDucked);
    }, [setPanelFocused]);

    return { 
        startAmbient, 
        stopAmbient,
        toggleMute, 
        setDetected, 
        setPanelFocused, 
        duckAmbient,
        isMuted, 
        isPlaying 
    };
};
