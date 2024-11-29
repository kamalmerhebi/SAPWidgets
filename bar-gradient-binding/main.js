!function() {
  "use strict";
  let widgetName = "insightcubes-echarts-bargradient";

  class Main extends HTMLElement {
    constructor() {
      super();
      this._shadowRoot = this.attachShadow({ mode: 'open' });
      this._shadowRoot.innerHTML = `
        <style>
          #root {
            width: 100%;
            height: 100%;
          }
          .error-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            color: #ff0000;
          }
          .error-message {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 8px;
          }
          .error-details {
            font-size: 14px;
          }
        </style>
        <div id="root"></div>
      `;
      
      this._root = this._shadowRoot.getElementById('root');
      this._props = {};
      this._initialized = false;
      this._myChart = null;
      this._loading = false;
      this._renderTimeout = null;
      this.myDataBinding = null;

      this._resizeObserver = new ResizeObserver(() => {
        if (this._myChart) {
          this._myChart.resize();
        }
      });
    }

    loadECharts(callback) {
      if (window.echarts) {
        callback();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/echarts@5.5.1/dist/echarts.min.js';
      script.onload = callback;
      script.onerror = () => {
        console.error('Failed to load ECharts library');
        this.showError('Failed to load ECharts library');
      };
      document.head.appendChild(script);
    }

    showError(message, details = '') {
      console.error('Widget Error:', message, details);
      this._root.innerHTML = `
        <div class="error-container">
          <div class="error-message">${message}</div>
          ${details ? `<div class="error-details">${details}</div>` : ''}
        </div>
      `;
    }

    connectedCallback() {
      this.loadECharts(() => {
        this._initialized = true;
        this._resizeObserver.observe(this._root);
        this.render();
      });
    }

    disconnectedCallback() {
      this.cleanupResources();
    }

    cleanupResources() {
      if (this._resizeObserver) {
        this._resizeObserver.disconnect();
      }
      if (this._myChart) {
        this._myChart.dispose();
        this._myChart = null;
      }
      if (this._renderTimeout) {
        clearTimeout(this._renderTimeout);
        this._renderTimeout = null;
      }
    }

    onCustomWidgetBeforeUpdate(changedProps) {
      this._props = { ...this._props, ...changedProps };
    }

    onCustomWidgetAfterUpdate(changedProps) {
      if ("myDataBinding" in changedProps) {
        this.myDataBinding = changedProps["myDataBinding"];
        this.render();
      }
    }

    onCustomWidgetResize(width, height) {
      if (this._myChart) {
        this._myChart.resize();
      }
    }

    parseDataBinding(dataBinding) {
      if (!dataBinding || !dataBinding.data) {
        console.warn('No data binding provided');
        return { data: [], categories: [] };
      }

      try {
        console.log('Data Binding Structure:', JSON.stringify(dataBinding, null, 2));
        
        const { data = [], metadata = {} } = dataBinding;
        
        // Log metadata structure
        console.log('Metadata Structure:', JSON.stringify(metadata, null, 2));

        // Find dimensions from feeds
        let dimensions = [];
        let measures = [];

        if (metadata.feeds) {
          Object.entries(metadata.feeds).forEach(([feedId, feed]) => {
            console.log('Processing feed:', feedId, feed);
            if (feed.values && feed.values.length > 0) {
              const feedType = feed.feedType;
              feed.values.forEach(value => {
                if (feedType === 'Dimension') {
                  dimensions.push(value);
                } else if (feedType === 'Measure') {
                  measures.push(value);
                }
              });
            }
          });
        }

        // Fallback to old metadata structure if no feeds
        if (dimensions.length === 0 && measures.length === 0) {
          console.log('Falling back to old metadata structure');
          if (metadata.dimensions) {
            dimensions = Object.keys(metadata.dimensions);
          }
          if (metadata.mainStructureMembers) {
            measures = Object.keys(metadata.mainStructureMembers);
          }
        }

        console.log('Found dimensions:', dimensions);
        console.log('Found measures:', measures);

        if (!dimensions.length || !measures.length) {
          console.warn('No dimensions or measures found in metadata');
          return { data: [], categories: [] };
        }

        const dimension = dimensions[0];
        const measure = measures[0];
        
        const categories = [];
        const values = [];

        data.forEach((item, index) => {
          console.log('Processing data item:', index, item);
          
          if (item[dimension] && item[measure]) {
            const dimValue = item[dimension].label || item[dimension];
            const measureValue = item[measure].raw !== undefined ? item[measure].raw : item[measure];
            
            console.log('Extracted values:', { dimension: dimValue, measure: measureValue });
            
            categories.push(dimValue.toString());
            values.push(parseFloat(measureValue) || 0);
          }
        });

        console.log('Final processed data:', { categories, values });
        return { data: values, categories };
      } catch (err) {
        console.error('Error parsing data binding:', err);
        this.showError('Error parsing data', err.message);
        return { data: [], categories: [] };
      }
    }

    getOption(dataBinding) {
      const { data, categories } = this.parseDataBinding(dataBinding);
      
      return {
        xAxis: {
          type: 'category',
          data: categories,
          axisLabel: {
            interval: 0,
            rotate: 30
          }
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          data: data.map((value, index) => ({
            value: value,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                offset: 0,
                color: '#83bff6'
              }, {
                offset: 0.5,
                color: '#188df0'
              }, {
                offset: 1,
                color: '#188df0'
              }])
            }
          })),
          type: 'bar'
        }],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        dataZoom: [{
          type: 'inside',
          start: 0,
          end: 100
        }, {
          start: 0,
          end: 100
        }]
      };
    }

    render() {
      if (!this._initialized || !this.myDataBinding) {
        return;
      }

      try {
        if (!this._myChart) {
          this._myChart = echarts.init(this._root);
        }
        const option = this.getOption(this.myDataBinding);
        this._myChart.setOption(option);
      } catch (err) {
        console.error('Error rendering chart:', err);
        this.showError('Failed to render chart', err.message);
      }
    }
  }

  customElements.define(widgetName, Main);
}();
