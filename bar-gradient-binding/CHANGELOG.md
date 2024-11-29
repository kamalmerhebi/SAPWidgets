# Changelog

## [1.0.4] - 2024-01-09

### Changed
- Updated widget namespace from SAP to InsightCubes
- Changed widget ID to insightcubes.echarts.bargradientbinding
- Updated webcomponent tag to match new namespace
- Modified custom element definition to align with new naming

## [1.0.4] - 2024-01-24

### Changed
- Major architectural refactoring to support custom namespace
- Simplified widget initialization process
- Reduced dependency on SAP widget framework
- Made widget more self-contained
- Changed widget ID to use InsightCubes namespace

### Before and After Code Comparison
```javascript
// Before - Complex initialization with heavy SAP framework dependency
var getScriptPromisify = (src) => {
  return new Promise((resolve, reject) => {
    $.getScript(src)
      .done(resolve)
      .fail((jqxhr, settings, exception) => {
        console.error('Failed to load script:', src, exception);
        reject(exception);
      });
  });
};

// After - Simplified, self-contained initialization
!function() {
  "use strict";
  let widgetName = "insightcubes-echarts-bargradient";
```

```javascript
// Before - Complex async loading
async connectedCallback() {
  try {
    this.setLoadingState(true);
    if (!window.echarts) {
      await getScriptPromisify('https://cdn.jsdelivr.net/npm/echarts@5.5.1/dist/echarts.min.js');
    }
    this._initialized = true;
    this._resizeObserver.observe(this._root);
    this.render();
  } catch (err) {
    console.error('Failed to initialize ECharts:', err);
    showError(this._root, 'Failed to load ECharts library');
  } finally {
    this.setLoadingState(false);
  }
}

// After - Direct initialization with error handling
connectedCallback() {
  this.loadECharts(() => {
    this._initialized = true;
    this._resizeObserver.observe(this._root);
    this.render();
  });
}
```

## [1.0.3] - 2024-01-09

### Added
- Loading state management with visual feedback
- Enhanced error visualization with styled error messages
- Comprehensive data validation system
- Debounced rendering for better performance
- ResizeObserver for automatic chart resizing
- Enhanced chart options (tooltips, toolbox, save feature)
- Chart click event handling with zoom functionality
- Memory management and cleanup system

### Enhanced
- Improved error handling with user-friendly messages
- Better state management during widget lifecycle
- Enhanced chart initialization process
- Added defensive programming throughout the code
- Improved data binding validation

## [1.0.2] - 2024-01-09

### Enhanced
- Improved data binding parsing with comprehensive error handling
- Added detailed logging for debugging data binding issues
- Enhanced type checking and validation for data structures
- Implemented safer property access using modern JavaScript features
- Added graceful fallbacks for missing or invalid data
- Optimized metadata parsing using Object.entries
- Improved initialization state handling

### Fixed
- Addressed undefined data binding issues during initialization
- Fixed potential type errors in data processing
- Improved error messages and user feedback

## [1.0.1] - 2024-01-10
- Improved error handling and lifecycle management
- Added proper cleanup in disconnectedCallback
- Added loading and error states
- Improved resize handling
- Added title property and methods
- Added onClick event support
- Added export support

## [1.0.0] - 2024-01-09
- Updated main.js URL to use GitHub CDN: https://cdn.jsdelivr.net/gh/kamalmerhebi/SAPWidgets@main/bar-gradient-binding/main.js
