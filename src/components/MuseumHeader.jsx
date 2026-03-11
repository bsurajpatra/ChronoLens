import React from 'react';

const MuseumHeader = ({ title }) => {
    return (
        <header className="fixed top-0 left-0 w-full z-50 safe-top px-6 py-8 flex items-center justify-between">
            <h1 className="text-2xl font-serif font-bold tracking-tight text-museum-accent">
                {title || 'ChronoLens'}
            </h1>
            <div className="w-8 h-[1px] bg-museum-accent/50"></div>
        </header>
    );
};

export default MuseumHeader;
