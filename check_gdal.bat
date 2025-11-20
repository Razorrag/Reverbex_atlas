@echo off
echo Checking GDAL installation...
echo.

REM Check if gdal_translate is available
where gdal_translate >nul 2>nul
if %errorlevel% neq 0 (
    echo GDAL is NOT installed or not in your PATH
    echo.
    echo You need to install GDAL before running the COG conversion script.
    echo.
    echo After installing GDAL, run this check again to verify it's working.
    pause
    exit /b 1
) else (
    echo GDAL is installed and accessible!
    echo.
    echo GDAL version:
    gdal_translate --version
    echo.
    echo You can now run convert_to_cog.bat to convert your GeoTIFF files.
    pause
)