
import { JobStatus, Job, ImageFile } from '../types';

// Base API URL - can be configured via environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const uploadFile = async (file: File): Promise<ImageFile> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(`${API_BASE_URL}/api/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Upload failed');
        }

        const result = await response.json();
        return { id: result.imageId, file };
    } catch (error) {
        console.error('Upload error:', error);
        throw error;
    }
};

const createJob = async (params: { imageAId: string; imageBId: string; aoi: number[][] }): Promise<Job> => {
    // Convert the AOI format from [[lat, lng], [lat, lng]] to the format expected by the API
    // The API expects: { north: number, south: number, east: number, west: number }
    const aoiBounds = {
        north: Math.max(params.aoi[0][0], params.aoi[1][0]),
        south: Math.min(params.aoi[0][0], params.aoi[1][0]),
        east: Math.max(params.aoi[0][1], params.aoi[1][1]),
        west: Math.min(params.aoi[0][1], params.aoi[1][1])
    };

    try {
        const response = await fetch(`${API_BASE_URL}/api/jobs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                imageAId: params.imageAId,
                imageBId: params.imageBId,
                aoi: aoiBounds,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Job creation failed');
        }

        const result = await response.json();

        // Return a job object with initial status
        return { id: result.jobId, status: JobStatus.PENDING };
    } catch (error) {
        console.error('Create job error:', error);
        throw error;
    }
};

const getJobStatus = async (jobId: string): Promise<Job> => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}`);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to get job status');
        }

        const job = await response.json();

        // Return the job with its status, message, and outputs
        return {
            id: job.id,
            status: job.status as JobStatus,
            message: job.error || job.message,
            outputs: job.outputs
        };
    } catch (error) {
        console.error(`Error fetching job status for ${jobId}:`, error);
        throw error;
    }
};

export const api = {
    uploadFile,
    createJob,
    getJobStatus
};
