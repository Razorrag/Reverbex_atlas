
export enum JobStatus {
    IDLE = 'idle',
    PENDING = 'pending',
    RUNNING = 'running',
    DONE = 'done',
    ERROR = 'error',
}

export interface ImageFile {
    id: string;
    file: File;
}

export interface Job {
    id: string;
    status: JobStatus;
    message?: string;
    outputs?: {
        imageAUrl: string;
        imageBUrl: string;
    };
}
