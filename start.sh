#!/bin/bash

# Geospatial Image Alignment Application Startup Script

echo "Starting Geospatial Image Alignment Application..."
echo "=============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js v18+ and try again."
    exit 1
fi

# Check if Python is installed
if ! command -v python &> /dev/null && ! command -v python3 &> /dev/null; then
    echo "Error: Python is not installed. Please install Python 3.9+ and try again."
    exit 1
fi

# Determine Python command
PYTHON_CMD="python3"
if ! command -v python3 &> /dev/null; then
    PYTHON_CMD="python"
fi

# Install dependencies if needed
echo "Installing dependencies..."
npm install

cd api
npm install
cd ..

cd worker
pip install -r requirements.txt
cd ..

# Create data directories if they don't exist
mkdir -p data/uploads
mkdir -p data/outputs
mkdir -p data/sample-data

# Generate sample data if it doesn't exist
if [ ! -f "data/sample-data/sample_image_a.tif" ]; then
    echo "Generating sample data..."
    cd scripts
    $PYTHON_CMD generate-sample-data.py
    cd ..
fi

# Start the API server in the background
echo "Starting API server..."
cd api
npm run dev &
API_PID=$!
cd ..

# Wait a moment for the API server to start
sleep 3

# Start the frontend server
echo "Starting frontend server..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "Application is starting up!"
echo "API Server: http://localhost:8080"
echo "Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all servers"

# Function to clean up background processes
cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $API_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "Servers stopped."
    exit 0
}

# Set up trap to clean up on exit
trap cleanup INT

# Wait for both processes
wait