const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;

// Configure allowed origins for CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://reverbex-atlas.onrender.com',
  'https://reverbex-atlas-api.onrender.com'
];

// Enable CORS for allowed origins
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Middleware to parse JSON
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../data/uploads/');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Only allow GeoTIFF files
    if (file.originalname.toLowerCase().endsWith('.tif') || file.originalname.toLowerCase().endsWith('.tiff')) {
      return cb(null, true);
    }
    cb(new Error('Only GeoTIFF files are allowed'));
  }
});

// Job persistence file
const JOBS_FILE = path.join(__dirname, '../data/jobs.json');

// Initialize jobs from persistent storage or empty object
let jobs = {};

// Load jobs from file on startup
function loadJobs() {
  try {
    if (fs.existsSync(JOBS_FILE)) {
      const data = fs.readFileSync(JOBS_FILE, 'utf8');
      jobs = JSON.parse(data);
      console.log(`Loaded ${Object.keys(jobs).length} jobs from persistent storage`);
    } else {
      console.log('No existing jobs file found, starting fresh');
    }
  } catch (error) {
    console.error('Error loading jobs:', error);
    jobs = {};
  }
}

// Save jobs to file
function saveJobs() {
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(JOBS_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(JOBS_FILE, JSON.stringify(jobs, null, 2), 'utf8');
    console.log('Jobs saved to persistent storage');
  } catch (error) {
    console.error('Error saving jobs:', error);
  }
}

// Load jobs on startup
loadJobs();

// POST /api/upload - Upload a GeoTIFF file
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Generate a unique image ID based on the file
  const imageId = req.file.filename;

  res.json({
    message: 'Upload successful',
    imageId: imageId
  });
});

// POST/api/jobs - Create a new alignment job
app.post('/api/jobs', (req, res) => {
  const { imageAId, imageBId, aoi } = req.body;

  // Validate inputs
  if (!imageAId || !imageBId || !aoi || !aoi.north || !aoi.south || !aoi.east || !aoi.west) {
    return res.status(400).json({ error: 'Missing required parameters: imageAId, imageBId, or aoi' });
  }

  // Generate a unique job ID
  const jobId = `job-${Date.now()}-${Math.round(Math.random() * 1E6)}`;

  // Initialize job in our store
  jobs[jobId] = {
    id: jobId,
    status: 'pending',
    progress: 0,
    imageAId,
    imageBId,
    aoi,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Save to persistent storage
  saveJobs();

  try {
    // Define paths for the Python worker
    const pythonExecutable = process.env.PYTHON_PATH || 'python';
    const workerScript = path.resolve(__dirname, '../worker/worker.py');
    const outputDir = path.resolve(__dirname, `../data/outputs/${jobId}`);

    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Prepare the AOI as a string in the expected format
    const aoiString = `north=${aoi.north};south=${aoi.south};east=${aoi.east};west=${aoi.west}`;

    // Update job status to 'running'
    jobs[jobId].status = 'running';
    jobs[jobId].updatedAt = new Date().toISOString();
    saveJobs();

    // Spawn the Python worker process
    const workerProcess = spawn(pythonExecutable, [
      workerScript,
      '--image_a', path.join(__dirname, `../data/uploads/${imageAId}`),
      '--image_b', path.join(__dirname, `../data/uploads/${imageBId}`),
      '--aoi', aoiString,
      '--out_dir', outputDir
    ]);

    // Handle process output
    workerProcess.stdout.on('data', (data) => {
      console.log(`Python worker output: ${data}`);
    });

    workerProcess.stderr.on('data', (data) => {
      console.error(`Python worker error: ${data}`);
      jobs[jobId].status = 'error';
      jobs[jobId].error = data.toString();
      jobs[jobId].updatedAt = new Date().toISOString();
      saveJobs();
    });

    workerProcess.on('close', (code) => {
      console.log(`Python worker process exited with code ${code}`);

      if (code === 0) {
        // Process completed successfully
        jobs[jobId].status = 'done';
        jobs[jobId].outputs = {
          imageAUrl: `/api/rasters/${jobId}/A_clipped.tif`,
          imageBUrl: `/api/rasters/${jobId}/B_clipped_aligned.tif`
        };
      } else if (jobs[jobId].status !== 'error') {
        // Process failed but not due to stderr error
        jobs[jobId].status = 'error';
        jobs[jobId].error = `Process failed with exit code ${code}`;
      }

      jobs[jobId].updatedAt = new Date().toISOString();
      saveJobs();
    });

    // Return immediately with the job ID
    res.json({ jobId });
  } catch (error) {
    console.error('Error starting job:', error);
    jobs[jobId].status = 'error';
    jobs[jobId].error = error.message;
    jobs[jobId].updatedAt = new Date().toISOString();
    saveJobs();

    res.status(500).json({
      error: 'Failed to start processing job',
      jobId
    });
  }
});

// GET /api/jobs - Get all jobs (for debugging and UI recovery)
app.get('/api/jobs', (req, res) => {
  // Return list of all jobs sorted by creation date
  const jobList = Object.values(jobs).sort((a, b) =>
    new Date(b.createdAt) - new Date(a.createdAt)
  );
  res.json(jobList);
});

// GET /api/jobs/:jobId - Get job status
app.get('/api/jobs/:jobId', (req, res) => {
  const jobId = req.params.jobId;
  const job = jobs[jobId];

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  res.json(job);
});

// GET /api/rasters/:jobId/:filename - Serve processed raster files
app.get('/api/rasters/:jobId/:filename', (req, res) => {
  const { jobId, filename } = req.params;
  const filePath = path.join(__dirname, `../data/outputs/${jobId}/${filename}`);

  // Check if the file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error(`File not found: ${filePath}`);
      return res.status(404).json({ error: 'File not found' });
    }

    console.log(`Serving file: ${filePath}`);
    // Set appropriate content-type for TIFF files
    res.setHeader('Content-Type', 'image/tiff');
    res.sendFile(filePath);
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large' });
    }
  }
  res.status(500).json({ error: error.message });
});

// Graceful shutdown - save jobs before exit
process.on('SIGINT', () => {
  console.log('\nGracefully shutting down...');
  saveJobs();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nGracefully shutting down...');
  saveJobs();
  process.exit(0);
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`📊 Loaded ${Object.keys(jobs).length} existing jobs`);
  console.log(`API endpoints available:`);
  console.log(`  POST /api/upload - Upload GeoTIFF files`);
  console.log(`  POST /api/jobs   - Create alignment job`);
  console.log(`  GET  /api/jobs   - List all jobs`);
  console.log(`  GET  /api/jobs/:jobId - Get job status`);
  console.log(`  GET  /api/rasters/:jobId/:filename - Serve processed rasters`);
});