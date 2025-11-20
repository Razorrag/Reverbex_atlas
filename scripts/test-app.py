#!/usr/bin/env python3
"""
Test Script for Geospatial Image Alignment Application

This script tests the API endpoints to ensure the application
is working correctly.
"""

import requests
import json
import time
import os

API_BASE_URL = "http://localhost:8080"

def test_upload_file(file_path):
    """Test file upload endpoint."""
    print(f"Testing upload of {file_path}...")
    
    if not os.path.exists(file_path):
        print(f"Error: File {file_path} not found")
        return None
    
    with open(file_path, 'rb') as f:
        files = {'file': f}
        response = requests.post(f"{API_BASE_URL}/api/upload", files=files)
    
    if response.status_code == 200:
        result = response.json()
        print(f"Upload successful. Image ID: {result['imageId']}")
        return result['imageId']
    else:
        print(f"Upload failed: {response.status_code} - {response.text}")
        return None

def test_create_job(image_a_id, image_b_id, aoi):
    """Test job creation endpoint."""
    print("Testing job creation...")
    
    payload = {
        "imageAId": image_a_id,
        "imageBId": image_b_id,
        "aoi": aoi
    }
    
    response = requests.post(
        f"{API_BASE_URL}/api/jobs",
        headers={"Content-Type": "application/json"},
        data=json.dumps(payload)
    )
    
    if response.status_code == 200:
        result = response.json()
        print(f"Job created successfully. Job ID: {result['jobId']}")
        return result['jobId']
    else:
        print(f"Job creation failed: {response.status_code} - {response.text}")
        return None

def test_job_status(job_id):
    """Test job status endpoint."""
    print(f"Checking job status for {job_id}...")
    
    response = requests.get(f"{API_BASE_URL}/api/jobs/{job_id}")
    
    if response.status_code == 200:
        job = response.json()
        print(f"Job status: {job['status']}")
        if 'error' in job:
            print(f"Job error: {job['error']}")
        if 'outputs' in job:
            print(f"Job outputs: {job['outputs']}")
        return job
    else:
        print(f"Failed to get job status: {response.status_code} - {response.text}")
        return None

def test_raster_access(job_id, filename):
    """Test raster file access."""
    print(f"Testing access to raster file: {filename}")
    
    response = requests.get(f"{API_BASE_URL}/api/rasters/{job_id}/{filename}")
    
    if response.status_code == 200:
        print(f"Successfully accessed raster file: {filename}")
        print(f"Content-Type: {response.headers.get('Content-Type')}")
        print(f"File size: {len(response.content)} bytes")
        return True
    else:
        print(f"Failed to access raster file: {response.status_code} - {response.text}")
        return False

def main():
    print("Testing Geospatial Image Alignment Application")
    print("=" * 50)
    
    # Check if API is running
    try:
        response = requests.get(f"{API_BASE_URL}/api/jobs/test-job-id")
        # Expect 404 for non-existent job, which means API is running
        if response.status_code == 404:
            print("API is running")
        else:
            print("API might not be running correctly")
            return
    except requests.exceptions.ConnectionError:
        print("Error: Cannot connect to API. Make sure the application is running with 'docker-compose up'")
        return
    
    # Test with sample data
    sample_image_a = "../data/sample-data/sample_image_a.tif"
    sample_image_b = "../data/sample-data/sample_image_b.tif"
    
    # Generate sample data if it doesn't exist
    if not os.path.exists(sample_image_a) or not os.path.exists(sample_image_b):
        print("Sample data not found. Generating...")
        os.system("cd scripts && python generate-sample-data.py")
    
    # Upload files
    image_a_id = test_upload_file(sample_image_a)
    image_b_id = test_upload_file(sample_image_b)
    
    if not image_a_id or not image_b_id:
        print("Failed to upload files. Aborting test.")
        return
    
    # Define AOI (Area of Interest) - San Francisco area
    aoi = {
        "north": 37.85,
        "south": 37.75,
        "east": -122.35,
        "west": -122.45
    }
    
    # Create job
    job_id = test_create_job(image_a_id, image_b_id, aoi)
    
    if not job_id:
        print("Failed to create job. Aborting test.")
        return
    
    # Poll job status
    print("Polling job status...")
    max_attempts = 30
    for attempt in range(max_attempts):
        job = test_job_status(job_id)
        
        if not job:
            break
            
        if job['status'] == 'done':
            print("Job completed successfully!")
            # Test access to output files
            test_raster_access(job_id, "A_clipped.tif")
            test_raster_access(job_id, "B_clipped_aligned.tif")
            break
        elif job['status'] == 'error':
            print("Job failed with error")
            break
        else:
            print(f"Job still running (attempt {attempt + 1}/{max_attempts})...")
            time.sleep(2)
    
    print("\nTest completed!")

if __name__ == "__main__":
    main()