#!/usr/bin/env python3
"""
Geospatial Image Alignment Worker

This script performs geospatial image alignment between two GeoTIFF images.
It clips both images to the specified AOI and aligns Image B to Image A.
"""

import argparse
import numpy as np
import rasterio
from rasterio.mask import mask
from rasterio.warp import reproject, Resampling
from skimage.registration import phase_cross_correlation
from shapely.geometry import box
import json
import os
from typing import Tuple, List


def clip_image_to_aoi(image_path: str, aoi: dict) -> np.ndarray:
    """
    Clip an image to the specified AOI (Area of Interest).
    
    Args:
        image_path: Path to the input GeoTIFF
        aoi: Area of Interest as {north: lat, south: lat, east: lng, west: lng}
    
    Returns:
        Clipped image array
    """
    with rasterio.open(image_path) as src:
        # Convert AOI bounds to image coordinates
        min_lon, min_lat = aoi['west'], aoi['south']
        max_lon, max_lat = aoi['east'], aoi['north']
        
        # Get the window that covers the AOI
        window = src.window_from_bounds(min_lon, min_lat, max_lon, max_lat)
        
        # Read the clipped image based on the window
        clipped_image = src.read(window=window)
        
        return clipped_image


def align_images(image_a: np.ndarray, image_b: np.ndarray) -> Tuple[np.ndarray, dict]:
    """
    Align Image B to Image A using phase cross-correlation.
    
    Args:
        image_a: Reference image array
        image_b: Image to be aligned array
    
    Returns:
        Tuple of (aligned image, alignment info)
    """
    # Ensure both images have the same dimensions
    if image_a.shape != image_b.shape:
        # Resize image_b to match image_a
        from skimage.transform import resize
        image_b = resize(image_b, image_a.shape, anti_aliasing=True, preserve_range=True).astype(image_a.dtype)
    
    # Calculate the shift using phase cross-correlation
    # For multiband images, we typically use the first band for registration
    reference_band = image_a[0] if len(image_a.shape) > 2 else image_a
    target_band = image_b[0] if len(image_b.shape) > 2 else image_b
    
    # Calculate shift
    shift, error, diffphase = phase_cross_correlation(reference_band, target_band, upsample_factor=100)
    
    # Round the shift to the nearest integer pixel
    shift = np.round(shift).astype(int)
    
    print(f"Calculated shift: {shift}")
    
    # Apply the shift to image_b
    aligned_image = np.zeros_like(image_b)
    
    # Determine the valid region after applying the shift
    if shift[0] >= 0 and shift[1] >= 0:
        # Positive shifts: shift target down/right, so source stays in place
        src_y_slice = slice(None, -shift[0] if shift[0] != 0 else None)
        src_x_slice = slice(None, -shift[1] if shift[1] != 0 else None)
        dst_y_slice = slice(shift[0], None)
        dst_x_slice = slice(shift[1], None)
    elif shift[0] < 0 and shift[1] < 0:
        # Negative shifts: shift target up/left
        src_y_slice = slice(-shift[0], None)
        src_x_slice = slice(-shift[1], None)
        dst_y_slice = slice(None, shift[0] if shift[0] != 0 else None)
        dst_x_slice = slice(None, shift[1] if shift[1] != 0 else None)
    elif shift[0] >= 0 and shift[1] < 0:
        # Positive y shift, negative x shift
        src_y_slice = slice(None, -shift[0] if shift[0] != 0 else None)
        src_x_slice = slice(-shift[1], None)
        dst_y_slice = slice(shift[0], None)
        dst_x_slice = slice(None, shift[1] if shift[1] != 0 else None)
    else:  # shift[0] < 0 and shift[1] >= 0
        # Negative y shift, positive x shift
        src_y_slice = slice(-shift[0], None)
        src_x_slice = slice(None, -shift[1] if shift[1] != 0 else None)
        dst_y_slice = slice(None, shift[0] if shift[0] != 0 else None)
        dst_x_slice = slice(shift[1], None)
    
    # Apply the alignment for each band
    for band_idx in range(image_b.shape[0]):
        aligned_image[band_idx][dst_y_slice, dst_x_slice] = image_b[band_idx][src_y_slice, src_x_slice]
    
    alignment_info = {
        "shift_x": int(shift[1]),
        "shift_y": int(shift[0]),
        "error": float(error)
    }
    
    return aligned_image, alignment_info


def save_geotiff(image_array: np.ndarray, output_path: str, reference_path: str = None):
    """
    Save an image array as a GeoTIFF file.
    
    Args:
        image_array: Image array to save
        output_path: Path for the output file
        reference_path: Optional path to reference GeoTIFF for metadata
    """
    if reference_path and os.path.exists(reference_path):
        # Copy metadata from reference file
        with rasterio.open(reference_path) as ref_src:
            profile = ref_src.profile.copy()
            profile.update({
                'height': image_array.shape[1],
                'width': image_array.shape[2] if len(image_array.shape) > 2 else image_array.shape[1],
                'count': image_array.shape[0] if len(image_array.shape) > 2 else 1,
            })
            
            with rasterio.open(output_path, 'w', **profile) as dst:
                if len(image_array.shape) == 2:
                    # Single band image
                    dst.write(image_array, 1)
                else:
                    # Multi-band image
                    for band_idx in range(image_array.shape[0]):
                        dst.write(image_array[band_idx], band_idx + 1)
    else:
        # Create a basic GeoTIFF with dummy metadata
        # This is a fallback - in practice, you'll want to preserve proper geospatial metadata
        height, width = image_array.shape[1:] if len(image_array.shape) > 2 else image_array.shape
        count = image_array.shape[0] if len(image_array.shape) > 2 else 1
        
        profile = {
            'driver': 'GTiff',
            'dtype': image_array.dtype,
            'nodata': None,
            'width': width,
            'height': height,
            'count': count,
            'crs': 'EPSG:4326',  # WGS84
            'transform': rasterio.transform.from_bounds(0, 0, 1, 1, width, height)
        }
        
        with rasterio.open(output_path, 'w', **profile) as dst:
            if len(image_array.shape) == 2:
                # Single band image
                dst.write(image_array, 1)
            else:
                # Multi-band image
                for band_idx in range(image_array.shape[0]):
                    dst.write(image_array[band_idx], band_idx + 1)


def main():
    parser = argparse.ArgumentParser(description="Geospatial image alignment worker")
    parser.add_argument("--image_a", required=True, help="Path to reference image A")
    parser.add_argument("--image_b", required=True, help="Path to image B to align")
    parser.add_argument("--aoi", required=True, help="Area of interest as string 'north=<latN>;south=<latS>;east=<lonE>;west=<lonW>'")
    parser.add_argument("--out_dir", required=True, help="Output directory for aligned images")
    
    args = parser.parse_args()
    
    # Parse AOI from string format
    aoi_parts = args.aoi.split(';')
    aoi_dict = {}
    for part in aoi_parts:
        if '=' in part:
            key, value = part.split('=', 1)
            aoi_dict[key] = float(value)
    
    # Use the AOI dictionary directly
    aoi = aoi_dict
    
    print(f"Processing images:")
    print(f"  Image A: {args.image_a}")
    print(f"  Image B: {args.image_b}")
    print(f"  AOI: {aoi}")
    print(f"  Output directory: {args.out_dir}")
    
    # Create output directory if it doesn't exist
    os.makedirs(args.out_dir, exist_ok=True)
    
    # Clip both images to AOI
    print("Clipping Image A to AOI...")
    clipped_a = clip_image_to_aoi(args.image_a, aoi)
    
    print("Clipping Image B to AOI...")
    clipped_b = clip_image_to_aoi(args.image_b, aoi)
    
    # Align Image B to Image A
    print("Aligning Image B to Image A...")
    aligned_b, alignment_info = align_images(clipped_a, clipped_b)
    
    # Save the clipped and aligned images
    output_path_a = os.path.join(args.out_dir, "A_clipped.tif")
    output_path_b = os.path.join(args.out_dir, "B_clipped_aligned.tif")
    
    print(f"Saving clipped Image A to {output_path_a}")
    save_geotiff(clipped_a, output_path_a, args.image_a)
    
    print(f"Saving aligned Image B to {output_path_b}")
    save_geotiff(aligned_b, output_path_b, args.image_b)
    
    print(f"Alignment completed successfully!")
    print(f"Alignment info: {alignment_info}")
    
    # Write alignment info to a JSON file
    alignment_info_path = os.path.join(args.out_dir, "alignment_info.json")
    with open(alignment_info_path, 'w') as f:
        json.dump(alignment_info, f, indent=2)


if __name__ == "__main__":
    main()