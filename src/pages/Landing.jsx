import React from 'react';
import { useNavigate } from 'react-router-dom';
import InstructionPanel from '../components/InstructionPanel';
import { useSpatialAmbient } from '../hooks/useSpatialAmbient';
import MuteToggle from '../components/MuteToggle';
import InstallPrompt from '../components/InstallPrompt';
import ImmersiveBackground from '../components/ImmersiveBackground';
const Landing = () => {
    const navigate = useNavigate();
    const { startAmbient, toggleMute, isMuted } = useSpatialAmbient();
    const [deferredPrompt, setDeferredPrompt] = React.useState(null);
    const [canInstall, setCanInstall] = React.useState(false);

    React.useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setCanInstall(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setCanInstall(false);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            alert("To install this app on your device:\n\n1. Tap 'Add to Home Screen' in your browser menu (Android/Chrome).\n2. Tap 'Share' then 'Add to Home Screen' (iOS/Safari).");
            return;
        }

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            setCanInstall(false);
        }
        setDeferredPrompt(null);
    };

    return (
        <div className="h-screen flex flex-col items-center justify-between p-6 safe-top safe-bottom relative overflow-hidden text-museum-text select-none text-center">
            {/* Cinematic Background Layer */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                {/* Primary Immersive 3D Background */}
                <ImmersiveBackground />

                {/* Layered Branding Vignettes for Depth */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-transparent to-black/95 z-2"></div>
                <div className="absolute inset-0 bg-black/30 backdrop-blur-[0.5px] z-1"></div>
            </div>

            {/* Museum Atmosphere Layers */}
            <div className="grain"></div>
            <div className="absolute inset-0 museum-vignette z-1"></div>

            {/* Top Atmospheric Gradient */}
            <div className="absolute top-0 left-0 w-full h-[30%] bg-gradient-to-b from-museum-accent/10 to-transparent pointer-events-none"></div>

            <header className="w-full pt-10 flex justify-center z-10 opacity-0 animate-reveal" style={{ animationDelay: '0.2s' }}>
                <div className="h-[1px] w-8 bg-museum-accent/30 mr-4 self-center"></div>
                <h1 className="text-sm font-serif font-bold tracking-[0.4em] text-museum-accent uppercase">Museum Experience</h1>
                <div className="h-[1px] w-8 bg-museum-accent/30 ml-4 self-center"></div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center text-center space-y-12 z-10 w-full max-w-md">
                <div className="space-y-6 px-4">
                    <div className="relative inline-block group opacity-0 animate-reveal" style={{ animationDelay: '0.4s' }}>
                        <div className="absolute -inset-4 bg-museum-accent/5 rounded-full blur-2xl group-hover:bg-museum-accent/10 transition-all duration-1000"></div>
                        <h2 className="relative text-6xl font-serif font-bold tracking-tight text-museum-text leading-tight drop-shadow-2xl animate-float">
                            ChronoLens
                        </h2>
                    </div>
                    <p className="text-museum-accent tracking-[0.25em] uppercase text-[10px] font-bold opacity-0 animate-reveal pb-4" style={{ animationDelay: '0.6s' }}>
                        Exploring History Through Augmented Reality
                    </p>
                    <p className="text-museum-muted text-sm leading-relaxed max-w-[300px] mx-auto opacity-0 animate-reveal font-medium" style={{ animationDelay: '0.8s' }}>
                        Scan historic portraits to uncover contextual narratives from the past through immersive augmented reality.
                    </p>
                </div>

                <div className="opacity-0 animate-reveal" style={{ animationDelay: '1s' }}>
                    <InstructionPanel />
                </div>
            </main>

            <footer className="w-full max-w-xs z-20 pb-32 flex flex-col items-center opacity-0 animate-reveal" style={{ animationDelay: '1.2s' }}>
                {/* Enter AR Button - Moved Up */}
                <div className="w-full mb-8">
                    <button
                        onClick={async () => {
                            // Only force start if user hasn't explicitly muted already
                            if (isMuted) {
                                await startAmbient();
                            }
                            navigate('/ar');
                        }}
                        className="group relative w-full overflow-hidden rounded-xl cursor-pointer"
                    >
                        <div className="absolute inset-0 bg-museum-accent transition-premium group-active:scale-95 group-active:brightness-90"></div>
                        <div className="relative py-5 text-museum-bg font-bold text-center tracking-[0.2em] uppercase text-xs shadow-[0_10px_30px_rgba(198,161,91,0.2)] transition-premium group-active:scale-95 animate-button-pulse">
                            Enter AR Gallery
                        </div>
                    </button>
                </div>

                {!window.matchMedia('(display-mode: standalone)').matches && (
                    <>
                        <div className="w-12 h-[1px] bg-museum-accent/20 mb-4"></div>
                        <button
                            onClick={handleInstallClick}
                            className="text-[10px] tracking-[0.3em] uppercase text-museum-accent/60 font-bold hover:text-museum-accent transition-all flex flex-col items-center group"
                        >
                            <span className="group-hover:translate-y-[-2px] transition-transform">Download Archive</span>
                            {!canInstall && (
                                <span className="text-[8px] opacity-40 normal-case tracking-normal mt-1">(Web App Mode)</span>
                            )}
                        </button>
                    </>
                )}
            </footer>

            {/* Ambient Control - Moved to Bottom Left */}
            <div className="fixed bottom-8 left-6 z-[9999] flex flex-col items-center space-y-2">
                <MuteToggle isMuted={isMuted} onToggle={toggleMute} className="relative" />
                <p className="text-[8px] tracking-[0.3em] uppercase text-museum-accent/40 font-bold">
                    Sound
                </p>
            </div>

            {/* PWA Install Prompt - still there as a popup for better visibility */}
            <InstallPrompt />
        </div>
    );
};

export default Landing;
