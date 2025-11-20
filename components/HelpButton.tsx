import React, { useState } from 'react';
import InteractiveTutorial from './InteractiveTutorial';

const HelpButton: React.FC = () => {
    const [showTutorial, setShowTutorial] = useState(false);
    const [hasSeenTutorial, setHasSeenTutorial] = useState(() => {
        // Check if user has already seen the tutorial
        return localStorage.getItem('hasSeenTutorial') === 'true';
    });

    // Auto-show tutorial on first visit
    React.useEffect(() => {
        if (!hasSeenTutorial) {
            const timer = setTimeout(() => {
                setShowTutorial(true);
            }, 1000); // Show after 1 second
            return () => clearTimeout(timer);
        }
    }, [hasSeenTutorial]);

    const handleOpenTutorial = () => {
        setShowTutorial(true);
    };

    const handleCloseTutorial = () => {
        setShowTutorial(false);
        setHasSeenTutorial(true);
        localStorage.setItem('hasSeenTutorial', 'true');
    };

    return (
        <>
            {/* Help Button */}
            <button
                onClick={handleOpenTutorial}
                className="group relative flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 hover:from-cyan-500/20 hover:to-purple-500/20 border border-cyan-400/30 hover:border-cyan-400/50 rounded-lg transition-all duration-200 shadow-lg hover:shadow-cyan-500/30"
                aria-label="Show tutorial"
            >
                {/* Icon */}
                <svg
                    className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>

                {/* Text */}
                <span className="text-sm font-medium text-white">
                    Tutorial
                </span>

                {/* Pulse indicator for first-time users */}
                {!hasSeenTutorial && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                    </span>
                )}
            </button>

            {/* Tutorial Modal */}
            {showTutorial && <InteractiveTutorial onClose={handleCloseTutorial} />}
        </>
    );
};

export default HelpButton;
