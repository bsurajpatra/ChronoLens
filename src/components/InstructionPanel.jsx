import React, { useState } from 'react';

const InstructionPanel = () => {
    const [isOpen, setIsOpen] = useState(false);
    
    const instructions = [
        "Use a mobile device",
        "Allow camera access",
        "Scan historic portraits",
        "Tap overlays to explore history"
    ];

    return (
        <div className="w-full max-w-[280px] mx-auto z-20">
            {/* Toggle Header */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-6 py-4 bg-museum-secondary/30 backdrop-blur-xl border border-museum-accent/20 rounded-2xl transition-all duration-300 hover:bg-museum-accent/5 active:scale-95 group"
            >
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-museum-accent shadow-[0_0_8px_rgba(198,161,91,0.6)]"></div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-museum-accent/80">How it Works</span>
                </div>
                <span className={`text-museum-accent/40 text-xs transition-transform duration-500 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
                    ↓
                </span>
            </button>

            {/* Expandable Content */}
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-80 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                <div className="bg-museum-secondary/40 backdrop-blur-md border border-museum-accent/10 rounded-2xl p-2 shadow-2xl overflow-hidden relative">
                    <ul className="space-y-0 relative z-10">
                        {instructions.map((text, index) => (
                            <li key={index} className={`flex items-center px-4 py-3 ${index !== instructions.length - 1 ? 'border-b border-museum-accent/5' : ''}`}>
                                <div className="flex-shrink-0 w-1 h-1 rounded-full bg-museum-accent/40 mr-4"></div>
                                <span className="text-museum-muted text-[10px] font-medium tracking-wide text-left">{text}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default InstructionPanel;
