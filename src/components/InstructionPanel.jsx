import React from 'react';

const InstructionPanel = () => {
    const instructions = [
        "Use a mobile device",
        "Allow camera access",
        "Scan historic portraits",
        "Tap overlays to explore history"
    ];

    return (
        <div className="w-full max-w-sm bg-museum-secondary/40 backdrop-blur-md border border-museum-accent/20 rounded-2xl p-6 shadow-2xl overflow-hidden relative">
            {/* Subtle inner glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-museum-accent/5 to-transparent pointer-events-none"></div>

            <ul className="space-y-0 relative z-10">
                {instructions.map((text, index) => (
                    <li key={index} className={`flex items-center py-4 ${index !== instructions.length - 1 ? 'border-b border-museum-accent/10' : ''}`}>
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-museum-accent/10 border border-museum-accent/30 flex items-center justify-center mr-4">
                            <div className="w-1.5 h-1.5 rounded-full bg-museum-accent shadow-[0_0_8px_rgba(198,161,91,0.8)]"></div>
                        </div>
                        <span className="text-museum-muted text-xs font-medium tracking-wide">{text}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default InstructionPanel;
