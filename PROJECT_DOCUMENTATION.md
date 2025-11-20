# GalaxEye - Geospatial Image Alignment Visualizer: Comprehensive Project Documentation

## Overview

GalaxEye is a sophisticated web-based geospatial image alignment application built with React and a Node.js/Express backend. It enables users to upload two GeoTIFF images, define an Area of Interest (AOI), and perform precise image alignment using advanced computer vision algorithms. The application displays both the original and processed images in synchronized maps for visual comparison.

## Project Purpose

The primary purpose of GalaxEye is to provide a user-friendly interface for geospatial image registration and alignment. This is particularly useful in applications such as:
- Satellite imagery analysis
- Remote sensing
- Environmental monitoring
- Land use change detection
- Cartographic applications
- Military reconnaissance

The application addresses the need for precise alignment of geospatial imagery, which is critical for accurate multi-temporal analysis, change detection, and overlay operations.

## Technology Stack

### Frontend
- **React 19.2.0** - Component-based UI library
- **Vite 6.2.0** - Next-generation build tool
- **TypeScript 5.8.2** - Type-safe JavaScript
- **Leaflet 1.9.4** - Interactive mapping library
- **React-Leaflet 5.0.0** - React components for Leaflet
- **Georaster & Georaster-layer-for-leaflet 1.6.0/4.1.2** - GeoTIFF rendering in web maps
- **Leaflet-Draw 1.0.4** - Drawing tools for map interaction
- **Tailwind CSS 3.4.18** - Utility-first CSS framework
- **PostCSS 8.5.6** - CSS processing tool
- **Autoprefixer** - CSS vendor prefixing

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **Multer** - File upload middleware
- **CORS** - Cross-origin resource sharing

### Processing Engine
- **Python 3.x** - Backend processing language
- **Rasterio** - Raster I/O library
- **NumPy** - Numerical computing library
- **Scikit-image** - Image processing library
- **Shapely** - Geometric object manipulation

### Build & Development Tools
- **npm** - Package manager
- **TypeScript** - Static type checking
- **Tailwind CSS** - Styling framework

## Architecture Overview

### Frontend Architecture
The frontend follows a React component-based architecture:

1. **App.tsx** - Main application component orchestrating state management
2. **UploadPanel.tsx** - Handles file uploads and process controls
3. **MapView.tsx** - Dual-map display with synchronized views
4. **API Service** - Communicates with the backend
5. **Custom Components** - Reusable UI elements like FileInput, StatusChip, Icons

### Backend Architecture
The backend is a Node.js/Express server with three main responsibilities:

1. **File Upload API** - Handles GeoTIFF file uploads
2. **Job Management API** - Manages alignment processing jobs
3. **Raster Serving API** - Serves processed GeoTIFF files

### Processing Pipeline
The Python worker creates a processing pipeline:
1. Clipping images to the specified AOI
2. Performing phase correlation-based alignment
3. Saving aligned images in GeoTIFF format

## Core Functionality

### Image Upload & Management
- Users can upload two GeoTIFF images (Image A as reference, Image B to align)
- Files are stored temporarily on the server
- Upload progress and validation ensure proper file formats

### Synchronized Dual-Map Interface
- Two synchronized Leaflet maps display both images simultaneously
- Shared zoom and pan functionality across both maps
- Rectangle drawing tool for AOI selection
- Real-time visual feedback of selected area

### Area of Interest (AOI) Selection
- Users draw rectangles on the map to define the area of interest
- Selection is shared across both maps for consistency
- Coordinates are converted for backend processing

### Job Management System
- Asynchronous processing with job status tracking
- Four status states: PENDING, RUNNING, DONE, ERROR
- Real-time polling for job status updates
- Visual status indicators and progress tracking

### Image Alignment Process
- Phase cross-correlation algorithm for precise alignment
- Multi-band support for RGB and multispectral images
- Sub-pixel accuracy in alignment calculations
- Generation of aligned and clipped output images

### Visualization Capabilities
- Side-by-side comparison of original and processed images
- Overlay capabilities with adjustable opacity
- Synchronized map navigation
- Visual status indicators and progress feedback

## User Interface

### Control Panel
- File upload interface for both images
- Step-by-step processing workflow visualization
- Job status monitoring
- Process control buttons (Start Alignment, Reset)
- Visual feedback for each processing step

### Map Interface
- Dual-panel synchronized maps
- Base map layer (Esri World Imagery)
- GeoTIFF overlay with adjustable opacity
- Drawing tools for AOI selection
- Map overlays indicating layer status

### Responsive Design
- Tailwind CSS utility classes for responsive layout
- Dark-themed UI optimized for image viewing
- Control panel with fixed width for consistent workflow
- Full-screen map visualization

## Data Flow

1. **Upload Phase**: User uploads two GeoTIFF files through the UI
2. **Selection Phase**: User draws an AOI rectangle on the map
3. **Processing Phase**: Job is submitted to backend, Python worker performs alignment
4. **Result Phase**: Processed images are displayed in the same interface
5. **Comparison Phase**: User can visually compare original and aligned images

## File Structure and Data Management

### Directory Structure
- `/api` - Node.js/Express backend server
- `/worker` - Python processing scripts
- `/src` - Frontend source files
- `/data` - Runtime data (uploads, outputs, sample data)
- `/components` - React UI components
- `/services` - API service layer
- `/scripts` - Utility scripts

### Data Persistence
- Temporary file storage for uploads and outputs
- In-memory job store (would use database in production)
- Session-based state management in the frontend

## Performance Considerations

### Image Handling
- GeoTIFF parsing using georaster library
- Client-side preview before processing
- Server-side processing for heavy computational tasks

### Synchronization
- Dual-map synchronization using event handlers
- Anti-flicker mechanisms to prevent infinite loops
- Efficient rendering with React's virtual DOM

### Processing Optimization
- Asynchronous backend processing with job queues
- Phase correlation algorithm for efficient alignment
- Raster I/O optimizations with Rasterio

## Installation and Deployment

The application includes cross-platform startup scripts:
- `start.bat` - Windows deployment
- `start.sh` - Unix/Linux deployment
- Automated dependency installation
- Sample data generation
- Multi-process management for frontend and backend

## Unique Features

1. **Real-time Synchronization**: Maps stay in sync during navigation
2. **Visual AOI Selection**: Interactive rectangle drawing on map
3. **Progressive Status Updates**: Real-time job monitoring
4. **Side-by-Side Comparison**: Before/after visualization
5. **Sub-pixel Alignment**: High-precision image registration
6. **Cross-Platform Support**: Works on Windows, macOS, and Linux

## Summary

GalaxEye represents a sophisticated integration of modern web technologies with geospatial processing capabilities. The application provides a complete solution for geospatial image alignment through an intuitive web interface, combining the power of Python-based image processing with the accessibility of web-based visualization. The architecture carefully separates concerns between the frontend visualization layer, backend API management, and computational processing engine, resulting in a robust and scalable application for geospatial analysis tasks.

The project demonstrates modern development practices with TypeScript for frontend safety, React for component-based UI, and a microservice-like architecture with a dedicated processing worker. This combination enables complex geospatial operations while maintaining an accessible user interface for non-technical users.