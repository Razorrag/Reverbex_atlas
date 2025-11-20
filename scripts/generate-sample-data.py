#!/usr/bin/env python3
"""
Sample Data Generator for Geospatial Image Alignment

This script generates two sample GeoTIFF files with a slight offset
for testing the image alignment functionality.
"""

import numpy as np
import rasterio
from rasterio.transform import from_bounds
import os

def create_sample_geotiff(filename, bounds, size=(500, 500), offset=(0, 0)):
    """
    Create a sample GeoTIFF with some patterns.
    
    Args:
        filename: Output filename
        bounds: (minx, miny, maxx, maxy) in coordinate system
        size: (width, height) in pixels
        offset: (x_offset, y_offset) for shifting the pattern
    """
    width, height = size
    minx, miny, maxx, maxy = bounds
    
    # Create a transform from pixel coordinates to map coordinates
    transform = from_bounds(minx, miny, maxx, maxy, width, height)
    
    # Generate some interesting patterns
    x = np.linspace(0, 10, width) + offset[0]
    y = np.linspace(0, 10, height) + offset[1]
    xx, yy = np.meshgrid(x, y)
    
    # Create a pattern with some features
    # Band 1: Circular gradient
    center_x, center_y = width // 2, height // 2
    dist = np.sqrt((np.arange(width) - center_x)**2 + (np.arange(height)[:, np.newaxis] - center_y)**2)
    band1 = 255 * np.exp(-dist / 100)
    
    # Band 2: Sinusoidal pattern
    band2 = 127.5 + 127.5 * np.sin(xx) * np.cos(yy)
    
    # Band 3: Checkerboard pattern
    checkerboard = ((np.floor(xx) + np.floor(yy)) % 2) * 255
    band3 = checkerboard
    
    # Stack bands
    raster = np.stack([band1, band2, band3]).astype(np.uint8)
    
    # Write the GeoTIFF
    with rasterio.open(
        filename,
        'w',
        driver='GTiff',
        height=height,
        width=width,
        count=3,
        dtype=rasterio.uint8,
        crs='EPSG:4326',  # WGS84
        transform=transform,
    ) as dst:
        dst.write(raster)

def main():
    # Create sample data directory if it doesn't exist
    sample_dir = '../data/sample-data'
    os.makedirs(sample_dir, exist_ok=True)
    
    # Define bounds for two overlapping images
    # Image A: Reference image
    bounds_a = (-122.5, 37.7, -122.3, 37.9)  # San Francisco area
    
    # Image B: Slightly offset image
    bounds_b = (-122.48, 37.72, -122.28, 37.92)  # Slightly shifted
    
    # Create the two sample images
    print("Generating sample GeoTIFF files...")
    create_sample_geotiff(
        os.path.join(sample_dir, 'sample_image_a.tif'),
        bounds_a,
        offset=(0, 0)
    )
    
    create_sample_geotiff(
        os.path.join(sample_dir, 'sample_image_b.tif'),
        bounds_b,
        offset=(0.5, 0.3)  # Slight offset to test alignment
    )
    
    print(f"Sample files created in {sample_dir}:")
    print(f"  - sample_image_a.tif (Reference)")
    print(f"  - sample_image_b.tif (To be aligned)")
    print("\nThese files are in EPSG:4326 (WGS84) coordinate system.")
    print("Image B is slightly offset from Image A to test the alignment functionality.")

if __name__ == "__main__":
    main()