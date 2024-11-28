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

(function() {
  const showError = (root, message) => {
    root.innerHTML = `
      <div class="error-container">
        <div class="error-message">${message}</div>
        <div class="error-details">Please check console for more details</div>
      </div>
    `;
  };

  const validateDataStructure = (data) => {
    if (!data || typeof data !== 'object') {
      return { valid: false, error: 'Invalid data structure' };
    }
    if (!Array.isArray(data.data)) {
      return { valid: false, error: 'Data must be an array' };
    }
    if (!data.metadata) {
      return { valid: false, error: 'Missing metadata' };
    }
    return { valid: true };
  };

  const parseMetadata = metadata => {
    if (!metadata) {
      console.warn('No metadata provided');
      return { dimensions: [], measures: [], dimensionsMap: {}, measuresMap: {} };
    }
    const { dimensions: dimensionsMap = {}, mainStructureMembers: measuresMap = {} } = metadata;
    const dimensions = Object.entries(dimensionsMap).map(([key, dimension]) => ({ key, ...dimension }));
    const measures = Object.entries(measuresMap).map(([key, measure]) => ({ key, ...measure }));
    return { dimensions, measures, dimensionsMap, measuresMap };
  };

  const parseDataBinding = (dataBinding) => {
    try {
      console.log('Parsing data binding:', JSON.stringify(dataBinding));

      const validation = validateDataStructure(dataBinding);
      if (!validation.valid) {
        console.warn(validation.error);
        return { data: [], dataAxis: [] };
      }

      const { data: bindingData, metadata } = dataBinding;

      const { dimensions = [], measures = [] } = parseMetadata(metadata);

      if (!dimensions.length || !measures.length) {
        console.warn('No dimensions or measures found');
        return { data: [], dataAxis: [] };
      }

      const categoryData = [];
      const series = measures.map(measure => ({
        data: [],
        key: measure.key
      }));

      bindingData.forEach((row, index) => {
        if (!row) {
          console.warn(`Skipping null/undefined row at index ${index}`);
          return;
        }

        try {
          const labels = dimensions.map(dimension => {
            const dimData = row[dimension.key];
            return dimData && typeof dimData === 'object' ? dimData.label || '' : '';
          }).filter(label => label !== '');

          if (labels.length > 0) {
            categoryData.push(labels.join('/'));
            series.forEach(seriesItem => {
              const measureData = row[seriesItem.key];
              const value = measureData && typeof measureData === 'object' ? 
                (measureData.raw !== undefined ? measureData.raw : 0) : 0;
              seriesItem.data.push(value);
            });
          } else {
            console.warn(`No valid labels found for row ${index}`);
          }
        } catch (err) {
          console.warn(`Error processing row ${index}:`, err);
        }
      });

      if (!series[0] || !Array.isArray(series[0].data)) {
        console.warn('No valid series data found');
        return { data: [], dataAxis: [] };
      }

      return { 
        data: series[0].data, 
        dataAxis: categoryData 
      };
    } catch (err) {
      console.error('Error parsing data binding:', err);
      return { data: [], dataAxis: [] };
    }
  };

  const getOption = (dataBinding) => {
    try {
      console.log('Processing data binding in getOption:', dataBinding ? 'present' : 'missing');
      
      const { data, dataAxis } = parseDataBinding(dataBinding);
      
      if (!Array.isArray(data) || !data.length) {
        console.log('No valid data available for chart');
        return {
          option: {
            title: {
              text: 'Waiting for data...',
              left: 'center',
              top: 'center'
            }
          },
          data: [],
          dataAxis: []
        };
      }

      const yMax = data.reduce((max, val) => Math.max(max, Number(val) || 0), 0);

      const option = {
        title: {
          text: 'Feature Sample: Gradient Color, Shadow, Click Zoom'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        toolbox: {
          feature: {
            saveAsImage: {}
          }
        },
        xAxis: {
          data: dataAxis,
          axisLabel: {
            inside: true,
            color: '#000'
          },
          axisTick: {
            show: false
          },
          axisLine: {
            show: false
          },
          z: 10
        },
        yAxis: {
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            color: '#999'
          }
        },
        dataZoom: [
          {
            type: 'inside'
          }
        ],
        series: [
          {
            type: 'bar',
            showBackground: true,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#83bff6' },
                { offset: 0.5, color: '#188df0' },
                { offset: 1, color: '#188df0' }
              ])
            },
            emphasis: {
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#2378f7' },
                  { offset: 0.7, color: '#2378f7' },
                  { offset: 1, color: '#83bff6' }
                ])
              }
            },
            data: data
          }
        ]
      };
      return { option, data, dataAxis };
    } catch (err) {
      console.error('Error in getOption:', err);
      return {
        option: {
          title: {
            text: 'Error processing data',
            left: 'center',
            top: 'center'
          }
        },
        data: [],
        dataAxis: []
      };
    }
  };

  const template = document.createElement('template');
  template.innerHTML = `
    <style>
      .error-container {
        padding: 20px;
        text-align: center;
        color: #721c24;
        background-color: #f8d7da;
        border: 1px solid #f5c6cb;
        border-radius: 4px;
      }
      .loading {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        color: #666;
      }
      .error-message {
        font-weight: bold;
        margin-bottom: 10px;
      }
      .error-details {
        font-size: 0.9em;
        opacity: 0.8;
      }
    </style>
    <div id="root" style="width: 100%; height: 100%;"></div>
  `;

  class Main extends HTMLElement {
    constructor() {
      super();
      this._shadowRoot = this.attachShadow({ mode: 'open' });
      this._shadowRoot.appendChild(template.content.cloneNode(true));
      this._root = this._shadowRoot.getElementById('root');
      this._props = {};
      this._initialized = false;
      this._myChart = null;
      this._loading = false;
      this._renderTimeout = null;
      this.myDataBinding = null;

      // Initialize ResizeObserver
      this._resizeObserver = new ResizeObserver(() => {
        if (this._myChart) {
          this._myChart.resize();
        }
      });
    }

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

    disconnectedCallback() {
      this.cleanupResources();
    }

    cleanupResources() {
      if (this._myChart) {
        this._myChart.dispose();
        this._myChart = null;
      }
      if (this._renderTimeout) {
        clearTimeout(this._renderTimeout);
        this._renderTimeout = null;
      }
      if (this._resizeObserver) {
        this._resizeObserver.disconnect();
        this._resizeObserver = null;
      }
    }

    setLoadingState(loading) {
      this._loading = loading;
      if (loading) {
        this._root.innerHTML = '<div class="loading">Loading chart...</div>';
      }
    }

    debouncedRender() {
      if (this._renderTimeout) {
        clearTimeout(this._renderTimeout);
      }
      this._renderTimeout = setTimeout(() => {
        this.render();
      }, 100);
    }

    attachEventHandlers() {
      if (!this._myChart) return;

      this._myChart.on('click', (params) => {
        // Dispatch custom event
        const event = new CustomEvent('chartClick', {
          detail: {
            dataIndex: params.dataIndex,
            value: params.value,
            name: params.name
          }
        });
        this.dispatchEvent(event);

        // Handle zoom
        const zoomSize = 6;
        const startIdx = Math.max(params.dataIndex - zoomSize / 2, 0);
        const endIdx = Math.min(params.dataIndex + zoomSize / 2, params.data.length - 1);
        
        this._myChart.dispatchAction({
          type: 'dataZoom',
          startValue: params.name,
          endValue: params.name
        });
      });
    }

    onCustomWidgetResize(width, height) {
      if (this._myChart) {
        this._myChart.resize();
      }
    }

    onCustomWidgetAfterUpdate(changedProps) {
      console.log('onCustomWidgetAfterUpdate called with:', changedProps);
      
      const dataBinding = this.myDataBinding || changedProps.myDataBinding;
      console.log('Current data binding state:', dataBinding);
      
      if (dataBinding) {
        this.myDataBinding = dataBinding;
        console.log('Updated data binding:', this.myDataBinding);
      }
      
      if (!this._initialized) {
        console.log('Widget not fully initialized yet, deferring render');
        return;
      }
      
      this.debouncedRender();
    }

    async render() {
      try {
        console.log('Render called. Initialization state:', this._initialized);
        console.log('Current data binding:', this.myDataBinding);
        
        if (!this._initialized) {
          console.log('Chart not initialized yet, skipping render');
          return;
        }
        
        if (this._myChart) {
          this._myChart.dispose();
          this._myChart = null;
        }

        if (!this.myDataBinding) {
          console.log('No data binding available yet');
          this._root.innerHTML = '<div class="loading">Waiting for data...</div>';
          return;
        }

        const myChart = this._myChart = echarts.init(this._root);
        const { option, data, dataAxis } = getOption(this.myDataBinding);
        
        if (!data.length) {
          console.log('No data available yet');
          showError(this._root, 'No data available');
          return;
        }

        myChart.setOption(option);
        this.attachEventHandlers();
      } catch (err) {
        console.error('Error rendering chart:', err);
        showError(this._root, 'Error rendering chart');
      }
    }
  }

  customElements.define('insightcubes-echarts-bargradientbinding', Main);
})();
