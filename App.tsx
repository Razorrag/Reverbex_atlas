import React, { useState, useEffect, useRef, useCallback } from 'react';
import UploadPanel from './components/UploadPanel';
import MapView from './components/MapView';
import HelpButton from './components/HelpButton';
import { JobStatus, ImageFile, Job } from './types';
import { api } from './services/api';

const App: React.FC = () => {
  const [imageA, setImageA] = useState<ImageFile | null>(null);
  const [imageB, setImageB] = useState<ImageFile | null>(null);
  const [aoi, setAoi] = useState<number[][] | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [processedImageUrls, setProcessedImageUrls] = useState<{ a: string; b: string } | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const pollingIntervalRef = useRef<number | null>(null);

  // Initialize animations and effects
  useEffect(() => {
    const timer = setTimeout(() => setIsInitialized(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Recover job on page load if exists
  useEffect(() => {
    const savedJobId = localStorage.getItem('currentJobId');
    if (savedJobId && !job) {
      // Try to recover the job from backend
      api.getJobStatus(savedJobId)
        .then(recoveredJob => {
          setJob(recoveredJob);
          console.log('Recovered job from backend:', recoveredJob);
        })
        .catch(err => {
          console.log('Could not recover job:', err);
          localStorage.removeItem('currentJobId');
        });
    }
  }, []);

  const clearPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const handleJobStatusCheck = useCallback(async (jobId: string) => {
    try {
      const currentJob = await api.getJobStatus(jobId);
      setJob(currentJob);

      if (currentJob.status === JobStatus.DONE) {
        clearPolling();
        if (currentJob.outputs) {
          const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
          setProcessedImageUrls({
            a: `${baseUrl}${currentJob.outputs.imageAUrl}`,
            b: `${baseUrl}${currentJob.outputs.imageBUrl}`
          });
        }
      } else if (currentJob.status === JobStatus.ERROR) {
        clearPolling();
      }
    } catch (error) {
      console.error('Failed to get job status:', error);
      setJob({ id: jobId, status: JobStatus.ERROR, message: 'Failed to fetch job status.' });
      clearPolling();
    }
  }, [imageA, imageB]);

  useEffect(() => {
    if (job?.id && (job.status === JobStatus.PENDING || job.status === JobStatus.RUNNING)) {
      if (!pollingIntervalRef.current) {
        pollingIntervalRef.current = window.setInterval(() => {
          handleJobStatusCheck(job.id);
        }, 2000);
      }
    }

    return () => {
      clearPolling();
    };
  }, [job, handleJobStatusCheck]);

  const handleProcess = async () => {
    if (!imageA || !imageB || !aoi) return;

    try {
      setJob({ id: '', status: JobStatus.PENDING });
      const newJob = await api.createJob({
        imageAId: imageA.id,
        imageBId: imageB.id,
        aoi,
      });
      setJob(newJob);
      // Save job ID for recovery on page refresh
      localStorage.setItem('currentJobId', newJob.id);
      handleJobStatusCheck(newJob.id);
    } catch (error) {
      console.error('Failed to create job:', error);
      setJob({ id: '', status: JobStatus.ERROR, message: 'Failed to start processing job.' });
    }
  };

  const resetState = () => {
    setImageA(null);
    setImageB(null);
    setAoi(null);
    setJob(null);
    setProcessedImageUrls(null);
    clearPolling();
    // Clear saved job ID
    localStorage.removeItem('currentJobId');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden relative">
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-cyan-900/20 animate-pulse-slow"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-purple-400/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-indigo-400/10 to-pink-400/10 rounded-full blur-3xl animate-float-delay"></div>
      </div>

      {/* Header */}
      <header className="relative z-50 border-b border-white/10 backdrop-blur-lg bg-black/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  ReverbEx Atlas
                </h1>
                <p className="text-xs text-gray-400">Advanced Geospatial Alignment Platform</p>
              </div>
            </div>

            {/* Status Indicator and Help Button */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-300">System Online</span>
              </div>
              <HelpButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex h-[calc(100vh-80px)]">
        {/* Control Panel */}
        <aside id="upload-panel" className={`transition-all duration-700 ${isInitialized ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}>
          <UploadPanel
            imageA={imageA}
            setImageA={setImageA}
            imageB={imageB}
            setImageB={setImageB}
            aoi={aoi}
            job={job}
            onProcess={handleProcess}
            onReset={resetState}
          />
        </aside>

        {/* Map Visualization Area */}
        <main className="flex-1 flex flex-col relative">
          {/* Processing Overlay */}
          {(job?.status === JobStatus.RUNNING || job?.status === JobStatus.PENDING) && (
            <div className="absolute inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-slate-800/90 rounded-2xl p-8 border border-cyan-400/30 shadow-2xl">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-0 w-8 h-8 border-2 border-purple-400/30 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Processing Geospatial Data</h3>
                    <p className="text-gray-400">AI alignment in progress...</p>
                  </div>
                </div>
                <div className="mt-4 w-80 bg-slate-700 rounded-full h-2">
                  <div className="h-2 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>
          )}

          {/* Map View */}
          <div id="map-view" className="flex-1 relative">
            <MapView
              imageAUrl={imageA ? URL.createObjectURL(imageA.file) : null}
              imageBUrl={imageB ? URL.createObjectURL(imageB.file) : null}
              processedImageUrls={processedImageUrls}
              onAoiSelect={setAoi}
              isProcessing={job?.status === JobStatus.RUNNING || job?.status === JobStatus.PENDING}
            />
          </div>

          {/* Results Overlay */}
          {processedImageUrls && (
            <div className="absolute bottom-6 right-6 z-30 bg-slate-800/95 backdrop-blur-lg rounded-2xl p-4 border border-green-400/30 shadow-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <div>
                  <h4 className="text-white font-semibold">Alignment Complete</h4>
                  <p className="text-sm text-gray-400">Images successfully processed</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
