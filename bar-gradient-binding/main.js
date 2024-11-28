var getScriptPromisify = (src) => {
  return new Promise((resolve, reject) => {
    $.getScript(src)
      .done(resolve)
      .fail((jqxhr, settings, exception) => {
        console.error('Failed to load script:', src, exception);
        reject(exception);
      });
  });
}

(function () {
  const parseMetadata = metadata => {
    if (!metadata) {
      console.warn('No metadata provided');
      return { dimensions: [], measures: [], dimensionsMap: {}, measuresMap: {} };
    }
    const { dimensions: dimensionsMap = {}, mainStructureMembers: measuresMap = {} } = metadata;
    const dimensions = [];
    for (const key in dimensionsMap) {
      const dimension = dimensionsMap[key];
      dimensions.push({ key, ...dimension });
    }
    const measures = [];
    for (const key in measuresMap) {
      const measure = measuresMap[key];
      measures.push({ key, ...measure });
    }
    return { dimensions, measures, dimensionsMap, measuresMap };
  };

  const parseDataBinding = (dataBinding) => {
    if (!dataBinding || !dataBinding.data) {
      console.warn('Invalid data binding:', dataBinding);
      return { data: [], dataAxis: [] };
    }

    const { data, metadata } = dataBinding;
    const { dimensions, measures } = parseMetadata(metadata);

    if (!dimensions.length || !measures.length) {
      console.warn('No dimensions or measures found in data binding');
      return { data: [], dataAxis: [] };
    }

    // dimension
    const categoryData = [];
    // measures
    const series = measures.map(measure => ({
      data: [],
      key: measure.key
    }));

    data.forEach(row => {
      if (!row) return;
      // dimension
      try {
        categoryData.push(dimensions.map(dimension => {
          const dimData = row[dimension.key];
          return dimData && dimData.label ? dimData.label : '';
        }).join('/'));
        // measures
        series.forEach(series => {
          const measureData = row[series.key];
          series.data.push(measureData && measureData.raw !== undefined ? measureData.raw : 0);
        });
      } catch (err) {
        console.warn('Error processing row:', row, err);
      }
    });

    return { data: series[0].data, dataAxis: categoryData };
  };

  const getOption = (dataBinding) => {
    const { data, dataAxis } = parseDataBinding(dataBinding);
    if (!data.length) {
      return {
        option: {
          title: {
            text: 'No data available'
          }
        },
        data: [],
        dataAxis: []
      };
    }

    let yMax = 0;
    data.forEach(y => {
      yMax = Math.max(y || 0, yMax);
    });
    const dataShadow = Array(data.length).fill(yMax);

    const option = {
      title: {
        text: 'Feature Sample: Gradient Color, Shadow, Click Zoom'
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
          formatter: '{value} Million',
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
  };

  const template = document.createElement('template')
  template.innerHTML = `
      <style>
      </style>
      <div id="root" style="width: 100%; height: 100%;">
      </div>
    `
  class Main extends HTMLElement {
    constructor () {
      super()
      
      this._shadowRoot = this.attachShadow({ mode: 'open' })
      this._shadowRoot.appendChild(template.content.cloneNode(true))
      this._root = this._shadowRoot.getElementById('root')
      this._props = {}
      this._initialized = false
    }

    async connectedCallback() {
      try {
        if (!window.echarts) {
          await getScriptPromisify('https://cdn.jsdelivr.net/npm/echarts@5.5.1/dist/echarts.min.js');
        }
        this._initialized = true;
        this.render();
      } catch (err) {
        console.error('Failed to initialize ECharts:', err);
        this._root.innerHTML = 'Failed to load ECharts library. Please check console for details.';
      }
    }

    disconnectedCallback() {
      if (this._myChart) {
        echarts.dispose(this._myChart);
      }
    }

    onCustomWidgetResize (width, height) {
      if (this._myChart) {
        this._myChart.resize();
      }
    }

    onCustomWidgetAfterUpdate (changedProps) {
      this.render()
    }

    async render () {
      try {
        if (!this._initialized) return;
        
        if (this._myChart) {
          echarts.dispose(this._myChart)
        }

        if (!this.myDataBinding || this.myDataBinding.state !== 'success') { 
          this._root.innerHTML = 'Waiting for data...';
          return;
        }

        const myChart = this._myChart = echarts.init(this._root)
        const { option, data, dataAxis } = getOption(this.myDataBinding)
        
        myChart.setOption(option)

        // Enable data zoom when user click bar.
        const zoomSize = 6
        myChart.on('click', (params) => {
          const startIdx = Math.max(params.dataIndex - zoomSize / 2, 0);
          const endIdx = Math.min(params.dataIndex + zoomSize / 2, data.length - 1);
          
          myChart.dispatchAction({
            type: 'dataZoom',
            startValue: dataAxis[startIdx],
            endValue: dataAxis[endIdx]
          })
        })
      } catch (err) {
        console.error('Error rendering chart:', err);
        this._root.innerHTML = 'Error rendering chart. Please check console for details.';
      }
    }
  }

  customElements.define('com-sap-sample-echarts-bar-gradient-binding', Main)
})()
