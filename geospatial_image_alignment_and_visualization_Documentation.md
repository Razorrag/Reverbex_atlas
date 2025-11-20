# Geospatial Image Alignment and Visualization System - Technical Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Problem Statement](#problem-statement)
3. [Solution Overview](#solution-overview)
4. [Technology Stack & Architecture](#technology-stack--architecture)
5. [Core Components & Functionality](#core-components--functionality)
6. [Technical Implementation Details](#technical-implementation-details)
7. [Data Processing Pipeline](#data-processing-pipeline)
8. [User Interface Design](#user-interface-design)
9. [Technical Innovations](#technical-innovations)
10. [Performance Optimization](#performance-optimization)
11. [Use Cases & Applications](#use-cases--applications)
12. [Development & Deployment](#development--deployment)

## Project Overview

GalaxEye is a geospatial image alignment and visualization application that bridges the gap between complex geospatial processing and user-friendly web interfaces. The application performs image registration and alignment operations on GeoTIFF files, a crucial task in remote sensing, environmental monitoring, cartography, and defense applications.

The core functionality centers on aligning two spatially referenced images with a common area of interest. The application provides a web-based solution for users to upload images, define the area of interest, perform alignment operations, and then visualize both the original and processed imagery.

## Problem Statement

### The Challenge of Geospatial Image Registration

Geospatial image registration is a fundamental challenge in remote sensing and geographic information systems (GIS). When satellite, aerial, or drone imagery is captured at different times, from different sensors, or under varying environmental conditions, there are often misalignments between images that need to be corrected for accurate analysis.

### Specific Problems Addressed

1. **Temporal Misalignment**: Images captured at different times may not align perfectly due to sensor orientation, satellite position, or geometric distortions.

2. **Sensor Variability**: Different imaging sensors have different characteristics, leading to geometric misalignment between images.

3. **Complex Processing Requirements**: Traditional image alignment tools require significant expertise in geospatial processing software, making them inaccessible to many potential users.

4. **Visualization Challenges**: Users need to compare original and processed imagery to validate alignment results, but existing tools often lack intuitive visualization capabilities.

5. **Workflow Integration**: Users need a streamlined workflow from image upload to alignment verification without requiring multiple disconnected tools.

## Solution Overview

GalaxEye solves these challenges by providing:

1. **Accessible Web Interface**: A browser-based application that eliminates the need for complex desktop GIS software installations.

2. **Automated Alignment Process**: Phase correlation-based alignment algorithm that provides accurate results with minimal user intervention.

3. **Real-time Visualization**: Dual-map interface with synchronized navigation and real-time preview of alignment results.

4. **User-Friendly Workflow**: Intuitive step-by-step process for image alignment with clear status indicators.

5. **Cross-Platform Compatibility**: Web-based solution that works across different operating systems and devices.

## Technology Stack & Architecture

### Frontend Technologies

#### React 19.2.0
- Component-based architecture for modular UI development
- State management for complex geospatial data
- Efficient virtual DOM rendering for smooth map interactions
- Hooks for managing side effects and state transitions

#### Vite 6.2.0
- Fast build times with Hot Module Replacement (HMR)
- Modern module bundling with ES modules
- Optimized production builds
- TypeScript support for type safety

#### TypeScript 5.8.2
- Static type checking to prevent runtime errors
- Better IDE support and autocomplete
- Enhanced code maintainability
- Interface definitions for API responses and components

#### Leaflet 1.9.4
- Interactive mapping library with extensive plugin ecosystem
- Support for various tile providers
- Efficient rendering of geospatial data
- Extensive customization options

#### React-Leaflet 5.0.0
- React components for Leaflet maps
- Efficient rendering through React's reconciliation
- Proper lifecycle management for map components
- Integration with React state management

#### Geospatial Libraries
- **Georaster 1.6.0**: JavaScript library for parsing and working with geospatial raster data in browsers
- **Georaster-layer-for-leaflet 4.1.2**: Integration between georaster and Leaflet for displaying GeoTIFF files
- **Leaflet-Draw 1.0.4**: Drawing tools for map interaction, particularly for area of interest selection

#### Styling & UI
- **Tailwind CSS 3.4.18**: Utility-first CSS framework for rapid UI development
- **Custom CSS**: Specific styling for map components and geospatial visualization

### Backend Technologies

#### Node.js & Express.js
- **Node.js**: JavaScript runtime for server-side operations
- **Express.js 4.x**: Minimalist web framework for API development
- **Middleware**: CORS, body parsing, file upload handling
- **Routing**: RESTful API endpoints for file operations and job management

#### File Management
- **Multer**: Middleware for handling multipart/form-data (file uploads)
- **File Storage**: Temporary storage for uploaded and processed files
- **Path Management**: Proper file path handling across different operating systems

#### Process Management
- **Child Process**: Spawning Python worker processes for image alignment
- **Process Tracking**: Managing lifecycle of background processes
- **Error Handling**: Comprehensive error handling for process failures

### Processing Engine

#### Python 3.x
- **Primary Processing Language**: Complex geospatial computations
- **Scientific Libraries**: NumPy, SciPy, and scikit-image for image processing
- **Raster I/O**: Rasterio for reading/writing GeoTIFF files
- **Geometric Operations**: Shapely for geometric manipulations

#### Core Processing Libraries
- **Rasterio**: Raster I/O with proper geospatial coordinate handling
- **NumPy**: Efficient numerical computations on image arrays
- **Scikit-image**: Advanced image processing algorithms, particularly phase correlation
- **Shapely**: Geometric operations and spatial relationships

### Architecture Pattern

#### Frontend Architecture
```
App Component (State Management)
├── UploadPanel (File Handling)
├── MapView (Visualization)
│   ├── GeoTiffLayer (Image Display)
│   └── DrawControl (AOI Selection)
└── API Service (Backend Communication)
```

#### Backend Architecture
```
Express Server
├── API Routes
│   ├── /api/upload (File Upload)
│   ├── /api/jobs (Job Management)
│   └── /api/rasters (Result Serving)
├── Job Management (In-memory Storage)
└── Python Worker (Process Spawning)
```

## Core Components & Functionality

### 1. Upload Panel Component
The Upload Panel handles the initial file upload workflow with the following features:
- Dual-file upload interface (Image A as reference, Image B for alignment)
- File validation and format checking
- Upload progress tracking
- Status visualization for processing steps
- Reset functionality for workflow restart

### 2. Map View Component
The Map View provides the core visualization interface with:
- Dual synchronized map displays
- Base map layers from Esri World Imagery
- GeoTIFF overlay rendering via georaster library
- Drawing tools for area of interest selection
- Real-time synchronization between maps
- Visualization controls for opacity and layer management

### 3. Job Management System
The backend job management system handles:
- Asynchronous processing with status tracking
- Four-stage job lifecycle: PENDING → RUNNING → DONE/ERROR
- Real-time status polling
- Error handling and recovery
- Result storage and retrieval

### 4. API Service Layer
The frontend API service provides:
- File upload functionality
- Job creation and management
- Status polling implementation
- Error handling and user feedback
- Base URL configuration

## Technical Implementation Details

### Frontend Implementation

#### State Management
The application uses React's useState and useEffect hooks for managing complex geospatial data:

```typescript
interface AppState {
  imageA: ImageFile | null;
  imageB: ImageFile | null;
  aoi: number[][] | null;
  job: Job | null;
  processedImageUrls: { a: string; b: string } | null;
}
```

#### Dual Map Synchronization
The MapView component implements sophisticated synchronization logic:

```typescript
const syncMaps = (source: Map, target: Map) => {
  target.setView(source.getCenter(), source.getZoom(), { animate: false });
};

let syncAtoB = false;
let syncBtoA = false;

const syncHandlerA = () => {
  if (!syncAtoB) {
    syncAtoB = true;
    syncMaps(mapAInstance, mapBInstance);
    setTimeout(() => { syncAtoB = false; }, 100);
  }
};
```

#### GeoTIFF Rendering
The georaster library enables direct browser-based GeoTIFF rendering without server-side conversion:

```typescript
const fetchAndAddLayer = async () => {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const georaster = await parseGeoraster(arrayBuffer);
  
  layer = new GeoRasterLayer({
    georaster,
    opacity: 0.8,
    resolution: 256,
  });
};
```

### Backend Implementation

#### API Endpoint Design
```javascript
// POST /api/upload - Upload GeoTIFF file
app.post('/api/upload', upload.single('file'), (req, res) => {
  // File validation and storage
});

// POST /api/jobs - Create alignment job
app.post('/api/jobs', (req, res) => {
  // Job creation and Python worker spawning
});

// GET /api/jobs/:jobId - Get job status
app.get('/api/jobs/:jobId', (req, res) => {
  // Job status retrieval
});

// GET /api/rasters/:jobId/:filename - Serve processed files
app.get('/api/rasters/:jobId/:filename', (req, res) => {
  // File serving with proper headers
});
```

#### Process Management
The backend spawns Python processes for image alignment:

```javascript
const workerProcess = spawn(pythonExecutable, [
  workerScript,
  '--image_a', path.join(__dirname, `../data/uploads/${imageAId}`),
  '--image_b', path.join(__dirname, `../data/uploads/${imageBId}`),
  '--aoi', aoiString,
  '--out_dir', outputDir
]);
```

### Python Processing Engine

#### Image Clipping and Alignment
The core algorithm uses phase correlation for sub-pixel accuracy:

```python
def align_images(image_a: np.ndarray, image_b: np.ndarray) -> Tuple[np.ndarray, dict]:
    # Calculate shift using phase cross-correlation
    shift, error, diffphase = phase_cross_correlation(
        reference_band, target_band, upsample_factor=100
    )
    
    # Apply sub-pixel shift to image_b
    aligned_image = np.zeros_like(image_b)
    # Detailed pixel shifting logic for geometric alignment
```

#### GeoTIFF Preservation
The processing maintains geospatial metadata:

```python
def save_geotiff(image_array: np.ndarray, output_path: str, reference_path: str = None):
    # Preserve geospatial metadata from original image
    # Copy CRS, transform, and other geospatial properties
```

## Data Processing Pipeline

### 1. Input Validation
- Verify GeoTIFF format and integrity
- Validate spatial reference systems
- Check image dimensions and bands

### 2. Area of Interest (AOI) Processing
- Convert map coordinates to image coordinates
- Calculate bounding box in image space
- Validate AOI bounds against image extents

### 3. Image Clipping
- Extract common area from both images
- Apply spatial subset based on AOI
- Maintain geospatial reference

### 4. Alignment Computation
- Phase correlation for translation estimation
- Sub-pixel accuracy computation
- Validation of alignment confidence

### 5. Output Generation
- Apply geometric transformation
- Generate aligned output with preserved metadata
- Create optimized GeoTIFF files

## User Interface Design

### Visual Design Principles
- **Dark Theme**: Optimized for image viewing with reduced eye strain
- **Asymmetric Layout**: Control panel with information hierarchy
- **Visual Feedback**: Clear status indicators and progress tracking
- **Synchronized Interaction**: Dual-map navigation consistency

### Component Design Patterns

#### Status Visualization
```css
.status-chip {
  @apply px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center;
}

.status-running {
  @apply bg-blue-500/20 text-blue-300 border border-blue-500/50 animate-pulse;
}
```

#### Map Overlay System
- Dynamic overlay positioning
- Synchronized layer controls
- Visual feedback for interaction states

### Interaction Design
- **Drag-and-drop** upload functionality
- **Real-time** map synchronization
- **Progressive** status updates
- **Responsive** layout for different screen sizes

## Technical Innovations

### 1. Browser-Based GeoTIFF Rendering
For the first time in a web application, GeoTIFF files are directly rendered in the browser using the georaster library, eliminating the need for server-side conversion or specialized clients.

### 2. Sub-Pixel Alignment Accuracy
The application implements phase correlation algorithms that achieve sub-pixel accuracy in image alignment, crucial for precise geospatial analysis.

### 3. Dual Map Synchronization
Sophisticated synchronization algorithms ensure both maps remain aligned during navigation, providing consistent user experience.

### 4. Asynchronous Job Processing
Non-blocking processing with real-time status updates allows users to continue working while intensive alignment operations run in the background.

### 5. Cross-Platform Processing
The architecture supports both Windows and Unix-like systems, with platform-specific startup scripts and process management.

## Performance Optimization

### Frontend Optimizations
- **Virtual Scrolling**: Efficient rendering of large map areas
- **Lazy Loading**: Components and data loaded on demand
- **Caching**: Local caching of map tiles and processed images
- **Memory Management**: Proper cleanup of map layers and event handlers

### Backend Optimizations
- **Process Pooling**: Efficient management of Python worker processes
- **File Caching**: Temporary storage with cleanup policies
- **API Optimization**: Efficient routing and response handling
- **Resource Management**: Proper process cleanup and error handling

### Processing Optimizations
- **Algorithm Efficiency**: Optimized phase correlation implementation
- **Memory Usage**: Efficient array operations and memory management
- **Parallel Processing**: Potential for multi-core processing
- **I/O Optimization**: Efficient file reading and writing operations

## Use Cases & Applications

### Primary Use Cases

#### Remote Sensing Analysis
- Multi-temporal change detection
- Land cover classification
- Environmental monitoring
- Disaster assessment

#### Defense & Intelligence
- Image registration for surveillance
- Change detection in sensitive areas
- Intelligence analysis
- Mission planning

#### Environmental Science
- Forest monitoring
- Water resource management
- Land use change analysis
- Climate impact assessment

#### Urban Planning
- Development monitoring
- Infrastructure planning
- Zoning compliance
- Growth analysis

### Specific Applications

#### Agricultural Monitoring
- Crop health assessment
- Yield estimation
- Irrigation management
- Pest/disease detection

#### Infrastructure Management
- Construction progress monitoring
- Infrastructure change detection
- Asset management
- Maintenance planning

#### Scientific Research
- Climate change studies
- Ecosystem research
- Biodiversity assessment
- Geologic studies

## Development & Deployment

### Development Environment Setup
1. **Frontend Dependencies**: Node.js, npm, TypeScript, Vite
2. **Backend Dependencies**: Node.js, Express.js, Multer
3. **Processing Dependencies**: Python 3.9+, Rasterio, NumPy, scikit-image
4. **Geospatial Dependencies**: GDAL for advanced geospatial operations

### Architecture Considerations

#### Scalability
- Microservice architecture for independent scaling
- Asynchronous processing for high concurrency
- Database integration for production deployments
- Load balancing capabilities

#### Security
- Input validation for uploaded files
- Secure API endpoints
- Sanitized file paths
- Process isolation for Python workers

#### Production Readiness
- Database integration for job persistence
- Authentication and authorization
- Logging and monitoring
- Error tracking and reporting

### Deployment Strategies

#### Single-Server Deployment
- All components on single server
- Simple to deploy and manage
- Suitable for small teams

#### Microservice Deployment
- Separate services for frontend, backend, and processing
- Independent scaling capabilities
- Greater complexity but higher reliability

#### Containerized Deployment
- Docker containers for each component
- Kubernetes orchestration
- DevOps-friendly deployment

## Conclusion

GalaxEye represents a significant advancement in accessible geospatial image processing, combining modern web technologies with sophisticated image alignment algorithms. The application addresses critical challenges in geospatial analysis while maintaining an intuitive user interface that democratizes access to advanced image processing capabilities.

The technology stack demonstrates a thoughtful integration of frontend, backend, and computational components, each chosen for their specific strengths in the overall application architecture. The result is a robust, scalable, and user-friendly solution for geospatial image alignment that serves a wide range of applications in remote sensing, environmental science, defense, and urban planning.