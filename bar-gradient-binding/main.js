var getScriptPromisify = (src) => {
  return new Promise((resolve, reject) => {
    $.getScript(src, resolve).fail(() => reject(`Error loading script: ${src}`))
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

  const parseDataBinding = (dataBinding) => {
    const { data, metadata } = dataBinding
    const { dimensions, measures } = parseMetadata(metadata)

    // dimension
    const categoryData = []
    // measures
    const series = measures.map(measure => {
      return {
        data: [],
        key: measure.key
      }
    })
    data.forEach(row => {
    // dimension
      categoryData.push(dimensions.map(dimension => {
        return row[dimension.key].label
      }).join('/'))
      // measures
      series.forEach(series => {
        series.data.push(row[series.key].raw)
      })
    })
    return { data: series[0].data, dataAxis: categoryData }
  }
  const getOption = (dataBinding, props) => {
    const { data, dataAxis } = parseDataBinding(dataBinding)
    let yMax = 0
    data.forEach(y => {
      yMax = Math.max(y, yMax)
    })
    const dataShadow = []
    for (let i = 0; i < data.length; i++) {
      dataShadow.push(yMax)
    }
    const option = {
      title: {
        text: props.title || 'Bar Gradient',
        textStyle: {
          fontSize: props.titleFontSize || 18,
          color: props.titleColor || '#333333'
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
          formatter: props.axisLabelFormat || '{value} Million',
          color: props.axisLabelColor || '#999'
        }
      },
      dataZoom: props.enableZoom ? [
        {
          type: 'inside'
        }
      ] : [],
      series: [
        {
          type: 'bar',
          showBackground: true,
          barWidth: props.barWidth || 40,
          barGap: props.barGap + '%' || '30%',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: props.gradientStartColor || '#83bff6' },
              { offset: 0.5, color: props.gradientMiddleColor || '#188df0' },
              { offset: 1, color: props.gradientEndColor || '#188df0' }
            ])
          },
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: props.gradientStartColor || '#2378f7' },
                { offset: 0.7, color: props.gradientMiddleColor || '#2378f7' },
                { offset: 1, color: props.gradientEndColor || '#83bff6' }
              ])
            }
          },
          data: data
        }
      ]
    }
    return { option, data, dataAxis }
  }

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
      
      // Initialize properties with defaults
      this._props = {
        title: 'Bar Gradient',
        titleFontSize: 18,
        titleColor: '#333333',
        axisLabelFormat: '{value} Million',
        axisLabelColor: '#999999',
        enableZoom: true,
        barWidth: 40,
        barGap: 30,
        gradientStartColor: '#83bff6',
        gradientMiddleColor: '#188df0',
        gradientEndColor: '#188df0'
      }
      
      this.render()
    }

    // Getters and setters for properties
    get title() { return this._props.title }
    set title(value) { 
      this._props.title = value
      this.render()
    }

    getTitle() {
      return this._props.title
    }

    setTitle(value) {
      this._props.title = value
      this.render()
    }

    get titleFontSize() { return this._props.titleFontSize }
    set titleFontSize(value) { 
      this._props.titleFontSize = value
      this.render()
    }

    getTitleFontSize() {
      return this._props.titleFontSize
    }

    setTitleFontSize(value) {
      this._props.titleFontSize = value
      this.render()
    }

    get titleColor() { return this._props.titleColor }
    set titleColor(value) { 
      this._props.titleColor = value
      this.render()
    }

    getTitleColor() {
      return this._props.titleColor
    }

    setTitleColor(value) {
      this._props.titleColor = value
      this.render()
    }

    get axisLabelFormat() { return this._props.axisLabelFormat }
    set axisLabelFormat(value) { 
      this._props.axisLabelFormat = value
      this.render()
    }

    getAxisLabelFormat() {
      return this._props.axisLabelFormat
    }

    setAxisLabelFormat(value) {
      this._props.axisLabelFormat = value
      this.render()
    }

    get axisLabelColor() { return this._props.axisLabelColor }
    set axisLabelColor(value) { 
      this._props.axisLabelColor = value
      this.render()
    }

    getAxisLabelColor() {
      return this._props.axisLabelColor
    }

    setAxisLabelColor(value) {
      this._props.axisLabelColor = value
      this.render()
    }

    get enableZoom() { return this._props.enableZoom }
    set enableZoom(value) { 
      this._props.enableZoom = value
      this.render()
    }

    getEnableZoom() {
      return this._props.enableZoom
    }

    setEnableZoom(value) {
      this._props.enableZoom = value
      this.render()
    }

    get barWidth() { return this._props.barWidth }
    set barWidth(value) { 
      this._props.barWidth = value
      this.render()
    }

    getBarWidth() {
      return this._props.barWidth
    }

    setBarWidth(value) {
      this._props.barWidth = value
      this.render()
    }

    get barGap() { return this._props.barGap }
    set barGap(value) { 
      this._props.barGap = value
      this.render()
    }

    getBarGap() {
      return this._props.barGap
    }

    setBarGap(value) {
      this._props.barGap = value
      this.render()
    }

    get gradientStartColor() { return this._props.gradientStartColor }
    set gradientStartColor(value) { 
      this._props.gradientStartColor = value
      this.render()
    }

    getGradientStartColor() {
      return this._props.gradientStartColor
    }

    setGradientStartColor(value) {
      this._props.gradientStartColor = value
      this.render()
    }

    get gradientMiddleColor() { return this._props.gradientMiddleColor }
    set gradientMiddleColor(value) { 
      this._props.gradientMiddleColor = value
      this.render()
    }

    getGradientMiddleColor() {
      return this._props.gradientMiddleColor
    }

    setGradientMiddleColor(value) {
      this._props.gradientMiddleColor = value
      this.render()
    }

    get gradientEndColor() { return this._props.gradientEndColor }
    set gradientEndColor(value) { 
      this._props.gradientEndColor = value
      this.render()
    }

    getGradientEndColor() {
      return this._props.gradientEndColor
    }

    setGradientEndColor(value) {
      this._props.gradientEndColor = value
      this.render()
    }

    onCustomWidgetResize (width, height) {
      this.render()
    }

    onCustomWidgetAfterUpdate (changedProps) {
      Object.assign(this._props, changedProps)
      this.render()
    }

    async render () {
      try {
        if (!window.echarts) {
          await getScriptPromisify('https://cdn.jsdelivr.net/npm/echarts@5.5.1/dist/echarts.min.js')
        }

        if (this._myChart) {
          echarts.dispose(this._myChart)
        }
        
        if (!this.myDataBinding || this.myDataBinding.state !== 'success') { 
          console.warn('Bar Gradient: No data binding or unsuccessful data state')
          return 
        }

        const myChart = this._myChart = echarts.init(this._root)
        const { option, data, dataAxis } = getOption(this.myDataBinding, this._props)
        myChart.setOption(option)

        // Enable data zoom when user click bar only if zoom is enabled
        if (this._props.enableZoom) {
          const zoomSize = 6
          myChart.on('click', function (params) {
            myChart.dispatchAction({
              type: 'dataZoom',
              startValue: dataAxis[Math.max(params.dataIndex - zoomSize / 2, 0)],
              endValue: dataAxis[Math.min(params.dataIndex + zoomSize / 2, data.length - 1)]
            })
          })
        }
      } catch (error) {
        console.error('Bar Gradient: Error rendering chart:', error)
      }
    }
  }

  customElements.define('com-insightcubes-sac-bargradient_1.x', Main)
})()
