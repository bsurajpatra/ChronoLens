import React, { useState, useEffect } from 'react';

const InstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handler = (e) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            // Update UI to notify the user they can add to home screen
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsVisible(false);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show the prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        } else {
            console.log('User dismissed the install prompt');
        }

        // We've used the prompt, and can't use it again, so clear it
        setDeferredPrompt(null);
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[10000] w-[90%] max-w-sm">
            <div className="bg-museum-bg/95 backdrop-blur-xl border border-museum-accent/20 rounded-2xl p-4 shadow-2xl flex items-center justify-between space-x-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center space-x-3 text-left">
                    <div className="w-10 h-10 rounded-lg bg-museum-accent/10 flex items-center justify-center border border-museum-accent/20">
                        <img src="/logo.png" alt="App Logo" className="w-6 h-6 object-contain opacity-80" />
                    </div>
                    <div>
                        <h3 className="text-xs font-serif font-bold text-museum-text uppercase tracking-widest">Digital Archive</h3>
                        <p className="text-[10px] text-museum-muted font-medium">Install as web app for offline access</p>
                    </div>
                </div>
                <button
                    onClick={handleInstallClick}
                    className="bg-museum-accent text-museum-bg px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:brightness-110 active:scale-95 transition-premium shadow-lg shadow-museum-accent/20 shrink-0"
                >
                    Install
                </button>
            </div>
        </div>
    );
};

export default InstallPrompt;
