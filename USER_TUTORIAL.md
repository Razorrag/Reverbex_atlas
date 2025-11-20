# 🚀 ReverbEx Atlas - User Tutorial

## What is This Website?

**ReverbEx Atlas** is a powerful tool that helps you **align satellite images perfectly**. Imagine you have two satellite photos of the same location taken at different times - this app uses AI to line them up precisely so you can compare them side-by-side.

### Real-World Examples:
- 🏙️ **Urban Planning**: Compare how a city has grown over 5 years
- 🌲 **Environment**: Track deforestation or forest growth
- 🏗️ **Construction**: Monitor building progress month by month
- 🌊 **Disasters**: Assess flood or earthquake damage
- 🌾 **Agriculture**: Track crop health across seasons

---

## 🎯 What You Can Do: Step-by-Step

### **Step 1: Launch the Application** ⚡

1. Open your terminal/command prompt
2. Navigate to the project folder
3. Run the startup script:
   - **Windows**: Double-click `start.bat` or run `.\start.bat`
   - **Mac/Linux**: Run `./start.sh`
4. Wait for "System Online" message
5. Open your browser and go to: **http://localhost:5173**

You should see a beautiful dark-themed interface with:
- **ReverbEx Atlas** logo at the top
- **Control panel** on the left
- **Two map areas** on the right (currently empty)

---

### **Step 2: Upload Your First Images** 📸

You have **two options** to get images:

#### **Option A: Use Sample Data (Easiest!)**
1. Click the **"Load Sample Dataset"** button in the control panel
2. The app will automatically load example satellite images
3. Skip to Step 3!

#### **Option B: Upload Your Own GeoTIFF Files**
1. Find two GeoTIFF files (.tif or .tiff) on your computer
   - These must be satellite/geospatial images with coordinate information
2. **Upload Image A (Reference)**:
   - Click the first upload area (or drag & drop your file)
   - Wait for upload to complete (you'll see a progress bar)
3. **Upload Image B (Target)**:
   - Click the second upload area
   - Upload your second image

💡 **Tip**: The upload areas will show green checkmarks when successful!

---

### **Step 3: View Your Images on Maps** 🗺️

After uploading, you should see:
- **Left Map**: Shows Image A (your reference image)
- **Right Map**: Shows Image B (your target image to align)

**Try This:**
- ✨ **Zoom in/out** on the left map → Right map zooms too!
- ✨ **Pan around** the left map → Right map follows along!
- ✨ This is called **synchronized mapping** - very useful for comparison!

---

### **Step 4: Select Your Area of Interest (AOI)** 🎯

Now you need to tell the AI **which part of the images** to align:

1. Look for the **drawing tools** on the left map (top-left corner)
2. Click the **rectangle/square icon** 📐
3. **Draw a box** around the area you want to analyze:
   - Click once to start
   - Move mouse to create rectangle
   - Click again to finish
4. You'll see a **purple/blue rectangle** appear on your maps

💡 **Pro Tip**: Select an area with distinct features (buildings, roads, rivers) for best alignment results!

---

### **Step 5: Start AI Alignment** 🤖

Ready to let the AI work its magic?

1. Make sure you have:
   - ✅ Image A uploaded
   - ✅ Image B uploaded  
   - ✅ AOI (area) selected
2. Click the **"Start AI Alignment"** button
3. Watch the processing overlay appear!

**What's Happening:**
- 🔄 Status shows "Processing Geospatial Data"
- 📊 Progress bar animates
- ⚡ AI analyzes your images (usually takes 10-60 seconds)
- 🧠 Phase cross-correlation algorithm runs

---

### **Step 6: View Results** ✨

When processing completes:

1. **Success notification** appears (green indicator, bottom-right)
2. **Maps update automatically** with aligned images
3. **Compare the results**:
   - Left map: Original Image A
   - Right map: Aligned Image B (now perfectly matched!)

**What to Look For:**
- Buildings, roads, and features should line up perfectly
- Colors might differ (different times/seasons) but positions match
- You can zoom in to verify pixel-level alignment

---

### **Step 7: Start Over** 🔄

Want to process different images?

1. Click the **"Reset"** button in the control panel
2. All images clear
3. Start from Step 2 again!

---

## 🧪 Quick Testing Checklist

Try these to explore all features:

- [ ] **Load sample dataset** and process it
- [ ] **Upload your own** GeoTIFF files
- [ ] **Draw rectangles** in different areas
- [ ] **Zoom and pan** synchronized maps
- [ ] **Watch processing** status updates
- [ ] **View final alignment** results
- [ ] **Reset and try again** with different images

---

## 🎓 Understanding the Interface

### **Control Panel (Left Side)**

| Element | What It Does |
|---------|--------------|
| **Image A Upload** | Upload your reference satellite image |
| **Image B Upload** | Upload image you want to align |
| **Load Sample** | Try the app with example data |
| **Start AI Alignment** | Begin processing (needs A, B, and AOI) |
| **Reset** | Clear everything and start fresh |
| **Status Chips** | Show current upload/processing status |

### **Map View (Right Side)**

| Feature | Description |
|---------|-------------|
| **Left Map** | Shows Image A (reference) |
| **Right Map** | Shows Image B (target/aligned) |
| **Drawing Tools** | Top-left of map - draw AOI rectangles |
| **Zoom Controls** | +/- buttons to zoom in/out |
| **Synchronized Movement** | Both maps move together |

---

## 💡 Pro Tips for Best Results

### **Choosing Images**
- ✅ Use images from the same geographic area
- ✅ Images should overlap (cover same region)
- ✅ Clear features work best (cities, coastlines)
- ❌ Avoid completely cloudy or empty images

### **Selecting AOI**
- ✅ Select areas with distinct landmarks
- ✅ Bigger areas = more accurate alignment
- ✅ Include varied features (buildings, roads, water)
- ❌ Don't select tiny areas or all-water zones

### **Processing**
- ⏱️ Allow 10-60 seconds for processing
- 💻 Don't close the browser during processing
- 🔄 If it takes too long (>2 min), try Reset and restart

---

## 🚨 Troubleshooting

### **"Maps not loading"**
- ✅ Refresh the page
- ✅ Check if backend is running (start.bat/start.sh)
- ✅ Look at browser console (F12) for errors

### **"Upload failed"**
- ✅ Make sure files are GeoTIFF format (.tif/.tiff)
- ✅ Check file size (very large files may timeout)
- ✅ Verify files have geospatial metadata

### **"Processing stuck"**
- ✅ Wait at least 1-2 minutes
- ✅ Check Python worker is running (terminal logs)
- ✅ Try smaller AOI or different images
- ✅ Click Reset and try again

### **"Results look wrong"**
- ✅ Images might be too different
- ✅ Try a different AOI with clearer features
- ✅ Ensure images actually overlap geographically

---

## 📊 Example Workflow

### **Scenario: Track City Growth**

1. **Get Images**:
   - Image A: City satellite photo from 2020
   - Image B: Same city from 2025

2. **Upload**:
   - Upload 2020 image as Image A
   - Upload 2025 image as Image B

3. **Select AOI**:
   - Draw rectangle around downtown area
   - Include buildings, roads, landmarks

4. **Process**:
   - Click "Start AI Alignment"
   - Wait 30-45 seconds

5. **Analyze Results**:
   - See new buildings appear in 2025 image
   - Compare infrastructure changes
   - Notice urban expansion

---

## 🎯 Success Criteria

You're using the app correctly when:

- ✅ Maps load and display your images
- ✅ Both maps move together when zooming/panning
- ✅ AOI rectangle appears on both maps
- ✅ Processing completes in under 2 minutes
- ✅ Final images align perfectly when zoomed in

---

## 🤝 Need Help?

### **Resources**
- 📚 **Technical Details**: See [TESTING_GUIDE.md](TESTING_GUIDE.md)
- 🏗️ **Architecture**: See [ARCHITECTURE.md](ARCHITECTURE.md)
- 📖 **Features**: See [FEATURES.md](FEATURES.md)
- 🐛 **Issues**: Check terminal/console logs

### **Community**
- 💬 Ask questions in GitHub Issues
- 📧 Contact the development team
- 🤝 Contribute improvements

---

## 🎉 You're Ready!

Now you know everything you need to use ReverbEx Atlas! Start with the sample dataset, then try your own satellite imagery. Have fun exploring the power of AI-driven geospatial alignment!

**Happy Mapping!** 🗺️✨
