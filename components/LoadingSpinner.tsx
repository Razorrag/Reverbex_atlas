import React from 'react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', message }) => {
    const sizeClasses = {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-2',
        lg: 'w-12 h-12 border-3'
    };

    return (
        <div className="flex flex-col items-center justify-center space-y-3">
            <div className="relative">
                <div className={`${sizeClasses[size]} border-cyan-400 border-t-transparent rounded-full animate-spin`}></div>
                <div className={`absolute inset-0 ${sizeClasses[size]} border-purple-400/30 rounded-full`}></div>
            </div>
            {message && (
                <p className="text-sm text-gray-400 animate-pulse">{message}</p>
            )}
        </div>
    );
};

export default LoadingSpinner;
