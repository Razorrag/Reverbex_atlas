# 🎯 Quick Demo Guide

## What You'll See in This Demo

This demo shows you how GalaxEye aligns two satellite images of the same area taken at different times.

### Sample Data Included:
- **Image A**: San Francisco satellite image (reference)
- **Image B**: Same area, slightly shifted image (to be aligned)

## Step-by-Step Demo

### 1. Start the Application
```bash
# Windows
start.bat

# Mac/Linux  
./start.sh
```

### 2. Open Browser
Go to: **http://localhost:5173**

### 3. The Interface

You'll see:
- **Left Panel**: Control panel with upload buttons
- **Right Side**: Two side-by-side maps showing satellite imagery

### 4. Try the Demo (No Upload Needed!)

1. **Click "Use Sample Data"** (if available) or upload your own GeoTIFF files
2. **Draw on the Map**: Click the rectangle tool and draw a box around an area of interest
3. **Click "Start Alignment"**: Watch the AI process the images
4. **See Results**: The maps will show the perfectly aligned images

## What Makes This Cool? 🎉

### Before Alignment:
- Images are offset and don't line up
- Hard to compare changes between them

### After Alignment:
- Images are perfectly aligned
- Easy to spot differences and changes
- Professional-grade accuracy

## Technical Details (For Developers)

### The Magic Behind It:
1. **Phase Cross-Correlation**: Advanced computer vision algorithm
2. **Sub-pixel Accuracy**: 100x precision in alignment
3. **Multi-band Processing**: Handles RGB and multispectral images
4. **Real-time Updates**: See processing progress live

### Processing Steps:
```
Input Images → Spatial Clipping → Phase Correlation → Alignment → Output
```

## Common Use Cases

### 🏙️ Urban Planning
- Compare city development over time
- Track construction progress
- Plan future developments

### 🌱 Environmental Monitoring  
- Monitor deforestation
- Track flooding patterns
- Study urban sprawl

### 🚨 Disaster Response
- Assess damage after natural disasters
- Compare before/after satellite imagery
- Plan recovery efforts

## Tips for Best Results

1. **Clear Overlap**: Make sure your images have overlapping areas
2. **Good Quality**: Higher resolution images produce better results
3. **Similar Conditions**: Images taken under similar lighting work best
4. **AOI Selection**: Choose areas with clear features for better alignment

---

**Ready to see the magic? Just run the start script and visit http://localhost:5173!** ✨