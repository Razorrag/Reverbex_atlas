import React from 'react';
import { JobStatus } from '../types';

interface StatusChipProps {
    status: JobStatus;
}

const StatusChip: React.FC<StatusChipProps> = ({ status }) => {
    const statusConfig: { [key in JobStatus]: {
        text: string;
        icon: string;
        className: string;
        bgGradient: string;
        glow: string;
    } } = {
        [JobStatus.IDLE]: {
            text: 'Idle',
            icon: '●',
            className: 'text-gray-400 bg-gray-500/20 border-gray-500/50',
            bgGradient: 'from-gray-500/20 to-slate-500/20',
            glow: 'shadow-gray-500/20'
        },
        [JobStatus.PENDING]: {
            text: 'Pending',
            icon: '⏳',
            className: 'text-yellow-300 bg-yellow-500/20 border-yellow-500/50',
            bgGradient: 'from-yellow-500/20 to-amber-500/20',
            glow: 'shadow-yellow-500/20'
        },
        [JobStatus.RUNNING]: {
            text: 'Running',
            icon: '⚡',
            className: 'text-blue-300 bg-blue-500/20 border-blue-500/50 animate-pulse',
            bgGradient: 'from-blue-500/20 to-cyan-500/20',
            glow: 'shadow-blue-500/30'
        },
        [JobStatus.DONE]: {
            text: 'Complete',
            icon: '✓',
            className: 'text-green-300 bg-green-500/20 border-green-500/50',
            bgGradient: 'from-green-500/20 to-emerald-500/20',
            glow: 'shadow-green-500/30'
        },
        [JobStatus.ERROR]: {
            text: 'Error',
            icon: '✗',
            className: 'text-red-300 bg-red-500/20 border-red-500/50',
            bgGradient: 'from-red-500/20 to-rose-500/20',
            glow: 'shadow-red-500/30'
        },
    };

    const config = statusConfig[status] || statusConfig[JobStatus.IDLE];

    return (
        <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium border backdrop-blur-sm transition-all duration-300 ${config.className} ${config.glow} hover:scale-105`}>
            <span className="text-base">{config.icon}</span>
            <span>{config.text}</span>
            {status === JobStatus.RUNNING && (
                <div className="w-1 h-1 bg-current rounded-full animate-pulse"></div>
            )}
            {status === JobStatus.DONE && (
                <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
            )}
        </div>
    );
};

export default StatusChip;
