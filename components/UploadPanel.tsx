import React, { useState } from 'react';
import { Job, ImageFile, JobStatus } from '../types';
import FileInput from './FileInput';
import StatusChip from './StatusChip';
import { api } from '../services/api';

interface UploadPanelProps {
  imageA: ImageFile | null;
  setImageA: (file: ImageFile | null) => void;
  imageB: ImageFile | null;
  setImageB: (file: ImageFile | null) => void;
  aoi: number[][] | null;
  job: Job | null;
  onProcess: () => void;
  onReset: () => void;
}

const UploadPanel: React.FC<UploadPanelProps> = ({
  imageA,
  setImageA,
  imageB,
  setImageB,
  aoi,
  job,
  onProcess,
  onReset
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'status' | 'settings'>('upload');

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, setImage: (file: ImageFile | null) => void) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      try {
        const uploadedFile = await api.uploadFile(file);
        setImage(uploadedFile);
      } catch (error) {
        console.error("Upload failed", error);
      }
    }
  };

  const isProcessing = job?.status === JobStatus.RUNNING || job?.status === JobStatus.PENDING;
  const isProcessable = imageA && imageB && aoi && !isProcessing && job?.status !== JobStatus.DONE;

  const tabs = [
    { id: 'upload', label: 'Upload', icon: '📁' },
    { id: 'status', label: 'Status', icon: '⚡' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <div className="w-96 h-full bg-slate-900/95 backdrop-blur-xl border-r border-white/10 flex flex-col">
      {/* Panel Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Control Center
          </h2>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-slate-800/50 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${activeTab === tab.id
                ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400 border border-cyan-400/30'
                : 'text-gray-400 hover:text-gray-300 hover:bg-slate-700/30'
                }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'upload' && (
          <div className="p-6 space-y-6">
            {/* File Upload Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Dataset Upload</h3>

              <div className="space-y-4">
                <FileInput
                  label="Reference Image (A)"
                  onFileChange={(e) => handleFileChange(e, setImageA)}
                  file={imageA?.file ?? null}
                  disabled={!!imageA}
                  variant="primary"
                />
                <FileInput
                  label="Target Image (B)"
                  onFileChange={(e) => handleFileChange(e, setImageB)}
                  file={imageB?.file ?? null}
                  disabled={!!imageB}
                  variant="secondary"
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Quick Actions</h3>

              <button
                onClick={() => {
                  // Load sample data logic here
                  // TODO: Implement sample data loading
                }}
                className="w-full p-3 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-400/30 rounded-lg hover:from-indigo-500/30 hover:to-purple-500/30 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <span>🎯</span>
                <span className="text-sm font-medium">Load Sample Dataset</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'status' && (
          <div className="p-6 space-y-6">
            {/* Processing Pipeline */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Processing Pipeline</h3>

              <div className="space-y-3">
                {[
                  { step: 1, label: 'Image Upload', completed: imageA && imageB },
                  { step: 2, label: 'AOI Selection', completed: !!aoi },
                  { step: 3, label: 'AI Processing', completed: job?.status === JobStatus.DONE },
                  { step: 4, label: 'Results Ready', completed: job?.status === JobStatus.DONE }
                ].map(({ step, label, completed }) => (
                  <div key={step} className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-300 ${completed
                    ? 'bg-green-500/10 border-green-400/30 text-green-400'
                    : step === 2 && !completed
                      ? 'bg-cyan-500/10 border-cyan-400/30 text-cyan-400'
                      : 'bg-slate-800/50 border-slate-700 text-gray-500'
                    }`}>
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold ${completed
                        ? 'bg-green-400 border-green-400 text-black'
                        : 'border-current'
                        }`}>
                        {completed ? '✓' : step}
                      </div>
                      <span className="font-medium">{label}</span>
                    </div>
                    {completed && (
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Job Details */}
            {job && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Job Details</h3>

                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-400">Status</span>
                    <StatusChip status={job.status} />
                  </div>
                  {job.message && (
                    <div className="mb-3">
                      <span className="text-xs text-gray-400">Message</span>
                      <p className="text-sm text-gray-300 mt-1">{job.message}</p>
                    </div>
                  )}
                  {isProcessing && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Progress</span>
                        <span>65%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div className="h-2 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full animate-pulse" style={{ width: '65%' }}></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Processing Settings</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Alignment Precision</label>
                  <select className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white">
                    <option>High Precision (100x)</option>
                    <option>Medium Precision (50x)</option>
                    <option>Standard Precision (25x)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Output Format</label>
                  <select className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white">
                    <option>GeoTIFF</option>
                    <option>NetCDF</option>
                    <option>PNG</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="text-sm text-gray-400">Enable Quality Assessment</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-6 border-t border-white/10 space-y-3">
        <button
          id="process-button"
          onClick={onProcess}
          disabled={!isProcessable}
          className={`w-full p-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-50 ${isProcessable
            ? 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white shadow-lg hover:shadow-cyan-500/25'
            : 'bg-slate-700 text-gray-400 cursor-not-allowed'
            }`}
        >
          {isProcessing ? (
            <div className="flex items-center justify-center space-x-3">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Processing...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-3">
              <span>⚡</span>
              <span>Start AI Alignment</span>
            </div>
          )}
        </button>

        <button
          onClick={onReset}
          className="w-full p-3 rounded-xl font-medium bg-slate-800/50 border border-slate-700 text-gray-300 hover:bg-slate-700/50 hover:border-slate-600 transition-all duration-300"
        >
          Reset Session
        </button>
      </div>
    </div>
  );
};

export default UploadPanel;
