# Bar Gradient Binding Widget Changelog

## [1.1.0] - 2024-01-24

### Changed
- Updated widget identification:
  - Changed ID to "insightcubes.sac.bargradient"
  - Simplified name to "Bar Gradient"
  - Updated instance prefix to "BarGradient"
  - Updated custom element tag to "bar-gradient-binding"
- Added comprehensive property descriptions
- Enhanced method documentation

### Added
- Customizable gradient colors for bars
- Title customization (text, font size, color)
- Axis label formatting and color options
- Bar width and gap controls
- Zoom functionality toggle
- Mobile device support

### Fixed
- Improved property getter/setter consistency
- Enhanced error handling in data binding

### New Features
- Added extensive customization options:
  - Gradient colors (start, middle, end colors)
  - Title text and styling (font size, color)
  - Axis label formatting and colors
  - Bar width and spacing controls
  - Zoom functionality toggle

### Technical Changes
- Enhanced widget configuration in `index.json`:
  - Added new properties for customization
  - Added methods for title management
  - All properties have default values
- Updated `main.js`:
  - Implemented property getters/setters
  - Added dynamic rendering on property changes
  - Enhanced chart option generation
  - Improved zoom control handling

### Properties Added
- `title`: Customize chart title text
- `titleFontSize`: Control title font size
- `titleColor`: Set title color
- `gradientStartColor`: Customize gradient start color
- `gradientMiddleColor`: Set gradient middle color
- `gradientEndColor`: Set gradient end color
- `barWidth`: Control bar width in pixels
- `barGap`: Adjust spacing between bars
- `axisLabelFormat`: Customize axis label format
- `axisLabelColor`: Set axis label color
- `enableZoom`: Toggle zoom functionality

## [1.0.0] - 2024-01-09

### Repository Changes
- Cleaned up repository to focus solely on the bar-gradient-binding widget
- Removed all other widget folders to maintain a single-purpose repository
- Kept only essential files for the bar gradient binding functionality

### Technical Changes
- Updated widget URL configuration in `index.json`
- Switched from raw GitHub content to jsDelivr CDN:
  ```json
  "url": "https://cdn.jsdelivr.net/gh/kamalmerhebi/SAPWidgets@main/bar-gradient-binding/main.js"
  ```
- This change resolved CORS and content-type issues that were preventing the widget from loading

### Bug Fixes
- Fixed widget loading issue in SAC by implementing proper CDN delivery
- Resolved content-type and CORS headers problems by using jsDelivr CDN
- Widget now loads and functions correctly in SAC environment

### Technical Details
- Widget ID: `com.sap.sac.sample.echarts.bargradientbindingdemo`
- Main Component Tag: `com-sap-sample-echarts-bar-gradient-binding`
- Version: 1.0.0
- Dependencies: ECharts library (loaded dynamically)

### Repository Information
- Local Repository Path: `D:\Cloud Drives\InsightCubes\InsightCubes - SAC - SAC\sacwidgets - GitHub\SAPWidgets`
- GitHub Repository: https://github.com/kamalmerhebi/SAPWidgets
- Active Branch: main
- Git Commands Used:
  ```bash
  # Check repository status
  "C:\Program Files\Git\bin\git.exe" status
  
  # Add changes
  "C:\Program Files\Git\bin\git.exe" add .
  
  # Commit changes
  "C:\Program Files\Git\bin\git.exe" commit -m "Cleaned up repository, keeping only bar-gradient-binding widget"
  
  # Switch to main branch
  "C:\Program Files\Git\bin\git.exe" checkout main
  ```

### Notes
- Using jsDelivr CDN provides several benefits:
  - Proper CORS headers
  - Correct content-type delivery
  - Optimized content delivery
  - Specifically designed for serving GitHub content
- The widget is now properly configured for production use in SAC
