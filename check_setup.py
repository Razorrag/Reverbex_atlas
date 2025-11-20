#!/usr/bin/env python3
"""
Simple setup check for GalaxEye
Verifies all dependencies and sample data before starting the application
"""

import os
import sys
import subprocess
import platform

def print_header(title):
    print(f"\n{'='*50}")
    print(f"  {title}")
    print(f"{'='*50}")

def check_command(command, description):
    """Check if a command is available"""
    try:
        result = subprocess.run([command, '--version'], 
                              capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            version = result.stdout.strip().split('\n')[0]
            print(f"✅ {description}: {version}")
            return True
        else:
            print(f"❌ {description}: Not found")
            return False
    except (subprocess.TimeoutExpired, FileNotFoundError):
        print(f"❌ {description}: Not found")
        return False

def check_python_package(package):
    """Check if a Python package is installed"""
    try:
        import importlib.metadata
        version = importlib.metadata.version(package)
        print(f"✅ Python {package}: {version}")
        return True
    except importlib.metadata.PackageNotFoundError:
        print(f"❌ Python {package}: Not installed")
        return False

def check_directory(path, description):
    """Check if a directory exists"""
    if os.path.exists(path):
        print(f"✅ {description}: {path}")
        return True
    else:
        print(f"❌ {description}: {path} (missing)")
        return False

def main():
    print_header("GalaxEye Setup Check")
    
    # Check system requirements
    print("\n🔍 Checking System Requirements:")
    
    # Check Node.js
    node_ok = check_command('node', 'Node.js')
    
    # Check npm
    npm_ok = check_command('npm', 'npm')
    
    # Check Python
    python_cmd = 'python3' if platform.system() != 'Windows' else 'python'
    python_ok = check_command(python_cmd, 'Python')
    
    # Check pip
    pip_cmd = 'pip3' if platform.system() != 'Windows' else 'pip'
    pip_ok = check_command(pip_cmd, 'pip')
    
    # Check Python packages
    print("\n📦 Checking Python Packages:")
    packages = ['numpy', 'rasterio', 'scikit-image', 'shapely']
    for package in packages:
        check_python_package(package)
    
    # Check project structure
    print("\n📁 Checking Project Structure:")
    dirs_to_check = [
        ('api', 'Backend API'),
        ('worker', 'Python Worker'),
        ('components', 'Frontend Components'),
        ('data/uploads', 'Upload Directory'),
        ('data/outputs', 'Output Directory'),
        ('data/sample-data', 'Sample Data')
    ]
    
    project_ok = True
    for path, desc in dirs_to_check:
        if not check_directory(path, desc):
            project_ok = False
    
    # Check sample data
    print("\n🛰️ Checking Sample Data:")
    sample_files = [
        'data/sample-data/sample_image_a.tif',
        'data/sample-data/sample_image_b.tif'
    ]
    
    sample_ok = True
    for file_path in sample_files:
        if not check_directory(file_path, f"Sample file"):
            sample_ok = False
    
    # Summary
    print_header("Setup Summary")
    
    if node_ok and npm_ok and python_ok and pip_ok and project_ok and sample_ok:
        print("✅ Everything looks good! You can run: start.bat (Windows) or ./start.sh (Mac/Linux)")
        print("\n🚀 Quick Start:")
        print("   1. Run: start.bat  (Windows)")
        print("   2. Or: ./start.sh  (Mac/Linux)")
        print("   3. Open: http://localhost:5173")
        return True
    else:
        print("❌ Some issues found. Please fix the above problems before running the app.")
        print("\n💡 Common Solutions:")
        print("   - Install Node.js from https://nodejs.org/")
        print("   - Install Python from https://python.org/")
        print("   - Run: npm install")
        print("   - Run: cd api && npm install")
        print("   - Run: pip install -r worker/requirements.txt")
        return False

if __name__ == "__main__":
    main()