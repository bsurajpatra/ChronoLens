import React, { useState, useEffect } from 'react';

const InstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);

    useEffect(() => {
        const handler = (e) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);

            // Optional: Show alert after a slight delay so it's not jarring
            setTimeout(() => {
                if (window.confirm("ChronoLens: Would you like to install the Digital Archive for offline access?")) {
                    e.prompt();
                    e.userChoice.then((choiceResult) => {
                        if (choiceResult.outcome === 'accepted') {
                            console.log('User accepted the A2HS prompt');
                        }
                        setDeferredPrompt(null);
                    });
                }
            }, 2000);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    // Component doesn't render any UI now, uses standard browser dialogs
    return null;
};

export default InstallPrompt;
