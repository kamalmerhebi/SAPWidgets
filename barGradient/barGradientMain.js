var getScriptPromisify = (src) => {
  return new Promise(resolve => {
    $.getScript(src, resolve)
  })
}

(function () {
  const parseMetadata = metadata => {
    const { dimensions: dimensionsMap, mainStructureMembers: measuresMap } = metadata
    const dimensions = []
    for (const key in dimensionsMap) {
      const dimension = dimensionsMap[key]
      dimensions.push({ key, ...dimension })
    }
    const measures = []
    for (const key in measuresMap) {
      const measure = measuresMap[key]
      measures.push({ key, ...measure })
    }
    return { dimensions, measures, dimensionsMap, measuresMap }
  }

  const parseDataBinding = dataBinding => {
    const metadata = parseMetadata(dataBinding.metadata)
    return {
      data: dataBinding.data,
      metadata
    }
  }

  const createChartOption = dataBinding => {
    if (!dataBinding) {
      return {
        title: {
          text: 'No data selected'
        }
      }
    }

    const { data, metadata: { dimensions, measures } } = parseDataBinding(dataBinding)
    const [dimension] = dimensions
    const [measure] = measures

    const xAxisData = []
    const seriesData = []

    data.forEach(row => {
      xAxisData.push(row[dimension.key].label)
      seriesData.push(row[measure.key].raw)
    })

    return {
      title: {
        text: measure.label,
        left: 'center'
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
      xAxis: {
        type: 'category',
        data: xAxisData,
        axisLabel: {
          interval: 0,
          rotate: 30
        }
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          data: seriesData,
          type: 'bar',
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
          }
        }
      ]
    }
  }

  const template = document.createElement('template')
  template.innerHTML = `
      <style>
        #root {
          width: 100%;
          height: 100%;
        }
      </style>
      <div id="root" style="width: 100%; height: 100%;"></div>
  `

  class Main extends HTMLElement {
    constructor () {
      super()

      this._shadowRoot = this.attachShadow({ mode: 'open' })
      this._shadowRoot.appendChild(template.content.cloneNode(true))

      this._root = this._shadowRoot.getElementById('root')
      this._myChart = null
      this._props = {}

      this.render()
    }

    async onCustomWidgetAfterUpdate(changedProps) {
      this._props = { ...this._props, ...changedProps }
      
      if (!this._myChart) {
        this._myChart = echarts.init(this._root)
      }
      
      const option = createChartOption(this._props.dataBinding)
      this._myChart.setOption(option)
    }

    onCustomWidgetResize (width, height) {
      if (this._myChart) {
        this._myChart.resize()
      }
    }

    async render () {
      await getScriptPromisify('https://cdn.jsdelivr.net/npm/echarts@5.5.1/dist/echarts.min.js')
      
      if (!this._myChart) {
        this._myChart = echarts.init(this._root)
      }

      const option = createChartOption(this._props.dataBinding)
      this._myChart.setOption(option)
    }
  }

  customElements.define('insightcubes-bargradient', Main)
})()
