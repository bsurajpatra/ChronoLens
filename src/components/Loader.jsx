import React from 'react';

const Loader = ({ message = "Preparing ChronoLens Experience…" }) => {
    return (
        <div className="flex flex-col items-center justify-center space-y-8 animate-fade-in">
            <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-[1px] border-museum-accent/10 rounded-full"></div>
                <div className="absolute inset-0 border-[1px] border-t-museum-accent rounded-full animate-spin"></div>
                <div className="absolute inset-4 border-[1px] border-v-museum-accent/30 rounded-full animate-spin-reverse"></div>
            </div>
            <div className="flex flex-col items-center space-y-2">
                <p className="text-museum-accent text-[10px] tracking-[0.5em] uppercase font-bold text-center">
                    {message}
                </p>
                <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-museum-accent/30 to-transparent"></div>
            </div>
        </div>
    );
};

export default Loader;
