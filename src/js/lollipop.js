import {colourScheme, margin} from "./style.js"
import {numberWithCommas} from "./utils.js"

const circleScale = data => {
  return d3.scaleLinear()
    .domain([0, d3.max(data, d => d.value)])
    .range([Math.PI * 2, Math.PI * 5])
}

/**
 *
 * @param name
 * @param height
 * @param width
 * @param data
 * @param xKey
 * @param yKey
 * @returns {jQuery}
 */
const buildLollipopChart = (name, height, width, data, xKey = 'value', yKey = 'reading') => {
  const chart = _createSVGContainer(height)

  data[0][yKey] = "Cases"
  data[1][yKey] = "Deaths"
  data[2][yKey] = "Recoveries"

  // Axes
  const x = _getXAxis(data, width)
  const y = _getYAxis(height, data.map(item => item[yKey]))
  _drawAxes(chart, height, x, y)
  const circleSize = circleScale(data)
  // Lines
  chart.selectAll(`line${name}lollipop`)
    .data(data)
    .enter()
    .append('line')
    .attr('x1', d => x(d[xKey]))
    .attr('x2', x(0))
    .attr('y1', d => y(d[yKey]))
    .attr('y2', d => y(d[yKey]))
    .attr('stroke', 'grey')
    .attr('stroke-width', 2)

  // Labels
  chart.selectAll(`text${name}lollipop`)
    .data(data)
    .enter()
    .append('text')
    .attr('x', (d, i) => {
      if (i === 0) {
        return x(d[xKey]) + 45
      } else if (i === 1) {
        return x(d[xKey]) + 15
      } else if (i === 2) {
        return x(d[xKey]) + 40
      }
    })
    .attr('y', (d, i) => {
      if (i === 0) {
        return y(d[yKey]) + ((x(d[xKey]) * 0.06) / 4)
      } else {
        return y(d[yKey]) + ((x(d[xKey]) * 0.1) / 4)
      }
    })
    .attr('fill', "black")
    .text(d => numberWithCommas(d[xKey]))
    .style('font-size', "12px")

  // Circles
  chart.selectAll(`circle${name}lollipop`)
    .data(data)
    .enter()
    .append('circle')
    .attr('cx', (d) => x(d[xKey]))
    .attr('cy', (d) => y(d[yKey]))
    .attr('r', (d, i) => circleSize(d[xKey]))
    .style('fill', (d, i) => {
      if (i === 0) {
        return colourScheme.warning
      } else if (i === 1) {
        return colourScheme.danger
      } else {
        return colourScheme.success
      }
    })
    .attr('stroke', colourScheme.secondary)
  chart.selectAll(`circle${name}lollipop`)
    .transition()
    .duration(2000)
    .attr('cx', d => x(d[xKey]))

  chart.selectAll(`line${name}lollipop`)
    .transition()
    .duration(2000)
    .attr('x1', d => x(d[xKey]))

  return chart
}

/**
 * Creates the SVG that will hold the lollipop chart.
 * @param height
 * @returns {jQuery}
 * @private
 */
const _createSVGContainer = (height) => {
  d3.select('#case-breakdown').select('svg').remove()
  return d3.select("#case-breakdown")
    .append("svg")
    .attr("width", "100%")
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + margin.lollipopChart + ",0)")
}

/**
 * Create X axis.
 * @param data
 * @param width
 * @returns {*}
 */
const _getXAxis = (data, width) => {
  return d3.scaleLinear()
    .domain([0, d3.max(data, function (d) {
      return d.value + 700000
    })])
    .range([0, width - margin.lollipopChart])
}

/**
 * Create Y axis.
 * @param height
 * @param categories
 * @returns {*}
 */
const _getYAxis = (height, categories) => d3.scaleBand()
  .range([0, height - margin.lollipopChart])
  .domain(categories)
  .padding(1)

/**
 * Draw the axes.
 * @param chart
 * @param height
 * @param xAxisFunction
 * @param yAxisFunction
 */
const _drawAxes = (chart, height, xAxisFunction, yAxisFunction) => {
  chart.append('g')
    .attr('transform', 'translate(0, ' + (height - margin.lollipopChart) + ')')
    .call(d3.axisBottom(xAxisFunction))
    .selectAll('text')
    .attr('transform', 'translate(0,10)rotate(-45)')
    .style('text-anchor', 'end')
    .style('font-size', "12px")
  chart.append('g')
    .call(d3.axisLeft(yAxisFunction))
    .style('font-size', "12px")
}

/**
 * Delete lines and circles in the lollipop chart.
 * @param svgElement
 */
const deleteLollipopChart = (svgElement) => {
  svgElement.selectAll("line").remove()
  svgElement.selectAll("circle").remove()
}

export {
  buildLollipopChart,
  deleteLollipopChart
}
