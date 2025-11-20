import React, { useState } from 'react';

interface FileInputProps {
    label: string;
    onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    file: File | null;
    disabled: boolean;
    variant?: 'primary' | 'secondary';
}

const FileInput: React.FC<FileInputProps> = ({
    label,
    onFileChange,
    file,
    disabled,
    variant = 'primary'
}) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const id = label.replace(/\s+/g, '-').toLowerCase();

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const fakeEvent = {
                target: { files }
            } as React.ChangeEvent<HTMLInputElement>;
            onFileChange(fakeEvent);
        }
    };

    const variantStyles = {
        primary: {
            border: 'border-cyan-500/50',
            bg: 'bg-cyan-500/5',
            accent: 'text-cyan-400',
            icon: 'text-cyan-400'
        },
        secondary: {
            border: 'border-purple-500/50',
            bg: 'bg-purple-500/5',
            accent: 'text-purple-400',
            icon: 'text-purple-400'
        }
    };

    const styles = variantStyles[variant];

    if (file) {
        return (
            <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-300">
                    {label}
                </label>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl backdrop-blur-sm hover:border-green-400/50 transition-all duration-300 group">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-400 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-green-300 font-medium truncate max-w-[200px]">{file.name}</p>
                            <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB • GeoTIFF</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-green-400 font-bold text-lg">✓</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">
                {label}
            </label>
            <label
                htmlFor={id}
                className={`file-input-container cursor-pointer transition-all duration-300 ${isDragOver ? 'dragover' : ''
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <div className="flex flex-col items-center justify-center py-8 px-6">
                    {/* Upload Icon with Animation */}
                    <div className={`w-16 h-16 ${styles.bg} rounded-full flex items-center justify-center mb-4 border ${styles.border} backdrop-blur-sm group-hover:scale-110 transition-all duration-300`}>
                        <svg className={`w-8 h-8 ${styles.icon} group-hover:animate-bounce`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                    </div>

                    {/* Upload Text */}
                    <p className="text-lg font-semibold mb-2">
                        <span className={styles.accent}>Click to upload</span> or drag and drop
                    </p>

                    {/* File Type Hint */}
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full"></div>
                            <span>GeoTIFF (.tif, .tiff)</span>
                        </div>
                        <span>•</span>
                        <span>Max 100MB</span>
                    </div>

                    {/* Accept Indicator */}
                    <div className="mt-4 flex items-center space-x-2">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                        <span className="text-xs text-gray-500">Ready for upload</span>
                    </div>
                </div>

                <input
                    id={id}
                    type="file"
                    className="hidden"
                    onChange={onFileChange}
                    accept=".tif,.tiff"
                    disabled={disabled}
                />
            </label>

            {/* Quick Info Panel */}
            <div className="mt-4 p-3 bg-slate-800/30 rounded-lg border border-slate-700/50 backdrop-blur-sm">
                <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2 text-gray-400">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <span>Supported formats</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <div className="w-1 h-1 bg-cyan-400 rounded-full"></div>
                        <span className="text-cyan-400 font-medium">Multi-band</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FileInput;
