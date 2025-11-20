@echo off
echo Converting GeoTIFFs to Cloud Optimized GeoTIFFs (COGs)...

REM Check if GDAL is installed
where gdal_translate >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: GDAL is not installed or not in PATH.
    echo.
    echo Choose one of these installation options:
    echo.
    echo Option 1: Install QGIS (includes GDAL)
    echo   Download from: https://qgis.org/en/site/forusers/download.html
    echo   During installation, make sure to check "Install GDAL"
    echo.
    echo Option 2: Install OSGeo4W (GDAL package manager)
    echo   Download from: https://trac.osgeo.org/osgeo4w/
    echo   During installation, select "Advanced Install" and install GDAL
    echo.
    echo Option 3: Install via pip (if you have Python)
    echo   Run: pip install GDAL
    echo   Note: This may require additional system dependencies
    echo.
    echo Option 4: Install Anaconda/Miniconda first, then:
    echo   conda install -c conda-forge gdal
    echo.
    echo After installation, restart this command prompt and try again.
    pause
    exit /b 1
)

echo Converting first image (98MB) to COG...
gdal_translate -of COG -co COMPRESS=LZW -co OVERVIEWS=IGNORE_EXISTING -co TILING_SCHEME=GoogleMapsCompatible "D:\nextjs projects\galaxeye\data\uploads\file-1760012206505-302601129.tif" "D:\nextjs projects\galaxeye\data\uploads\file-1760012206505-302601129_cog.tif"

if %errorlevel% equ 0 (
    echo Successfully converted first image to COG format
) else (
    echo Error converting first image
)

echo Converting second image (1.5GB) to COG...
gdal_translate -of COG -co COMPRESS=LZW -co OVERVIEWS=IGNORE_EXISTING -co TILING_SCHEME=GoogleMapsCompatible "D:\nextjs projects\galaxeye\data\uploads\file-1760012389616-283714675.tif" "D:\nextjs projects\galaxeye\data\uploads\file-1760012389616-283714675_cog.tif"

if %errorlevel% equ 0 (
    echo Successfully converted second image to COG format
) else (
    echo Error converting second image
)

echo.
echo Conversion complete!
echo.
echo Now upload these COG files to your application instead of the original files:
echo - D:\nextjs projects\galaxeye\data\uploads\file-1760012206505-302601129_cog.tif
echo - D:\nextjs projects\galaxeye\data\uploads\file-1760012389616-283714675_cog.tif
echo.
echo The COG files will load much faster in the browser while maintaining full resolution for processing.
pause